// Minimal taskbar JS: clock updater and start menu toggle scoped to this taskbar.
(function(){
  // Clock
  function updateTaskbarClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    var now = new Date();
    var hrs = now.getHours();
    var mins = now.getMinutes();
    var ampm = '';
    // 24h by default; convert to 12h if you prefer
    // hrs = (hrs % 12) || 12; ampm = hrs >= 12 ? ' PM' : ' AM';
    el.textContent = String(hrs).padStart(2,'0') + ':' + String(mins).padStart(2,'0') + ampm;
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
