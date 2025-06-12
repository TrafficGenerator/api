
// autosurf.js

// Utility: Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Default fallback templates
let autoTrafficTemplates = [
  "https://archive.ph/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.ph/[URL]",
  "https://web.archive.org/save/[URL]",
  "https://web.archive.org/web/[URL]",
  "https://web.archive.org/web/*/[URL]",
  "https://archive.ph/?run=1&url=[ENCODE_URL]",
  "https://archive.today/?run=1&url=[ENCODE_URL]",
  "https://archive.ph/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.today/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.ph/[ENCODE_URL]",
  "http://archive.today/[ENCODE_URL]"
];

// URL sources to shuffle and try in random order
const urlJsonSources = shuffleArray([
  "https://trafficgenerator.github.io/json-cache/autosurf-domains.json",
  "https://trafficgenerator.github.io/json-cache/backlink-generator.json",
  "https://trafficgenerator.github.io/json-cache/blogger-profile.json",
  "https://trafficgenerator.github.io/json-cache/blogger-reddit.json",
  "https://trafficgenerator.github.io/json-cache/referral.json"
]);

const iframes = [];
const targetUrls = [];

// Create 15 hidden iframes right away
for (let i = 0; i < 15; i++) {
  const iframe = document.createElement('iframe');
  iframe.classList.add('loop', 'hidden-iframe');
  iframe.src = 'about:blank';
  document.body.appendChild(iframe);
  iframes.push(iframe);
}

// Try fetching templates (but no delay if it fails)
fetch('https://trafficgenerator.github.io/api/traffic-templates.json')
  .then(res => res.ok ? res.json() : Promise.reject("Template fetch failed"))
  .then(data => {
    if (Array.isArray(data) && data.length) {
      autoTrafficTemplates = data;
      console.log("✅ Templates loaded from remote.");
    }
  })
  .catch(err => {
    console.warn("⚠️ Using default templates. Reason:", err.message);
  });

// Fetch target URLs from first working JSON
async function loadTargetUrlsFromSources(sources) {
  for (let source of sources) {
    try {
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const shuffled = shuffleArray(data);
        targetUrls.push(...shuffled);
        console.log(`✅ Loaded & shuffled ${shuffled.length} URLs from ${source}`);
        return;
      } else {
        console.warn(`⚠️ Invalid data at ${source}`);
      }
    } catch (err) {
      console.warn(`❌ Failed to load ${source}: ${err.message}`);
    }
  }

  console.error("🚫 No working URL sources found.");
}

// Replaces placeholders with raw and encoded URLs
function buildFinalUrl(template, rawUrl) {
  const encoded = encodeURIComponent(rawUrl);
  return template
    .replace(/\[ENCODE_URL\]|\{\{ENCODE_URL\}\}/g, encoded)
    .replace(/\[URL\]|\{\{URL\}\}/g, rawUrl);
}

// Start iframe loop when URLs are ready
function startIframeLoop() {
  if (!targetUrls.length || !autoTrafficTemplates.length) {
    console.error("🚫 Cannot start loop: Missing templates or URLs.");
    return;
  }

  function buildAndSetUrl(iframe) {
    const template = autoTrafficTemplates[Math.floor(Math.random() * autoTrafficTemplates.length)];
    const target = targetUrls[Math.floor(Math.random() * targetUrls.length)];
    const finalUrl = buildFinalUrl(template, target);
    iframe.src = finalUrl;
  }

  for (let iframe of iframes) {
    iframe.onload = () => {
      setTimeout(() => {
        buildAndSetUrl(iframe);
      }, 15000); // wait 15 sec after load
    };

    // Initial load
    buildAndSetUrl(iframe);
  }
}

// Start everything
loadTargetUrlsFromSources(urlJsonSources).then(startIframeLoop);
