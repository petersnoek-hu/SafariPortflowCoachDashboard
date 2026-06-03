browser.runtime.onMessage.addListener((message, sender) => {
  if (message && message.type === 'refresh') {
    return Promise.resolve({ ok: true, refreshedAt: Date.now() });
  }
  if (message && message.greeting === 'hello') {
    return Promise.resolve({ reply: 'hi from background' });
  }
});

// Luister naar network requests op de achtergrond.
// Dit is veel betrouwbaarder dan het proberen te patchen van window.fetch in een Safari Extension.
chrome.webRequest.onSendHeaders.addListener(
  function(details) {
    if (details.requestHeaders) {
      for (let header of details.requestHeaders) {
        if (header.name.toLowerCase() === 'authorization' && header.value.startsWith('Bearer ')) {
          console.log("[Portflow Ext] Bearer token onderschept via webRequest API!");
          const token = header.value.slice(7);
          
          chrome.storage.local.set({ portflow_token: { token, timestamp: Date.now() } });
          try { chrome.storage.session.set({ portflow_token: { token, timestamp: Date.now() } }); } catch(e) {}
          break;
        }
      }
    }
  },
  { urls: ["*://*.portflow.io/*", "*://*.hu.nl/*"] },
  ["requestHeaders"]
);
