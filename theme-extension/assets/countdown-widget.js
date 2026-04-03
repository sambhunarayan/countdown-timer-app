/**
 * Storefront countdown widget – vanilla JS, <30KB gzipped.
 * Fetches active timer config from the API and renders a countdown.
 * Handles: expired timers, no active timers, network failures gracefully.
 */
(function () {
  'use strict';

  const container = document.getElementById('countdown-timer-widget');
  if (!container) return;

  const shopId = container.dataset.shop;
  const productId = container.dataset.productId;
  const API_URL = container.dataset.apiUrl || '/apps/countdown-timer/api';

  let intervalId = null;

  // ── Helpers ──────────────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }

  function getTimeRemaining(endTime) {
    var total = new Date(endTime).getTime() - Date.now();
    if (total <= 0) return { d: 0, h: 0, m: 0, s: 0, total: 0, expired: true };
    return {
      d: Math.floor(total / 86400000),
      h: Math.floor((total / 3600000) % 24),
      m: Math.floor((total / 60000) % 60),
      s: Math.floor((total / 1000) % 60),
      total: total,
      expired: false,
    };
  }

  // ── Render ───────────────────────────────────────────────────
  function render(timer) {
    var c = timer.customization || {};
    var bgColor = c.backgroundColor || '#000';
    var textColor = c.textColor || '#fff';
    var accentColor = c.accentColor || '#FF4444';

    function update() {
      var r = getTimeRemaining(timer.endTime);
      var isUrgent = c.showUrgencyEffect && r.total > 0 && r.total < 300000;

      if (r.expired) {
        container.innerHTML =
          '<div style="background:' + bgColor + ';color:' + textColor +
          ';padding:12px 20px;text-align:center;font-family:system-ui,sans-serif">' +
          (c.expiredText || 'This offer has expired.') + '</div>';
        clearInterval(intervalId);
        return;
      }

      container.innerHTML =
        '<div style="background:' + bgColor + ';color:' + textColor +
        ';padding:12px 20px;text-align:center;font-family:system-ui,sans-serif;' +
        (isUrgent ? 'animation:ct-pulse 1s ease-in-out infinite;' : '') + '">' +
        '<span style="margin-right:12px">' + (c.headingText || 'Hurry!') + '</span>' +
        '<span style="display:inline-block;background:' + accentColor +
        ';padding:4px 8px;border-radius:4px;margin:0 2px;font-weight:bold;font-size:20px;' +
        'min-width:36px;font-variant-numeric:tabular-nums">' + pad(r.d) + 'd</span>' +
        ' : ' +
        '<span style="display:inline-block;background:' + accentColor +
        ';padding:4px 8px;border-radius:4px;margin:0 2px;font-weight:bold;font-size:20px;' +
        'min-width:36px;font-variant-numeric:tabular-nums">' + pad(r.h) + 'h</span>' +
        ' : ' +
        '<span style="display:inline-block;background:' + accentColor +
        ';padding:4px 8px;border-radius:4px;margin:0 2px;font-weight:bold;font-size:20px;' +
        'min-width:36px;font-variant-numeric:tabular-nums">' + pad(r.m) + 'm</span>' +
        ' : ' +
        '<span style="display:inline-block;background:' + accentColor +
        ';padding:4px 8px;border-radius:4px;margin:0 2px;font-weight:bold;font-size:20px;' +
        'min-width:36px;font-variant-numeric:tabular-nums">' + pad(r.s) + 's</span>' +
        '</div>';
    }

    update();
    intervalId = setInterval(update, 1000);
  }

  // ── Evergreen timer (session-based via localStorage) ─────────
  function handleEvergreen(timer) {
    var key = 'ct_evergreen_' + timer._id;
    var stored = localStorage.getItem(key);
    var end;

    if (stored) {
      end = new Date(stored);
      if (end.getTime() <= Date.now()) {
        // Session expired – reset
        localStorage.removeItem(key);
        end = null;
      }
    }

    if (!end) {
      end = new Date(Date.now() + (timer.evergreenDuration || 30) * 60000);
      localStorage.setItem(key, end.toISOString());
    }

    timer.endTime = end.toISOString();
    render(timer);
  }

  // ── Fetch & initialise ──────────────────────────────────────
  function init() {
    var url = API_URL + '/analytics/active-timers?shopId=' +
      encodeURIComponent(shopId) +
      (productId ? '&productId=' + encodeURIComponent(productId) : '');

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        var timers = json.data;
        if (!timers || timers.length === 0) {
          container.style.display = 'none';
          return;
        }

        var timer = timers[0]; // show first matching timer

        // Track impression
        fetch(API_URL + '/analytics/impression/' + timer._id, { method: 'POST' }).catch(function () {});

        if (timer.timerType === 'evergreen') {
          handleEvergreen(timer);
        } else {
          render(timer);
        }
      })
      .catch(function () {
        // Network failure – hide widget gracefully
        container.style.display = 'none';
      });
  }

  // Add urgency animation keyframes
  var style = document.createElement('style');
  style.textContent = '@keyframes ct-pulse{0%,100%{opacity:1}50%{opacity:.7}}';
  document.head.appendChild(style);

  init();
})();
