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

  const expandIcon  = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
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

  // Popup-knop stuurt hetzelfde togglePortflowMaximize aan
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'maximize_portflow' || request.action === 'toggle_portflow_with_overlay_button') {
      sendResponse(togglePortflowViaOverlayButton());
    }
    return true; // Asynchrone afhandeling
  });
})();
