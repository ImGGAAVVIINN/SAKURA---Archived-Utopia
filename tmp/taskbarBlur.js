// taskbarBlur.js
// Creates a blurred snapshot of the content behind the taskbar using html2canvas
// and places it under the taskbar to emulate backdrop-filter when it's not available.
(function(){
  function loadScript(src, cb){
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function(){ console.warn('Failed to load script', src); cb && cb(); };
    document.head.appendChild(s);
  }

  function init(){
    var taskbar = document.querySelector('.taskbar-container');
    if (!taskbar) return;

    // Create blur layer
    var blurLayer = document.createElement('div');
    blurLayer.className = 'taskbar-blur-layer';
    // base styles (we'll update positions dynamically)
    Object.assign(blurLayer.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100px',
      height: '40px',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 9998,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
      filter: 'blur(8px) saturate(1.05)',
      transform: 'scale(1.05)',
      willChange: 'background-image, left, top'
    });

    taskbar.parentNode.insertBefore(blurLayer, taskbar);

    var lastRect = null;
    var busy = false;
    var scheduled = null;

    function capture(){
      if (!window.html2canvas) {
        // html2canvas not available
        return;
      }
      if (busy) return;
      var rect = taskbar.getBoundingClientRect();
      // If size is 0, skip
      if (rect.width <= 0 || rect.height <= 0) return;
      lastRect = rect;
      busy = true;

      // Convert to page coordinates
      var x = Math.round(rect.left + window.scrollX);
      var y = Math.round(rect.top + window.scrollY);
      var w = Math.round(rect.width);
      var h = Math.round(rect.height);

      // To capture the content _behind_ the taskbar we must temporarily hide
      // the taskbar and the blurLayer so html2canvas doesn't include them.
      var prevTaskbarVisibility = taskbar.style.visibility || '';
      var prevBlurVisibility = blurLayer.style.visibility || '';
      try {
        taskbar.style.visibility = 'hidden';
        blurLayer.style.visibility = 'hidden';

        // Allow browser to repaint without the taskbar (one animation frame)
        requestAnimationFrame(function(){
          // small timeout to be safer on some browsers
          setTimeout(function(){
            try {
              html2canvas(document.body, {
                x: x,
                y: y,
                width: w,
                height: h,
                scale: Math.min(2, window.devicePixelRatio || 1),
                useCORS: true,
                backgroundColor: null,
                logging: false
              }).then(function(canvas){
                try {
                  var data = canvas.toDataURL();
                  blurLayer.style.backgroundImage = 'url(' + data + ')';
                  // Align blurLayer to taskbar's viewport position
                  alignLayer(rect);
                } catch (e) {
                  console.warn('Could not export canvas (CORS?), blur fallback will be empty.', e);
                }
              }).catch(function(err){
                console.warn('html2canvas capture failed', err);
              }).finally(function(){
                // restore visibility
                taskbar.style.visibility = prevTaskbarVisibility;
                blurLayer.style.visibility = prevBlurVisibility;
                busy = false;
              });
            } catch (e) {
              taskbar.style.visibility = prevTaskbarVisibility;
              blurLayer.style.visibility = prevBlurVisibility;
              busy = false;
              console.warn('html2canvas error', e);
            }
          }, 40);
        });
      } catch (e) {
        taskbar.style.visibility = prevTaskbarVisibility;
        blurLayer.style.visibility = prevBlurVisibility;
        busy = false;
        console.warn('html2canvas error', e);
      }
    }

    function alignLayer(rect){
      // If the taskbar is fixed (our sticky script sets position: fixed), place layer fixed too
      var computed = window.getComputedStyle(taskbar);
      if (computed.position === 'fixed' || taskbar.style.position === 'fixed'){
        blurLayer.style.position = 'fixed';
        blurLayer.style.top = Math.round(rect.top) + 'px';
        blurLayer.style.left = Math.round(rect.left) + 'px';
        blurLayer.style.width = Math.round(rect.width) + 'px';
        blurLayer.style.height = Math.round(rect.height) + 'px';
      } else {
        // absolute relative to document
        var docTop = rect.top + window.scrollY;
        blurLayer.style.position = 'absolute';
        blurLayer.style.top = Math.round(docTop) + 'px';
        blurLayer.style.left = Math.round(rect.left) + 'px';
        blurLayer.style.width = Math.round(rect.width) + 'px';
        blurLayer.style.height = Math.round(rect.height) + 'px';
      }
    }

    function scheduleCapture(){
      if (scheduled) clearTimeout(scheduled);
      scheduled = setTimeout(function(){
        scheduled = null;
        capture();
      }, 120);
    }

    // Watch for scroll/resize and also mutation (in case content changes)
    window.addEventListener('scroll', scheduleCapture, {passive:true});
    window.addEventListener('resize', scheduleCapture);

    // MutationObserver to detect changes that might affect background
    var mo = new MutationObserver(function(){ scheduleCapture(); });
    mo.observe(document.body, {subtree:true, childList:true, attributes:true, characterData:true});

    // Also recapture when the taskbar moves (e.g., becomes fixed). Polling small interval for that
    setInterval(function(){
      var rect = taskbar.getBoundingClientRect();
      if (!lastRect || rect.top !== lastRect.top || rect.left !== lastRect.left || rect.width !== lastRect.width || rect.height !== lastRect.height){
        scheduleCapture();
      }
    }, 300);

  // Initial capture
  scheduleCapture();
  }

  // Load html2canvas and init
  if (!window.html2canvas){
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', function(){
      // Give it a short moment for fonts/images
      setTimeout(init, 150);
    });
  } else {
    setTimeout(init, 150);
  }
})();
