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
      start.addEventListener('click', function(e){
        e.stopPropagation();
        startMenu.classList.toggle('show');
      });
      // click elsewhere closes the start menu
      document.addEventListener('click', function(){ startMenu.classList.remove('show'); });
      startMenu.addEventListener('click', function(e){ e.stopPropagation(); });
    }
  });
})();
