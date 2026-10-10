/* shell.js - mobile drawer and focus mode. Pairs with shell.css and the markup in report-page.html. */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var side = document.getElementById('sidebar');
  var btn = document.getElementById('menuBtn');
  if (!app || !side || !btn) return;

  var mq = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
  function isOpen() { return side.getAttribute('data-open') === 'true'; }

  // A closed drawer is off-screen but still focusable unless it is inert.
  function sync() { side.inert = !!(mq && mq.matches && !isOpen()); }

  function setOpen(open, returnFocus) {
    side.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sync();
    if (open) { var first = side.querySelector('a, button'); if (first) first.focus(); }
    else if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () { setOpen(!isOpen(), true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setOpen(false, true); });
  side.addEventListener('click', function (e) { if (mq && mq.matches && e.target.closest('a')) setOpen(false, false); });
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);

  // Focus mode: report and sidebar only. The choice is remembered per device.
  var fm = document.querySelector('[data-focus-toggle]');
  if (fm) {
    var saved = false;
    try { saved = window.localStorage.getItem('focusMode') === '1'; } catch (e) { /* storage blocked */ }
    function applyFocus(on) {
      app.setAttribute('data-focus', on ? 'true' : 'false');
      fm.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { window.localStorage.setItem('focusMode', on ? '1' : '0'); } catch (e) { /* ignore */ }
    }
    fm.addEventListener('click', function () { applyFocus(app.getAttribute('data-focus') !== 'true'); });
    app.setAttribute('data-focus', saved ? 'true' : 'false');
    fm.setAttribute('aria-pressed', saved ? 'true' : 'false');
  }
  sync();
})();
