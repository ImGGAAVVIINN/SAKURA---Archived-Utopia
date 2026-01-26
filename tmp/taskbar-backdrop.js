// Backdrop and stronger blur handler
// Ensures the .taskbar-blur-backdrop follows the taskbar when it becomes fixed
document.addEventListener('DOMContentLoaded', function () {
  const taskbar = document.querySelector('.taskbar-container');
  const backdrop = document.querySelector('.taskbar-blur-backdrop');
  if (!taskbar || !backdrop) return;

  // Ensure a placeholder exists (don't duplicate if other script created one)
  let placeholder = taskbar.parentNode.querySelector('.taskbar-placeholder-js');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.className = 'taskbar-placeholder-js';
    placeholder.style.display = 'none';
    placeholder.style.width = '100%';
    taskbar.parentNode.insertBefore(placeholder, taskbar.nextSibling);
  }
  placeholder.style.height = taskbar.offsetHeight + 'px';

  let initialTop = taskbar.getBoundingClientRect().top + window.scrollY;
  let isFixed = false;

  function fixStyles(rect) {
    taskbar.style.position = 'fixed';
    taskbar.style.top = '0';
    taskbar.style.left = rect.left + 'px';
    taskbar.style.width = rect.width + 'px';
    taskbar.style.zIndex = '9999';

    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = rect.left + 'px';
    backdrop.style.width = rect.width + 'px';
    backdrop.style.height = rect.height + 'px';
    backdrop.style.zIndex = '9998';
    backdrop.style.opacity = '1';

    placeholder.style.display = 'block';
  }

  function restoreStyles() {
    taskbar.style.position = '';
    taskbar.style.top = '';
    taskbar.style.left = '';
    taskbar.style.width = '';
    taskbar.style.zIndex = '';

    backdrop.style.position = 'absolute';
    backdrop.style.left = '0';
    backdrop.style.right = '0';
    backdrop.style.bottom = '0';
    backdrop.style.width = '';
    backdrop.style.height = '';
    backdrop.style.zIndex = '-1';
    backdrop.style.opacity = '';

    placeholder.style.display = 'none';
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY >= initialTop && !isFixed) {
      const rect = taskbar.getBoundingClientRect();
      fixStyles(rect);
      isFixed = true;
    } else if (scrollY < initialTop && isFixed) {
      restoreStyles();
      isFixed = false;
    }
  }

  function onResize() {
    placeholder.style.height = taskbar.offsetHeight + 'px';
    initialTop = taskbar.getBoundingClientRect().top + window.scrollY;
    if (isFixed) {
      const phRect = placeholder.getBoundingClientRect();
      taskbar.style.left = phRect.left + 'px';
      taskbar.style.width = phRect.width + 'px';
      backdrop.style.left = phRect.left + 'px';
      backdrop.style.width = phRect.width + 'px';
      backdrop.style.height = taskbar.offsetHeight + 'px';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  // initial attempt after load
  setTimeout(onResize, 200);
});
