/**
 * Utility to generate tracking snippets for various frameworks and languages.
 */
export const getSnippets = ({ trackingId, trackingUrl, user, project }) => {
  const vanillaSnippet = `<script>
(function() {
  const TRACKING_ID = "${trackingId}";
  const ENDPOINT = "${trackingUrl}";

  function track() {
    navigator.sendBeacon(
      ENDPOINT,
      JSON.stringify({
        pageUrl: location.href,
        referrer: document.referrer || null,
        screen: {
          width: screen.width,
          height: screen.height
        }
      })
    );
  }

  track();
})();
</script>`;

  const vanillaCountSnippet = `<div id="visitor-count">Loading...</div>
<script>
(function() {
  const trackingId = "${trackingId}";
  const apiUrl = "${trackingUrl}";
  const display = document.getElementById('visitor-count');

  // 1. Get count
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.count !== undefined) display.innerText = data.count + " Visits";
    });

  // 2. Track visit
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pageUrl: window.location.href,
      referrer: document.referrer,
      title: document.title
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.count !== undefined) display.innerText = data.count + " Visits";
    });
})();
</script>`;

  const reactSnippet = `import React, { useEffect, useState } from 'react';

export default function VisitorCounter() {
  const [count, setCount] = useState(0);
  const apiUrl = "${trackingUrl}";

  useEffect(() => {
    // 1. Initial count fetch
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => data.count !== undefined && setCount(data.count));

    // 2. Track visit
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageUrl: window.location.href,
        referrer: document.referrer,
        title: document.title
      }),
    })
    .then(res => res.json())
    .then(data => data.count !== undefined && setCount(data.count))
    .catch(err => console.warn("Tracking failed:", err.message));
  }, []);

  return (
    <div className="visitor-badge">
      Live Visitors: {count}
    </div>
  );
}`;

  const reactFooterSnippet = `import React, { useEffect, useState } from "react";

/**
 * Modern Visitor Counter Footer
 * Implementation for: ${project.name}
 */
export default function Footer() {
  const [visits, setVisits] = useState("Loading...");
  const apiUrl = "${trackingUrl}";

  useEffect(() => {
    if (!apiUrl) return;

    // 1. Get count immediately for instant display
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setVisits(\`\${data.count} Visits\`);
        }
      })
      .catch(() => setVisits("0 Visits"));

    // 2. Track the visit in the background
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageUrl: window.location.href,
        referrer: document.referrer,
        title: document.title
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setVisits(\`\${data.count} Visits\`);
        }
      });
  }, []);

  return (
    <footer className="py-12 border-t border-slate-800 text-center">
      <p className="text-slate-500 text-sm mb-2">
        &copy; {new Date().getFullYear()} ${user?.name || 'Your Name'}. Designed. Engineered.
      </p>
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

  const vueSnippet = `<template>
  <div class="visitor-badge">
    Live Visitors: {{ count }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const count = ref(0);
const trackingId = "${trackingId}";
const apiUrl = "${trackingUrl}";

onMounted(() => {
  // 1. Track visit
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageUrl: window.location.href,
      referrer: document.referrer,
      title: document.title
    })
  })
  .then(res => res.json())
  .then(data => data.count && (count.value = data.count));

  // 2. Initial count fetch
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => data.count && (count.value = data.count));
});
<\\/script>`;

  const nodeSnippet = `const axios = require('axios');

const trackingId = "${trackingId}";
const apiUrl = "${trackingUrl}";

// 1. Track Server-side visit
async function trackVisit(pageUrl, referrer) {
  try {
    const response = await axios.post(apiUrl, {
      pageUrl: pageUrl,
      referrer: referrer || null,
      title: "Backend Tracked Page"
    });
    console.log("Current Count:", response.data.count);
    return response.data.count;
  } catch (error) {
    console.error("Tracking failed:", error.message);
  }
}

// 2. Just get count
async function getCount() {
  const response = await axios.get(apiUrl);
  return response.data.count;
}`;

  const phpSnippet = `<?php
$trackingId = "${trackingId}";
$apiUrl = "${trackingUrl}";

// 1. Track visit
$data = array(
    'pageUrl' => 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
    'referrer' => $_SERVER['HTTP_REFERER'] ?? null,
    'title' => 'PHP Tracked Page'
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ),
);

$context  = stream_context_create($options);
$result = file_get_contents($apiUrl, false, $context);
$response = json_decode($result, true);

echo "Total Visitors: " . ($response['count'] ?? 0);
?>`;

  const pythonSnippet = `import requests

tracking_id = "${trackingId}"
api_url = "${trackingUrl}"

# 1. Track visit
payload = {
    "pageUrl": "http://yourwebsite.com",
    "referrer": None,
    "title": "Python Tracked Page"
}

response = requests.post(api_url, json=payload)
data = response.json()

print(f"Live Count: {data.get('count', 0)}")

# 2. Get count only
count_data = requests.get(api_url).json()
print(f"Current Count: {count_data.get('count', 0)}")`;

  const urlGuide = `// TRACKING ENDPOINT (POST)
// Method: POST
// Content-Type: application/json
// Body: { "pageUrl": "...", "referrer": "...", "title": "..." }
${trackingUrl}

// COUNT ENDPOINT (GET)
// Method: GET
// Returns: { "count": number }
${trackingUrl}`;

  return {
    vanilla: vanillaSnippet,
    'vanilla-count': vanillaCountSnippet,
    react: reactSnippet,
    'react-footer': reactFooterSnippet,
    vue: vueSnippet,
    node: nodeSnippet,
    php: phpSnippet,
    python: pythonSnippet,
    url: urlGuide
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
    url: 'bash',
    vanilla: 'html',
    'vanilla-count': 'html'
  };
  return languages[snippetType] || 'html';
};
