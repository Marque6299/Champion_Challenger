/* ads-gate.js - POST-APPROVAL ONLY. Reveals and fills an ad slot only on pages that have
   enough original text. Never runs in the app shell. Load with <script defer> after the page body. */
(function () {
  'use strict';

  var MIN_WORDS = 600;                       // thin pages never show or reserve an ad slot
  var APP_SHELL = /^\/portal(\/|$)/;         // the workspace is always ad-free

  if (APP_SHELL.test(location.pathname)) return;

  var main = document.querySelector('main');
  if (!main || main.hasAttribute('data-no-ads')) return;

  var words = (main.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) return;

  var slots = document.querySelectorAll('.ad-slot');
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    if (!slot.querySelector('ins.adsbygoogle')) continue;
    slot.hidden = false;                     // slots ship with the hidden attribute
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { slot.hidden = true; }
  }
})();
