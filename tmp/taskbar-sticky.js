// Small helper to make the copied taskbar become sticky when it reaches the top
// Uses an IntersectionObserver on a tiny sentinel placed before the taskbar.
// This file intentionally does not change the copied taskbar HTML/CSS — it only
// toggles the .taskbar-sticky class that the site's CSS (home.css) already defines.

document.addEventListener('DOMContentLoaded', function () {
  var taskbar = document.querySelector('.taskbar-container');
  if (!taskbar) return;

  // Create a tiny sentinel element right before the taskbar
  var sentinel = document.createElement('div');
  sentinel.className = 'taskbar-sentinel';
  sentinel.style.width = '100%';
  sentinel.style.height = '1px';
  sentinel.style.pointerEvents = 'none';

  taskbar.parentNode.insertBefore(sentinel, taskbar);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // when sentinel is not intersecting the viewport it means the taskbar
      // has moved past the top edge — make it sticky
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        taskbar.classList.add('taskbar-sticky');
      } else {
        taskbar.classList.remove('taskbar-sticky');
      }
    });
  }, { threshold: [0] });

  observer.observe(sentinel);
});
