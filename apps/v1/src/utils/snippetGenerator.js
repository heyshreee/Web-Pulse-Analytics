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

  const vanillaCountSnippet = `<div id="visitor-count">Loading...</div>
<script>
async function trackAndCount() {
  const res = await fetch("${trackingUrl}", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pageUrl: window.location.href,
      title: document.title
    })
  });
  const data = await res.json();
  if (data.count !== undefined) {
    document.getElementById("visitor-count").innerText = data.count + " Visits";
  }
}
trackAndCount();
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
export default function VisitorCounter() {
  const [visits, setVisits] = useState("Loading...");

  useEffect(() => {
    async function trackAndLoad() {
      try {
        // Unified Call: Records visit AND returns updated count
        const res = await fetch("${trackingUrl}", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageUrl: window.location.href,
            title: document.title,
            referrer: document.referrer
          })
        });
        
        const data = await res.json();
        if (data.count !== undefined) {
          setVisits(\`\${data.count} Visits\`);
        }
      } catch (e) {
        setVisits("0 Visits");
      }
    }

    trackAndLoad();
    const interval = setInterval(trackAndLoad, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{visits}</span>
    </div>
  );
}`;

  const nodeSnippet = `const axios = require('axios');

// 🚀 Track & Get Live Count (Unified)
async function trackVisit() {
  const res = await axios.post("${trackingUrl}", {
    pageUrl: "https://example.com",
    title: "Home Page"
  });
  return res.data.count; // The updated count is in the response!
}

// Analytics Only (Read-only)
async function getCount() {
  const res = await axios.get("${countUrl}", {
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

  const curlGuide = `# 1. Track Visit & Get Count (Unified)
curl.exe -X POST ${trackingUrl} \`
  -H "Content-Type: application/json" \`
  -d '{"pageUrl": "https://example.com", "title": "Home Page"}'

# 2. Get Count Only (Read-only)
curl.exe ${countUrl} -H "x-api-key: ${trackingId}"

# 3. Track Custom Event
curl.exe -X POST ${eventsUrl} \`
  -H "x-api-key: ${trackingId}" \`
  -H "Content-Type: application/json" \`
  -d '{"event": "button_click", "url": "https://example.com"}'`;

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
