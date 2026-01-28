// Minimal taskbar JS: clock updater and start menu toggle scoped to this taskbar.
(function(){
  // Clock
  // Supports optional data attributes on the #clock element:
  // - data-format="12" or "24" (default: 24)
  // - data-seconds="true" to show seconds (default: false)
  function updateTaskbarClock() {
    // This function will try to use a cached timezone (window.__detectedClockTZ)
    // or fetch it via IP geolocation once. It formats time as HH:MM AM/PM
    // and date on the second line.
    var el = document.getElementById('clock');
    if (!el) return;

    async function ensureTZ() {
      if (el.dataset && el.dataset.timezone) return el.dataset.timezone;
      if (window.__detectedClockTZ) return window.__detectedClockTZ;
      try {
        var controller = new AbortController();
        var tid = setTimeout(function(){ controller.abort(); }, 2500);
        var r = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(tid);
        if (r.ok) {
          var j = await r.json();
          if (j && j.timezone) {
            window.__detectedClockTZ = j.timezone;
            return j.timezone;
          }
        }
      } catch (e) {
        // ignore
      }
      return undefined;
    }

    (async function() {
      var now = new Date();
      var tz = el.dataset && el.dataset.timezone ? el.dataset.timezone : await ensureTZ();
      var timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      var dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
      try {
        var timeFormatter = tz ? new Intl.DateTimeFormat(undefined, Object.assign({ timeZone: tz }, timeOptions)) : new Intl.DateTimeFormat(undefined, timeOptions);
        var dateFormatter = tz ? new Intl.DateTimeFormat(undefined, Object.assign({ timeZone: tz }, dateOptions)) : new Intl.DateTimeFormat(undefined, dateOptions);
  var timeStr = timeFormatter.format(now);
  // Ensure AM/PM is capitalized (e.g. 'am' -> 'AM', 'a.m.' -> 'AM')
  timeStr = timeStr.replace(/(a\.?m\.?|p\.?m\.?)/ig, function(m){ return m.toUpperCase().replace(/\./g,''); });
  var dateStr = dateFormatter.format(now);
        el.innerHTML = "<div>" + timeStr + "</div><div>" + dateStr + "</div>";
      } catch (err) {
  var timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  timeStr = timeStr.replace(/(a\.?m\.?|p\.?m\.?)/ig, function(m){ return m.toUpperCase().replace(/\./g,''); });
  var dateStr = now.toLocaleDateString();
        el.innerHTML = "<div>" + timeStr + "</div><div>" + dateStr + "</div>";
      }
    })();
  }

  setInterval(updateTaskbarClock, 1000);
  document.addEventListener('DOMContentLoaded', function(){
    updateTaskbarClock();
    var start = document.getElementById('start-button');
    var startMenu = document.getElementById('start-menu');
    if (start && startMenu) {
      // Click toggles start menu (existing behavior)
      start.addEventListener('click', function(e){
        e.stopPropagation();
        startMenu.classList.toggle('show');
      });

      // Hover / focus behavior: swap the image src to a hover variant when available.
      // Prefer explicit data-hover attribute; otherwise attempt a sensible filename replacement
      // by swapping "startregular" -> "starthover" in the src.
      (function(){
        try {
          var regularSrc = start.getAttribute('src') || '';
          var hoverSrc = start.dataset && start.dataset.hover ? start.dataset.hover : regularSrc.replace('startregular', 'starthover');
          // Store originals on dataset so other scripts can inspect them
          start.dataset._regularSrc = regularSrc;
          start.dataset._hoverSrc = hoverSrc;

          var applyHover = function(){ if (hoverSrc) start.src = hoverSrc; };
          var removeHover = function(){ if (regularSrc) start.src = regularSrc; };

          // pointerover/pointerout covers mouse and stylus; also add focus/blur for keyboard
          start.addEventListener('pointerover', applyHover);
          start.addEventListener('pointerout', removeHover);
          start.addEventListener('focus', applyHover);
          start.addEventListener('blur', removeHover);

          // For touch devices, a quick touchstart can show hover while pressed
          start.addEventListener('touchstart', applyHover, { passive: true });
          start.addEventListener('touchend', removeHover, { passive: true });
        } catch (e) {
          // defensive: do nothing on error
        }
      })();

      // click elsewhere closes the start menu
      document.addEventListener('click', function(){ startMenu.classList.remove('show'); });
      startMenu.addEventListener('click', function(e){ e.stopPropagation(); });
    }

    // Progressive start-button shift when the taskbar is scrolled toward the top.
    // This computes a small translateY value and sets the --start-shift CSS variable
    // on the taskbar container. It's performant (rAF) and has a graceful default.
    (function(){
      try {
        var taskbar = document.querySelector('.taskbar-container');
        if (!taskbar) return;

        var maxShift = 8; // maximum shift in px when taskbar reaches top
        var threshold = 120; // start applying shift when taskbar top is within this px of viewport top
        var ticking = false;

        function updateShift() {
          ticking = false;
          var rect = taskbar.getBoundingClientRect();
          var top = rect.top;
          // t goes from 0 (no shift when taskbar far from top) to 1 (full shift when at/above top)
          var t = (threshold - top) / threshold;
          if (t < 0) t = 0;
          if (t > 1) t = 1;
          var shift = Math.round(t * maxShift);
          taskbar.style.setProperty('--start-shift', shift + 'px');
        }

        function onScroll() {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateShift);
          }
        }

        // initialize and attach listeners
        updateShift();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
      } catch (e) {
        // defensive: don't break taskbar if anything goes wrong
      }
    })();
  });
})();
