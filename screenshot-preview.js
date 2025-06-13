function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function updateWebsiteScreenshot(url) {
    const preview = document.getElementById("previewwebsite");
    if (isValidUrl(url)) {
      preview.src = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`;
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    let foundUrl = null;

    // Check keys and decoded keys for a valid URL
    for (const key of params.keys()) {
      if (isValidUrl(key)) {
        foundUrl = key;
        break;
      }
      const decoded = decodeURIComponent(key);
      if (isValidUrl(decoded)) {
        foundUrl = decoded;
        break;
      }
    }

    if (foundUrl) {
      const input = document.getElementById("urlInput");
      input.value = foundUrl;
      updateWebsiteScreenshot(foundUrl);
    }
  });

  // Update preview on input change
  document.getElementById("urlInput").addEventListener("input", (e) => {
    updateWebsiteScreenshot(e.target.value.trim());
  });
