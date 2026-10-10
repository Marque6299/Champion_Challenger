/* report-frame.js - click-to-load Power BI frame with loading, slow-load and offline states.
   Markup contract: see Appendix C of the plan. No dependencies. */
(function () {
  'use strict';

  var SLOW_MS = 12000;           // show the help panel after 12 s without a load event
  var AUTOLOAD_KEY = 'reportAutoload';

  function readPref() {
    try { return window.localStorage.getItem(AUTOLOAD_KEY) === '1'; } catch (e) { return false; }
  }
  function writePref(on) {
    try { window.localStorage.setItem(AUTOLOAD_KEY, on ? '1' : '0'); } catch (e) { /* storage blocked: ignore */ }
  }

  function init(root) {
    var src = root.getAttribute('data-src');
    var title = root.getAttribute('data-title') || 'Power BI report';
    var stage = root.querySelector('[data-stage]');
    var status = root.querySelector('[data-status]');
    var help = root.querySelector('[data-help]');
    var loadBtn = root.querySelector('[data-load]');
    var retryBtn = root.querySelector('[data-retry]');
    var fsBtn = root.querySelector('[data-fullscreen]');
    var autoBox = root.querySelector('[data-autoload]');
    var frame = null;
    var timer = null;

    function setState(state, message) {
      root.setAttribute('data-state', state);
      if (status && message) status.textContent = message;
      if (help) help.hidden = !(state === 'slow' || state === 'offline');
    }

    function armTimer() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        setState('slow', 'This is taking longer than usual.');
      }, SLOW_MS);
    }

    function load() {
      if (!src) return;
      if (navigator.onLine === false) { setState('offline', 'You appear to be offline.'); return; }
      if (frame) return;
      setState('loading', 'Loading ' + title + '.');
      frame = document.createElement('iframe');
      frame.title = title;
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.addEventListener('load', function () {
        clearTimeout(timer);
        setState('ready', title + ' is ready.');
      });
      frame.src = src;
      stage.appendChild(frame);
      armTimer();
    }

    function retry() {
      if (navigator.onLine === false) { setState('offline', 'You appear to be offline.'); return; }
      if (!frame) { load(); return; }
      setState('loading', 'Reloading ' + title + '.');
      frame.src = src;           // reassigning src reloads the frame
      armTimer();
    }

    function fullscreen() {
      if (!frame) { load(); }
      if (frame && frame.requestFullscreen) {
        frame.requestFullscreen().catch(function () { window.open(src, '_blank', 'noopener'); });
      } else {
        window.open(src, '_blank', 'noopener');   // iOS Safari cannot fullscreen an iframe
      }
    }

    // Workspace API: switch the same component to another report without a page load.
    // root.reportFrameApi.switchTo(url, title, true) loads it straight away (the person already chose it).
    function switchTo(newSrc, newTitle, loadNow) {
      clearTimeout(timer);
      if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
      frame = null;
      src = newSrc;
      title = newTitle || title;
      root.setAttribute('data-src', src);
      root.setAttribute('data-title', title);
      setState('idle');
      if (loadNow || readPref()) load();
    }
    root.reportFrameApi = { switchTo: switchTo, load: load, retry: retry };

    if (loadBtn) loadBtn.addEventListener('click', load);
    if (retryBtn) retryBtn.addEventListener('click', retry);
    if (fsBtn) fsBtn.addEventListener('click', fullscreen);
    if (autoBox) {
      autoBox.checked = readPref();
      autoBox.addEventListener('change', function () { writePref(autoBox.checked); });
    }
    window.addEventListener('online', function () {
      if (root.getAttribute('data-state') === 'offline') retry();
    });

    setState('idle');
    if (readPref()) load();      // returning visitors who opted in skip the extra click
  }

  function boot() {
    var roots = document.querySelectorAll('[data-report-frame]');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
