window.addEventListener('load', () => {
  // Default fallback templates
  let autoTrafficTemplates = [
    "https://archive.ph/submit/?anyway=1&url=[ENCODE_URL]",
    "https://archive.ph/[URL]",
    "https://web.archive.org/save/[URL]",
    "https://web.archive.org/web/[URL]",
    "https://web.archive.org/web/*/[URL]",
    "https://archive.today/?run=1&url=[ENCODE_URL]",
    "https://archive.ph/submit/?url=[ENCODE_URL]"
  ];

  // List of potential JSON sources for target URLs
  const urlJsonSources = [
    "https://trafficgenerator.github.io/api/urls-1.json",
    "https://traffic-exchange.github.io/api/urls-2.json",
    "https://traffic-exchange.github.io/api/urls-3.json"
  ];

  const iframes = [];
  const targetUrls = [];

  // Create 15 hidden iframes
  for (let i = 0; i < 15; i++) {
    const iframe = document.createElement('iframe');
    iframe.classList.add('loop', 'hidden-iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
    iframes.push(iframe);
  }

  // Try to fetch template list
  fetch('https://trafficgenerator.github.io/api/traffic-templates.json')
    .then(res => res.ok ? res.json() : Promise.reject("Template fetch failed"))
    .then(data => {
      if (Array.isArray(data) && data.length) {
        autoTrafficTemplates = data;
        console.log("✅ Templates loaded from remote.");
      } else {
        console.warn("⚠️ Remote templates invalid, using defaults.");
      }
    })
    .catch(err => {
      console.warn("⚠️ Failed to load remote templates. Using defaults. Reason:", err.message);
    });

  // Load target URLs from first working JSON source
  async function loadTargetUrlsFromSources(sources) {
    for (let source of sources) {
      try {
        const res = await fetch(source);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          targetUrls.push(...data);
          console.log(`✅ Loaded ${data.length} URLs from ${source}`);
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

  // Replaces placeholders with raw/encoded URLs
  function buildFinalUrl(template, rawUrl) {
    const encoded = encodeURIComponent(rawUrl);
    return template
      .replace(/\[ENCODE_URL\]|\{\{ENCODE_URL\}\}/g, encoded)
      .replace(/\[URL\]|\{\{URL\}\}/g, rawUrl);
  }

  // Set new URLs into iframes every 15 seconds
  function startIframeLoop() {
    if (!targetUrls.length || !autoTrafficTemplates.length) {
      console.error("🚫 Cannot start loop: Missing templates or URLs.");
      return;
    }

    function updateIframes() {
      for (let iframe of iframes) {
        const template = autoTrafficTemplates[Math.floor(Math.random() * autoTrafficTemplates.length)];
        const target = targetUrls[Math.floor(Math.random() * targetUrls.length)];
        const finalUrl = buildFinalUrl(template, target);
        iframe.src = finalUrl;
      }
      // Prevent accidental scroll
      window.scrollTo(0, 0);
    }

    updateIframes();
    setInterval(updateIframes, 60000);//15000
  }

  // Full start
  loadTargetUrlsFromSources(urlJsonSources).then(startIframeLoop);
});
