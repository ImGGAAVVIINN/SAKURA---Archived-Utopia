// Minimal taskbar JS: clock updater and start menu toggle scoped to this taskbar.
(function(){
  // Clock
  // Supports optional data attributes on the #clock element:
  // - data-format="12" or "24" (default: 24)
  // - data-seconds="true" to show seconds (default: false)
  function updateTaskbarClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    var format = (el.dataset.format === '12') ? '12' : '24';
    var showSeconds = el.dataset.seconds === 'true';

    if (format === '12') {
      var ampm = hours >= 12 ? 'PM' : 'AM';
      var hrs12 = hours % 12 || 12; // convert 0 -> 12
      var parts = [String(hrs12).padStart(2,'0'), String(minutes).padStart(2,'0')];
      if (showSeconds) parts.push(String(seconds).padStart(2,'0'));
      el.textContent = parts.join(':') + ' ' + ampm;
    } else {
      var parts = [String(hours).padStart(2,'0'), String(minutes).padStart(2,'0')];
      if (showSeconds) parts.push(String(seconds).padStart(2,'0'));
      el.textContent = parts.join(':');
    }
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
