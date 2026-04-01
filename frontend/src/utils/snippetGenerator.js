/**
 * Utility to generate tracking snippets for various frameworks and languages.
 */
export const getSnippets = ({ trackingId, trackingUrl, user, project }) => {
  const apiBaseUrl = trackingUrl.replace(new RegExp(`/track/${trackingId}$`), '');
  const scriptUrl = `${apiBaseUrl}/track/script.js`;
  const eventsUrl = `${apiBaseUrl}/track/events`;
  const countUrl = `${apiBaseUrl}/analytics/count`;

  const vanillaSnippet = `<!-- SaaS Analytics Tracking SDK -->
<script src="${scriptUrl}"></script>
<script>
  tracker('init', '${trackingId}');
  tracker('track', 'page_view');
</script>`;

  const vanillaCountSnippet = `<div id="view-count">Loading...</div>

<script>
async function loadCount() {
  const res = await fetch("${countUrl}", {
    headers: {
      "x-api-key": "${trackingId}"
    }
  });

  const data = await res.json();
  document.getElementById("view-count").innerText = data.count + " Views";
}

loadCount();
setInterval(loadCount, 5000);
</script>`;

  const reactFragmentSnippet = `// 🧩 Tracker Script (SDK) Usage in React
import { useEffect } from 'react';

export default function AnalyticsProvider({ children }) {
  useEffect(() => {
    // Load script
    const script = document.createElement('script');
    script.src = "${scriptUrl}";
    script.async = true;
    script.onload = () => {
      window.tracker('init', '${trackingId}');
      window.tracker('track', 'page_view');
    };
    document.head.appendChild(script);
  }, []);

  return children;
}`;

  const reactFooterSnippet = `import React, { useEffect, useState } from "react";

/**
 * Modern Visitor Counter Footer
 * Implementation for: ${project.name}
 */
export default function Footer() {
  const [visits, setVisits] = useState("Loading...");

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch("${countUrl}", {
          headers: { "x-api-key": "${trackingId}" }
        });
        const data = await res.json();
        setVisits(\`\${data.count} Visits\`);
      } catch (e) {
        setVisits("0 Visits");
      }
    }

    loadCount();
    const interval = setInterval(loadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="py-12 border-t border-slate-800 text-center">
      <div className="flex justify-center items-center gap-2 text-xs text-slate-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>{visits}</span>
      </div>
    </footer>
  );
}`;

  const nodeSnippet = `const axios = require('axios');

// 1. Track Events
async function trackEvent(eventName, pageUrl) {
  await axios.post("${eventsUrl}", {
    event: eventName,
    url: pageUrl,
    referrer: "server-side"
  }, {
    headers: { "x-api-key": "${trackingId}" }
  });
}

// 2. Get Event Count
async function getCount(url = null) {
  const endpoint = url ? \`${countUrl}?url=\${url}\` : "${countUrl}";
  const res = await axios.get(endpoint, {
    headers: { "x-api-key": "${trackingId}" }
  });
  return res.data.count;
}`;

  const phpSnippet = `<?php
// 1. Track Event
$data = [
    'event' => 'page_view',
    'url' => 'https://example.com',
    'referrer' => 'https://google.com'
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\\r\\nx-api-key: ${trackingId}\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context  = stream_context_create($options);
file_get_contents("${eventsUrl}", false, $context);

// 2. Get Count
$count_opts = [
    'http' => [ 'header' => "x-api-key: ${trackingId}\\r\\n" ]
];
$count_ctx = stream_context_create($count_opts);
$res = file_get_contents("${countUrl}", false, $count_ctx);
$data = json_decode($res, true);
echo $data['count'];
?>`;

  const pythonSnippet = `import requests

headers = { "x-api-key": "${trackingId}" }

# 1. Track Event
requests.post("${eventsUrl}", json={
    "event": "page_view",
    "url": "https://example.com"
}, headers=headers)

# 2. Get Count
res = requests.get("${countUrl}", headers=headers)
print(res.json()["count"])`;

  const curlGuide = `# 1. Track Event (Windows PowerShell)
curl.exe -X POST ${eventsUrl} \`
  -H "x-api-key: ${trackingId}" \`
  -H "Content-Type: application/json" \`
  -d '{\"event\": \"page_view\", \"url\": \"https://example.com\"}'

# 2. Get Total Count
curl.exe ${countUrl} -H "x-api-key: ${trackingId}"

# 3. Get Count by Page
curl.exe "${countUrl}?url=/pricing" -H "x-api-key: ${trackingId}"`;

  const vueSnippet = `<template>
  <div class="visitor-count">
    Total Views: {{ count }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const count = ref('Loading...');

onMounted(() => {
  // 1. Initialize Tracker SDK
  const script = document.createElement('script');
  script.src = "${scriptUrl}";
  script.async = true;
  script.onload = () => {
    window.tracker('init', '${trackingId}');
    window.tracker('track', 'page_view');
  };
  document.head.appendChild(script);

  // 2. Fetch Live Count
  async function loadCount() {
    try {
      const res = await fetch("${countUrl}", {
        headers: { "x-api-key": "${trackingId}" }
      });
      const data = await res.json();
      count.value = data.count + " Views";
    } catch (e) {
      count.value = "0 Views";
    }
  }

  loadCount();
});
</script>`;

  return {
    vanilla: vanillaSnippet,
    'vanilla-count': vanillaCountSnippet,
    react: reactFragmentSnippet,
    'react-footer': reactFooterSnippet,
    vue: vueSnippet,
    node: nodeSnippet,
    php: phpSnippet,
    python: pythonSnippet,
    curl: curlGuide
  };
};

export const getSnippetLanguage = (snippetType) => {
  const languages = {
    react: 'javascript',
    'react-footer': 'javascript',
    node: 'javascript',
    vue: 'html',
    php: 'php',
    python: 'python',
    curl: 'powershell',
    vanilla: 'html',
    'vanilla-count': 'html'
  };
  return languages[snippetType] || 'html';
};
