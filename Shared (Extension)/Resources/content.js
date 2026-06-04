// content.js
// Luistert naar berichten vanuit de popup om de Portflow iframe te maximaliseren

(function() {
  if (window !== window.top) {
    // --- We bevinden ons in een iframe (zoals Portflow) ---
    if (window.location.href.includes('portfolio.drieam.app') || window.location.href.includes('portflow')) {
      const initPortflowModifications = () => {
        const interval = setInterval(() => {
          // Zoek naar het "Coaching dashboard" menu item (diepste element met de tekst)
          const allEls = Array.from(document.querySelectorAll('a, span, div, li'));
          const coachEl = allEls.find(el => el.textContent && el.textContent.trim() === 'Coaching dashboard' && el.children.length === 0);
          
          if (coachEl) {
            // Check of ons item al is toegevoegd
            if (document.getElementById('open-ict-menu-item')) {
              clearInterval(interval);
              return;
            }
            
            clearInterval(interval);
            
            // Zoek de omhullende <li> of <a> lijst of link tag
            let targetElement = coachEl;
            const linkParent = coachEl.closest('a');
            const listParent = coachEl.closest('li');
            
            if (listParent) {
              targetElement = listParent;
            } else if (linkParent) {
              targetElement = linkParent;
            }
            
            // Bouw het menu item helemaal opnieuw op (niet klonen) zodat de
            // opmaak exact overeenkomt met de andere nav-items en er geen
            // stale inline styles of klasse-conflicten optreden.
            const openIctItem = document.createElement('li');
            openIctItem.id = 'open-ict-menu-item';
            openIctItem.className = 'ant-menu-item ant-menu-item-only-child';
            openIctItem.setAttribute('role', 'menuitem');
            openIctItem.setAttribute('tabindex', '-1');
            // Uniek data-menu-id zodat Ant Design het niet verwart met "Coaching dashboard"
            openIctItem.setAttribute('data-menu-id', 'rc-menu-uuid-/open-ict');
            const iconSpan = document.createElement('span');
            iconSpan.setAttribute('role', 'img');
            iconSpan.className = 'anticon ant-menu-item-icon';
            iconSpan.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;';
            iconSpan.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 5.346 32.394 27.764" width="1.17em" height="1em" fill="none" aria-hidden="true">
                <path fill="#00A1E1" d="M13.882 5.346h-4.63v11.567h4.63zM13.882 21.542h-4.63V33.11h4.63zM4.63 5.346H0v27.763h4.63z"/>
                <path fill="#E6302B" d="M32.394 19.228V5.345h-4.63v13.881a2.316 2.316 0 1 1-4.623 0V5.346h-4.63v13.881a6.945 6.945 0 1 0 13.883 0"/>
              </svg>`;
            openIctItem.appendChild(iconSpan);
            const titleSpan = document.createElement('span');
            titleSpan.className = 'ant-menu-title-content';
            titleSpan.textContent = 'Open ICT';
            openIctItem.appendChild(titleSpan);

            // Reset 'actieve' state voor de knop heel doelgericht
            const stripActiveState = (el) => {
              const classesToRemove = Array.from(el.classList).filter(c => 
                c.toLowerCase().includes('active') || 
                c.toLowerCase().includes('current') ||
                c.toLowerCase().includes('selected')
              );
              if (classesToRemove.length > 0) {
                  el.classList.remove(...classesToRemove);
              }
              el.removeAttribute('aria-current');
              el.removeAttribute('data-active');
              // Reset ook eventuele inline styles die Ant Design heeft gezet
              el.style.removeProperty('color');
              el.style.removeProperty('font-weight');
            };
            
            // Zoek / maak de container voor de volledige 'eigen' pagina
            let customPage = document.getElementById('portflow-ext-custom-page');
            if (!customPage) {
              customPage = document.createElement('div');
              customPage.id = 'portflow-ext-custom-page';
              customPage.style.display = 'none';
              customPage.className = '_contentContainerWrapper_1i5nl_1';
              customPage.innerHTML = `
                <main class="_content_cun6s_1" id="open-ict-main">
                  <h1 class="ant-typography _title3_clkra_27 css-tql0nm css-var-r1">Open ICT aanpassingen</h1>
                  <span class="ant-typography css-tql0nm css-var-r1">Welkom op het (tijdelijke) Open ICT Dashboard prototype. Hierin kun je in de toekomst opdrachten en overzichten laden die je nodig hebt voor je coaching.</span>
                  <div class="ant-space css-tql0nm ant-space-vertical _space_obrli_1 css-var-r1" style="gap: 16px;"></div>
                </main>
              `;
            }

            // Hulpfuncties: toon/verberg de custom pagina in de Portflow content area
            const showCustomPage = () => {
              const contentArea = document.querySelector('.ant-layout-content') || document.querySelector('main') || document.body;
              if (!contentArea.contains(customPage)) {
                contentArea.appendChild(customPage);
              }
              Array.from(customPage.parentElement.children).forEach(child => {
                if (child !== customPage) {
                  child.dataset.portflowHidden = 'true';
                  child.style.display = 'none';
                }
              });
              customPage.style.display = 'block';
            };

            const hideCustomPage = () => {
              const parent = customPage.parentElement;
              if (parent) {
                Array.from(parent.children).forEach(child => {
                  if (child !== customPage && child.dataset.portflowHidden === 'true') {
                    delete child.dataset.portflowHidden;
                    child.style.display = '';
                  }
                });
              }
              customPage.style.display = 'none';
            };

            // Luister in de header naar clicks om onze custom view *uit* te zetten indien andere navigatie
            const topNav = targetElement.closest('ul') || targetElement.closest('nav') || targetElement.parentNode;
            if (topNav) {
                topNav.addEventListener('click', (e) => {
                    // Check of we echt op een (andere) knop in het bestaande menu drukken
                    const clickedMenuItem = e.target.closest('li') || e.target.closest('a');
                    if (clickedMenuItem && clickedMenuItem !== openIctItem && !openIctItem.contains(e.target)) {
                        hideCustomPage();
                        stripActiveState(openIctItem);
                    }
                });
            }
            
            // Voeg click event toe voor Ónze eigen knop
            openIctItem.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Verwijder eerst visueel de actieve statussen van buur-elementen
              if (topNav) {
                Array.from(topNav.querySelectorAll('li, a, span, div')).forEach(stripActiveState);
              }

              // Geef onze eigen knop expliciet de Ant Design selected class
              openIctItem.classList.add('ant-menu-item-selected');

              showCustomPage();
            });
            
            // Voeg in in het menu nà het Coaching Dashboard
            if (targetElement.parentNode) {
              targetElement.parentNode.insertBefore(openIctItem, targetElement.nextSibling);
              
              // Portflow is waarschijnlijk een React/Vue/Angular App. Als er van view verandert wordt 
              // hertelt de applicatie soms (delen van) de DOM tree en zou onze knop weer kunnen verdwijnen.
              const observer = new MutationObserver(() => {
                if (!document.getElementById('open-ict-menu-item')) {
                    observer.disconnect();
                    initPortflowModifications();
                }
              });
              observer.observe(targetElement.parentNode, { childList: true });
            }
          }
        }, 1000); // Check elke 1 sec of Portflow geladen / getekend is.
      };
      
      initPortflowModifications();

      // Automatisch de "Evaluatieverzoeken" tab selecteren op "Mijn toegang en verzoeken"
      const initDefaultTab = () => {
        let shouldAutoSelect = true;

        const trySelectEvaluatieverzoeken = () => {
          if (!shouldAutoSelect) return false;
          const allTabs = Array.from(document.querySelectorAll('[role="tab"]'));
          const evalTab = allTabs.find(el => el.textContent.trim() === 'Evaluatieverzoeken');
          if (!evalTab) return false;

          const isActive = evalTab.getAttribute('aria-selected') === 'true' ||
                           evalTab.classList.contains('ant-tabs-tab-active');
          shouldAutoSelect = false;
          if (!isActive) evalTab.click();
          return true;
        };

        const onNavigation = () => {
          shouldAutoSelect = true;
          let attempts = 0;
          const iv = setInterval(() => {
            attempts++;
            if (trySelectEvaluatieverzoeken() || attempts > 20) clearInterval(iv);
          }, 250);
        };

        // Onderschep SPA-navigatie (React gebruikt history.pushState)
        const origPushState = history.pushState;
        history.pushState = function(...args) {
          origPushState.apply(this, args);
          onNavigation();
        };
        const origReplaceState = history.replaceState;
        history.replaceState = function(...args) {
          origReplaceState.apply(this, args);
          onNavigation();
        };
        window.addEventListener('popstate', onNavigation);

        // Initiële check bij laden
        onNavigation();
      };

      initDefaultTab();

      // Auto-navigeer naar een specifiek menu-item als het intent gezet is vanuit Canvas
      const initAutoNavigate = () => {
        let selectors = null;
        let currentIndex = 0;

        let attempts = 0;
        const iv = setInterval(async () => {
          attempts++;
          if (attempts > 120) { clearInterval(iv); return; } // max 60 sec

          if (!selectors) {
            const s = await chrome.storage.local.get('portflow_nav_intents');
            if (!s.portflow_nav_intents || !s.portflow_nav_intents.length) return;
            selectors = s.portflow_nav_intents;
            currentIndex = 0;
          }

          if (currentIndex >= selectors.length) {
            clearInterval(iv);
            await chrome.storage.local.remove('portflow_nav_intents');
            return;
          }

          const clickable = document.querySelector(selectors[currentIndex]);
          if (clickable) {
            clickable.click();
            currentIndex++;
            attempts = Math.max(0, attempts - 4); // herstart timer na elke succesvolle klik
          }
        }, 500);
      };

      initAutoNavigate();
    }
    // Code executie beëindigen: in een iframe willen we de maximalisatie Canvas CSS niet toevoegen.
    return;
  }

  // --- Top level frame (Canvas) logica ---
  // Voeg CSS rules toe aan de pagina voor maximalisatie
  const style = document.createElement('style');
  style.textContent = `
    .portflow-ext-maximized {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
    body.portflow-ext-no-scroll {
      overflow: hidden !important;
    }
    /* Verberg Canvas UI elementen die in de weg kunnen zitten vanwege Stacking Contexts */
    body.portflow-ext-no-scroll #header,
    body.portflow-ext-no-scroll #mobile-header,
    body.portflow-ext-no-scroll #left-side,
    body.portflow-ext-no-scroll .ic-app-nav-toggle-and-crumbs,
    body.portflow-ext-no-scroll #right-side-wrapper {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    /* Haal eventuele marges weg op de wrappers */
    body.portflow-ext-no-scroll .ic-Layout-wrapper,
    body.portflow-ext-no-scroll .ic-Layout-columns,
    body.portflow-ext-no-scroll .ic-app-main-content {
      margin: 0 !important;
      padding: 0 !important;
      max-width: 100% !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // Gemeenschappelijke staat voor de overlay-knop en de popup-knop
  let portflowMaximized = false;
  let portflowOverlayBtn = null;
  const portflowOverlayButtonId = 'portflow-ext-maximize-btn';
  const portflowTokenButtonId = 'portflow-ext-token-btn';
  let portflowTokenBtn = null;
  let portflowTokenPanel = null;

  const expandIcon  = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
  const lockIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="#c8a000"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;

  // Decodeer het JWT-payload om de vervaldatum (exp) te achterhalen.
  // Werkt puur client-side, zonder netwerkverzoek.
  const decodeJwtExpiry = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
      const data = JSON.parse(atob(padded));
      return typeof data.exp === 'number' ? data.exp * 1000 : null; // ms
    } catch(e) { return null; }
  };

  const loadTokenFromStorage = async () => {
    let tok;
    try { const s = await chrome.storage.session.get('portflow_token'); tok = s.portflow_token; } catch(_) {}
    if (!tok) { const l = await chrome.storage.local.get('portflow_token'); tok = l.portflow_token; }
    return tok || null;
  };

  // Vult het token-paneel met de meegegeven tokendata en toont de JWT-status.
  const updateTokenPanel = (portflow_token) => {
    if (!portflowTokenPanel) return;
    const tokenText    = portflowTokenPanel.querySelector('#portflow-ext-token-text');
    const tsSpan       = portflowTokenPanel.querySelector('#portflow-ext-token-ts');
    const expirySpan   = portflowTokenPanel.querySelector('#portflow-ext-token-expiry');
    const validityBadge = portflowTokenPanel.querySelector('#portflow-ext-token-validity');

    if (!portflow_token || !portflow_token.token) {
      tokenText.value = '(geen token beschikbaar)';
      tsSpan.textContent = '';
      expirySpan.textContent = '';
      validityBadge.textContent = '';
      validityBadge.style.cssText = '';
      return;
    }

    tokenText.value = portflow_token.token;

    // Hoe lang geleden vastgelegd
    const diff = Math.floor((Date.now() - portflow_token.timestamp) / 1000);
    let ago;
    if (diff < 60) ago = `${diff} sec geleden`;
    else if (diff < 3600) ago = `${Math.floor(diff / 60)} min geleden`;
    else ago = new Date(portflow_token.timestamp).toLocaleString('nl-NL');
    tsSpan.textContent = `vastgelegd: ${ago}`;

    // JWT-vervaldatum decoderen
    const expMs = decodeJwtExpiry(portflow_token.token);
    if (expMs) {
      const now = Date.now();
      const expired = now > expMs;
      const expDate = new Date(expMs).toLocaleString('nl-NL');
      if (expired) {
        expirySpan.textContent = `Verlopen op: ${expDate}`;
        expirySpan.style.color = '#c00';
        validityBadge.textContent = 'Verlopen';
        validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#fde;color:#c00;';
      } else {
        const remaining = Math.floor((expMs - now) / 60000);
        expirySpan.textContent = remaining > 60
          ? `Geldig tot: ${expDate}`
          : `Verloopt over: ${remaining} min`;
        expirySpan.style.color = remaining < 5 ? '#c80' : '#060';
        validityBadge.textContent = 'Geldig (JWT)';
        validityBadge.style.cssText = `font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:${remaining < 5 ? '#ffd' : '#dfd'};color:${remaining < 5 ? '#b60' : '#060'};`;
      }
    } else {
      expirySpan.textContent = 'Geen JWT-vervaldatum gevonden';
      expirySpan.style.color = '#999';
      validityBadge.textContent = 'Onbekend';
      validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#eee;color:#666;';
    }
  };
  const collapseIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

  const findPortflowIframe = () =>
    document.querySelector('iframe[data-lti-launch="true"]') ||
    document.querySelector('iframe.tool_launch') ||
    document.querySelector('iframe[title="Portflow"]') ||
    document.querySelector('iframe[name^="tool_content_"]');

  const togglePortflowMaximize = () => {
    const iframe = findPortflowIframe();
    if (!iframe) return false;
    portflowMaximized = !portflowMaximized;
    iframe.classList.toggle('portflow-ext-maximized', portflowMaximized);
    document.body.classList.toggle('portflow-ext-no-scroll', portflowMaximized);
    if (portflowOverlayBtn) {
      portflowOverlayBtn.innerHTML = portflowMaximized ? collapseIcon : expandIcon;
      portflowOverlayBtn.title = portflowMaximized ? 'Herstel venster' : 'Maximaliseer Portflow';
      if (portflowMaximized) {
        // Verplaats de knop naar body met vaste positie rechtsboven
        portflowOverlayBtn._toolbar = portflowOverlayBtn.parentElement;
        portflowOverlayBtn.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483647;background:rgba(255,255,255,0.92);border:1px solid #ccc;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;line-height:1;';
        document.body.appendChild(portflowOverlayBtn);
      } else {
        // Zet de knop terug in de toolbar
        portflowOverlayBtn.style.cssText = 'background:rgba(255,255,255,0.92);border:1px solid #ccc;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.15);display:inline-flex;align-items:center;justify-content:center;line-height:1;vertical-align:middle;margin-left:8px;';
        const toolbar = portflowOverlayBtn._toolbar || document.querySelector('.right-of-crumbs') || document.body;
        toolbar.appendChild(portflowOverlayBtn);
      }
    }
    return true;
  };

  const injectOverlayButton = () => {
    const existingButton = document.getElementById(portflowOverlayButtonId);
    if (existingButton) {
      portflowOverlayBtn = existingButton;
      return existingButton;
    }

    if (!findPortflowIframe()) return null;

    const toolbar = document.querySelector('.right-of-crumbs') ||
                    document.querySelector('.ic-app-nav-toggle-and-crumbs');
    const btn = document.createElement('button');
    btn.id = portflowOverlayButtonId;
    btn.innerHTML = expandIcon;
    btn.title = 'Maximaliseer Portflow';
    if (toolbar) {
      btn.style.cssText = 'background:rgba(255,255,255,0.92);border:1px solid #ccc;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.15);display:inline-flex;align-items:center;justify-content:center;line-height:1;vertical-align:middle;margin-left:8px;';
      toolbar.appendChild(btn);
    } else {
      // Fallback: fixed rechtsboven in het venster
      btn.style.cssText = 'position:fixed;z-index:9999;top:90px;right:10px;background:rgba(255,255,255,0.92);border:1px solid #ccc;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;line-height:1;';
      document.body.appendChild(btn);
    }
    portflowOverlayBtn = btn;
    btn.addEventListener('click', togglePortflowMaximize);
    return btn;
  };

  const injectTokenButton = () => {
    const existing = document.getElementById(portflowTokenButtonId);
    if (existing) { portflowTokenBtn = existing; return existing; }

    if (!findPortflowIframe()) return null;

    const toolbar = document.querySelector('.right-of-crumbs') ||
                    document.querySelector('.ic-app-nav-toggle-and-crumbs');

    // Drijvend paneel met token-weergave, vervaldatum en actieknoppen
    if (!portflowTokenPanel) {
      const panel = document.createElement('div');
      panel.id = 'portflow-ext-token-panel';
      panel.style.cssText = 'display:none;position:fixed;z-index:2147483646;background:#fff;border:1.5px solid #c8a000;border-radius:8px;padding:14px 16px;box-shadow:0 4px 18px rgba(0,0,0,0.18);min-width:340px;max-width:500px;';
      panel.innerHTML = `
        <div style="font-size:13px;font-weight:600;color:#b8860b;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <span>Bearer Token</span>
          <span id="portflow-ext-token-validity" style="font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;"></span>
        </div>
        <textarea id="portflow-ext-token-text" readonly style="width:100%;box-sizing:border-box;font-size:11px;font-family:monospace;border:1px solid #e0c060;border-radius:4px;padding:6px;resize:none;height:64px;background:#fffdf0;color:#333;"></textarea>
        <div style="margin-top:6px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
          <span id="portflow-ext-token-expiry" style="color:#666;"></span>
          <span id="portflow-ext-token-ts" style="color:#999;"></span>
        </div>
        <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:6px;">
          <button id="portflow-ext-token-clear" style="background:#fff;color:#c00;border:1px solid #f99;border-radius:4px;padding:5px 10px;cursor:pointer;font-size:12px;">Wis token</button>
          <button id="portflow-ext-token-check" style="background:#fff;color:#555;border:1px solid #ccc;border-radius:4px;padding:5px 10px;cursor:pointer;font-size:12px;">Controleer</button>
          <button id="portflow-ext-token-refresh" style="background:#fff;color:#b8860b;border:1px solid #c8a000;border-radius:4px;padding:5px 10px;cursor:pointer;font-size:12px;">Verversen</button>
          <button id="portflow-ext-token-copy" style="background:#c8a000;color:#fff;border:none;border-radius:4px;padding:5px 14px;cursor:pointer;font-size:12px;font-weight:600;">Kopieer</button>
        </div>
      `;
      document.body.appendChild(panel);
      portflowTokenPanel = panel;

      // --- Kopieer ---
      panel.querySelector('#portflow-ext-token-copy').addEventListener('click', async () => {
        const val = panel.querySelector('#portflow-ext-token-text').value;
        if (!val || val === '(geen token beschikbaar)') return;
        try {
          await navigator.clipboard.writeText(val);
          const copyBtn = panel.querySelector('#portflow-ext-token-copy');
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Gekopieerd!';
          setTimeout(() => { copyBtn.textContent = orig; }, 2000);
        } catch(e) {}
      });

      // --- Wis token ---
      panel.querySelector('#portflow-ext-token-clear').addEventListener('click', async () => {
        await chrome.storage.local.remove('portflow_token');
        try { await chrome.storage.session.remove('portflow_token'); } catch(_) {}
        updateTokenPanel(null);
        const clearBtn = panel.querySelector('#portflow-ext-token-clear');
        clearBtn.textContent = 'Gewist!';
        setTimeout(() => { clearBtn.textContent = 'Wis token'; }, 2000);
      });

      // --- Controleer: live API-check via background.js (omzeilt CORS) ---
      panel.querySelector('#portflow-ext-token-check').addEventListener('click', async () => {
        const checkBtn = panel.querySelector('#portflow-ext-token-check');
        const validityBadge = panel.querySelector('#portflow-ext-token-validity');
        const tokenVal = panel.querySelector('#portflow-ext-token-text').value;
        if (!tokenVal || tokenVal === '(geen token beschikbaar)') return;
        checkBtn.textContent = 'Bezig...';
        checkBtn.disabled = true;
        try {
          const resp = await chrome.runtime.sendMessage({
            type: 'check_token',
            token: tokenVal,
            baseUrl: 'https://portfolio.drieam.app'
          });
          if (resp && resp.valid) {
            validityBadge.textContent = 'API: Geldig ✓';
            validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#dfd;color:#060;';
          } else {
            const st = resp ? resp.status : '?';
            validityBadge.textContent = st === 401 ? 'API: Verlopen ✗' : `API: status ${st}`;
            validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#fde;color:#c00;';
          }
        } catch(e) {
          validityBadge.textContent = 'API: Fout';
          validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#fde;color:#c00;';
        }
        checkBtn.textContent = 'Controleer';
        checkBtn.disabled = false;
      });

      // --- Verversen: herlaad Portflow-iframe; background.js vangt nieuw token op ---
      panel.querySelector('#portflow-ext-token-refresh').addEventListener('click', async () => {
        const refreshBtn = panel.querySelector('#portflow-ext-token-refresh');
        const validityBadge = panel.querySelector('#portflow-ext-token-validity');
        const currentToken = await loadTokenFromStorage();
        const currentTs = currentToken ? currentToken.timestamp : 0;

        refreshBtn.textContent = 'Ophalen...';
        refreshBtn.disabled = true;
        validityBadge.textContent = 'Verversing…';
        validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#eef;color:#339;';

        const iframe = findPortflowIframe();
        if (iframe) {
          // Bewaar de echte src en reset naar leeg — dit dwingt een volledige reload af.
          // iframe.src = iframe.src is een no-op in Safari/Chrome als de waarde gelijk blijft.
          const originalSrc = iframe.getAttribute('src') || iframe.src;
          iframe.src = 'about:blank';
          setTimeout(() => { iframe.src = originalSrc; }, 80);
        }

        // Poll max 60 seconden op een nieuw token (andere timestamp)
        let attempts = 0;
        const iv = setInterval(async () => {
          attempts++;
          const newToken = await loadTokenFromStorage();
          if (newToken && newToken.timestamp > currentTs) {
            clearInterval(iv);
            updateTokenPanel(newToken);
            refreshBtn.textContent = 'Verversen';
            refreshBtn.disabled = false;
          } else if (attempts > 120) {
            clearInterval(iv);
            validityBadge.textContent = 'Timeout – probeer opnieuw';
            validityBadge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#fde;color:#c00;';
            refreshBtn.textContent = 'Verversen';
            refreshBtn.disabled = false;
          }
        }, 500);
      });

      document.addEventListener('click', (e) => {
        if (portflowTokenPanel && portflowTokenPanel.style.display !== 'none') {
          if (!portflowTokenPanel.contains(e.target) && e.target !== portflowTokenBtn) {
            portflowTokenPanel.style.display = 'none';
          }
        }
      }, true);
    }

    const btn = document.createElement('button');
    btn.id = portflowTokenButtonId;
    btn.innerHTML = lockIcon;
    btn.title = 'Toon Bearer Token';

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (portflowTokenPanel.style.display !== 'none') {
        portflowTokenPanel.style.display = 'none';
        return;
      }

      const portflow_token = await loadTokenFromStorage();
      updateTokenPanel(portflow_token);

      const btnRect = btn.getBoundingClientRect();
      portflowTokenPanel.style.top = (btnRect.bottom + 6) + 'px';
      portflowTokenPanel.style.right = (window.innerWidth - btnRect.right) + 'px';
      portflowTokenPanel.style.left = 'auto';
      portflowTokenPanel.style.display = 'block';
    });

    if (toolbar) {
      btn.style.cssText = 'background:rgba(255,255,255,0.92);border:1px solid #c8a000;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.15);display:inline-flex;align-items:center;justify-content:center;line-height:1;vertical-align:middle;margin-left:8px;';
      toolbar.appendChild(btn);
    } else {
      btn.style.cssText = 'position:fixed;z-index:9999;top:130px;right:10px;background:rgba(255,255,255,0.92);border:1px solid #c8a000;border-radius:6px;padding:3px 4px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;line-height:1;';
      document.body.appendChild(btn);
    }
    portflowTokenBtn = btn;
    return btn;
  };

  const togglePortflowViaOverlayButton = () => {
    const overlayButton = portflowOverlayBtn || injectOverlayButton();
    if (!overlayButton) {
      return { success: false, maximized: portflowMaximized };
    }

    overlayButton.click();
    return { success: true, maximized: portflowMaximized };
  };

  // Knop injecteren in de Canvas breadcrumb-balk (.right-of-crumbs).
  // Deze balk zit buiten de Portflow-iframe, dus er is nooit overlap met
  // Portflow-header-knoppen ("Maak een snapshot" e.d.).
  const initOverlayButton = () => {
    const tryInject = () => {
      return Boolean(injectOverlayButton());
    };
    const iv = setInterval(() => { if (tryInject()) clearInterval(iv); }, 500);
  };

  initOverlayButton();

  const initTokenButton = () => {
    const iv = setInterval(() => { if (injectTokenButton()) clearInterval(iv); }, 500);
  };
  initTokenButton();

  // Detecteer URL-hash om Portflow-navigatie te sturen vanuit een bookmark.
  // Voorbeeld: https://canvas.hu.nl/courses/51659/external_tools/1134#portflow=toegang
  // Ondersteunde waarden:
  // Ondersteunde URL-hash intents (combineerbaar met &maximaliseer):
  //   toegang            → Mijn toegang en verzoeken
  //   evaluatie          → Mijn toegang en verzoeken → Evaluatieverzoeken
  //   feedback           → Mijn toegang en verzoeken → Feedbackverzoeken
  //   validatie          → Mijn toegang en verzoeken → Validatieverzoeken
  //   toegangsverzoeken  → Mijn toegang en verzoeken → Toegangsverzoeken
  //   coaching           → Coaching dashboard
  //   maximaal           → Portflow gemaximaliseerd starten
  //
  // Voorbeelden:
  //   #portflow=evaluatie
  //   #portflow=evaluatie&maximaliseer
  //   #portflow=maximaal
  const portflowNavMap = {
    'toegang':           ['[data-menu-id*="/access-and-requests"]:not([data-menu-id*="/access-and-requests/"])'],
    'evaluatie':         ['[data-menu-id*="/access-and-requests"]:not([data-menu-id*="/access-and-requests/"])', '[data-menu-id*="/access-and-requests/progress-reviews"]'],
    'feedback':          ['[data-menu-id*="/access-and-requests"]:not([data-menu-id*="/access-and-requests/"])', '[data-menu-id*="/access-and-requests/feedback-requests"]'],
    'validatie':         ['[data-menu-id*="/access-and-requests"]:not([data-menu-id*="/access-and-requests/"])', '[data-menu-id*="/access-and-requests/validation-requests"]'],
    'toegangsverzoeken': ['[data-menu-id*="/access-and-requests"]:not([data-menu-id*="/access-and-requests/"])', '[data-menu-id*="/access-and-requests/access-requests"]'],
    'coaching':          ['[data-menu-id*="/coaching"]'],
  };
  const detectNavIntent = async () => {
    const hash = window.location.hash;
    if (!hash) return;
    const navMatch = hash.match(/[#&]portflow=([^&]+)/);
    const autoMaximize = /[#&]maximaliseer/.test(hash);
    const justMaximize = navMatch && navMatch[1].toLowerCase() === 'maximaal';
    const intentKey = navMatch ? navMatch[1].toLowerCase() : null;
    const selectors = intentKey ? portflowNavMap[intentKey] : null;

    if (autoMaximize || justMaximize || selectors) {
      await chrome.storage.local.set({ portflow_auto_maximize: true });
    }
    if (navMatch && !justMaximize) {
      if (selectors) await chrome.storage.local.set({ portflow_nav_intents: selectors });
    }
    history.replaceState(null, '', window.location.pathname + window.location.search);
  };
  detectNavIntent();

  // Auto-maximaliseer Portflow als dat als intent is opgegeven
  const initAutoMaximize = async () => {
    const s = await chrome.storage.local.get('portflow_auto_maximize');
    if (!s.portflow_auto_maximize) return;
    await chrome.storage.local.remove('portflow_auto_maximize');
    // Wacht tot de iframe er is, dan maximaliseer
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if (findPortflowIframe()) {
        clearInterval(iv);
        if (!portflowMaximized) togglePortflowMaximize();
      } else if (attempts > 60) { clearInterval(iv); }
    }, 500);
  };
  initAutoMaximize();

  // Popup-knop stuurt hetzelfde togglePortflowMaximize aan
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'maximize_portflow' || request.action === 'toggle_portflow_with_overlay_button') {
      sendResponse(togglePortflowViaOverlayButton());
    }
    return true; // Asynchrone afhandeling
  });
})();
