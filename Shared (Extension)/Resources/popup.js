// popup.js: Reads Bearer token from chrome.storage.session, manages UI & copy button

document.addEventListener('DOMContentLoaded', async () => {
  const waiting = document.getElementById('waiting');
  const tokenSection = document.getElementById('tokenSection');
  const tokenArea = document.getElementById('token');
  const copyButton = document.getElementById('copyButton');
  const timestampSpan = document.getElementById('timestamp');

  // Helper: time ago string
  function timeAgo(ts) {
    const now = Date.now();
    const diff = Math.floor((now - ts) / 1000);
    if (diff < 60) return `${diff} sec geleden`;
    if (diff < 3600) return `${Math.floor(diff/60)} min geleden`;
    const d = new Date(ts);
    return d.toLocaleString('nl-NL');
  }

  // Read session storage
  // Check both local and session storage
  let portflow_token;
  try {
    const sessionData = await chrome.storage.session.get('portflow_token');
    portflow_token = sessionData.portflow_token;
  } catch (e) {}

  if (!portflow_token) {
    const localData = await chrome.storage.local.get('portflow_token');
    portflow_token = localData.portflow_token;
  }

  // Maximize knop logic verplaatsen we naar boven de return zodat deze altijd werkt
  const maximizeButton = document.getElementById('maximizeButton');
  maximizeButton.addEventListener('click', async () => {
    try {
      // Zoek de actieve tab.
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        maximizeButton.textContent = 'Actieve tab niet beschikbaar';
        setTimeout(() => maximizeButton.textContent = 'Maximaliseer Portflow (Verberg Canvas)', 2000);
        return;
      }
      
      // Laat de content script hetzelfde overlay-knopje klikken als de werkende UI in Canvas.
      chrome.tabs.sendMessage(tab.id, { action: 'toggle_portflow_with_overlay_button' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
        }
        
        if (!response || !response.success) {
          maximizeButton.textContent = 'Niet gevonden op deze pagina';
          setTimeout(() => maximizeButton.textContent = 'Maximaliseer Portflow (Verberg Canvas)', 2000);
        } else {
          maximizeButton.textContent = response.maximized ? 'Herstel weergave' : 'Maximaliseer Portflow (Verberg Canvas)';
        }
      });
    } catch (e) {
      console.error(e);
    }
  });

  if (!portflow_token || !portflow_token.token) {
    waiting.style.display = '';
    tokenSection.style.display = 'none';
    return;
  }

  // Show the token + timestamp
  waiting.style.display = 'none';
  tokenSection.style.display = '';
  tokenArea.value = portflow_token.token;
  timestampSpan.textContent = timeAgo(portflow_token.timestamp);

  // Copy logic
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(portflow_token.token);
      const original = copyButton.textContent;
      copyButton.textContent = 'Gekopieerd!';
      copyButton.disabled = true;
      setTimeout(() => {
        copyButton.textContent = original;
        copyButton.disabled = false;
      }, 2000);
    } catch (e) {
      copyButton.textContent = 'Fout bij kopiëren';
    }
  });
});
