// Use globals provided by the CDN scripts included in `home.html`:
// - `gsap` (GSAP core)
// - `ScrollTrigger` (GSAP plugin)
// - `SplitText` (GSAP SplitText plugin)
// - `Lenis` (lenis smooth-scrolling)
// The page loads these from CDN, so we can reference them as globals instead
// of using ES module imports which require the script to be loaded as a module.

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Prevent browser from restoring scroll position on navigation/reload
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const initTextSplit = () => {
        // col-3 uses h2 elements for headings — include h2 here (was h1) so SplitText
        // applies to both headings and paragraphs inside .col-3
        const textElements = document.querySelectorAll(".col-3 h2, .col-3 p");

        textElements.forEach((element) => {
            const split = new SplitText(element, {
                type: "lines",
                linesClass: "line",
            });
            split.lines.forEach(
                (line) =>  (line.innerHTML = `<span>${line.textContent}</span>`)
            );
        });
    };

    initTextSplit();

    gsap.set(".col-3 .col-content-wrapper .line span", { y: "0%" });
    gsap.set(".col-3 .col-content-wrapper-2 .line span", { y: "-125%" });
    // Ensure image layers start in a deterministic state so the reveal/hide
    // animations work the same across browsers and rendering engines.
    gsap.set(".col-img-1", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        opacity: 1,
    });
    gsap.set(".col-img-2", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        opacity: 0,
    });
    
    // Hide col-content-wrapper-2 glass layers initially (it's underneath col-content-wrapper)
    gsap.set(".col-3 .col-content-wrapper-2 .liquid-glass--bend, .col-3 .col-content-wrapper-2 .liquid-glass--face, .col-3 .col-content-wrapper-2 .liquid-glass--edge", { opacity: 0 });

    let currentPhrase = 0;

    ScrollTrigger.create({
        trigger: ".sticky-cols",
        start: "top top",
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
            const progress = self.progress;
            
            if (progress >= 0.25 && currentPhrase === 0) {
                console.log('[sticky] progress >= 0.25 — switching to phrase 1');
                currentPhrase = 1;
                gsap.to(".col-1", { opacity: 0, scale: 0.75, duration: 0.75 }); //switch to phase 1 if we are still on 0
                gsap.to(".col-2", { x: "0%", duration: 0.75 }); //move in from the right
                gsap.to(".col-3", { y: "0%", duration: 0.75 }); //move in from the bottom

                gsap.to(".col-img img", { scale: 1.25, duration: 0.75 });
                gsap.to(".col-img-2", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.75,
                });
                // Fade in the second image so it becomes visible even if clip-path
                // finishes slightly earlier or the browser renders differently.
                gsap.to(".col-img-2", { opacity: 1, duration: 0.5, delay: 0 });
                // Fade out the first image as we reveal the second to avoid any
                // visual gaps or overlap artifacts.
                gsap.to(".col-img-1", { opacity: 0, duration: 0.5, delay: 0 });
                gsap.to(".col-img-2 img", { scale: 1, duration: 0.75 });
                // Hide the first image by animating its clip-path so the second
                // image is fully visible and not visually occluded.
                gsap.to(".col-img-1", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    duration: 0.75,
                });
                // Diagnostics: log computed styles and element presence so we can
                // understand why .col-img-2 might not be visible in some envs.
                try {
                    const el1 = document.querySelector('.col-img-1');
                    const el2 = document.querySelector('.col-img-2');
                    const img1 = el1 ? el1.querySelector('img') : null;
                    const img2 = el2 ? el2.querySelector('img') : null;
                    console.log('diag: el1, el2, img1, img2 present?', !!el1, !!el2, !!img1, !!img2);
                    if (el1) {
                        const s1 = getComputedStyle(el1);
                        console.log('diag el1 styles', {
                            display: s1.display,
                            opacity: s1.opacity,
                            visibility: s1.visibility,
                            clipPath: s1.clipPath,
                            zIndex: s1.zIndex,
                            transform: s1.transform,
                        });
                        console.log('diag el1 rect', el1.getBoundingClientRect());
                    }
                    if (el2) {
                        const s2 = getComputedStyle(el2);
                        console.log('diag el2 styles', {
                            display: s2.display,
                            opacity: s2.opacity,
                            visibility: s2.visibility,
                            clipPath: s2.clipPath,
                            zIndex: s2.zIndex,
                            transform: s2.transform,
                        });
                        console.log('diag el2 rect', el2.getBoundingClientRect());
                    }
                    if (img1) {
                        const si1 = getComputedStyle(img1);
                        console.log('diag img1 styles', { display: si1.display, opacity: si1.opacity, visibility: si1.visibility, transform: si1.transform });
                        console.log('diag img1 rect', img1.getBoundingClientRect(), 'natural', img1.naturalWidth, img1.naturalHeight, 'src', img1.currentSrc || img1.src);
                    }
                    if (img2) {
                        const si2 = getComputedStyle(img2);
                        console.log('diag img2 styles', { display: si2.display, opacity: si2.opacity, visibility: si2.visibility, transform: si2.transform });
                        console.log('diag img2 rect', img2.getBoundingClientRect(), 'natural', img2.naturalWidth, img2.naturalHeight, 'src', img2.currentSrc || img2.src);
                    }

                    // Also inspect the immediate parent (.col-2) to ensure it's sized/positioned
                    const parent = document.querySelector('.col-2');
                    if (parent) {
                        const sp = getComputedStyle(parent);
                        console.log('diag .col-2 styles', { display: sp.display, overflow: sp.overflow, transform: sp.transform, zIndex: sp.zIndex });
                        console.log('diag .col-2 rect', parent.getBoundingClientRect());
                    }

                    // Force inline styles as a definitive test to ensure the
                    // second image isn't being hidden by CSS elsewhere. Also add
                    // a visible outline to see where the elements render.
                    if (el2) {
                        // Force positioning to ensure it overlaps the first image.
                        el2.style.position = 'absolute';
                        el2.style.top = '0px';
                        el2.style.left = '0px';
                        el2.style.opacity = '1';
                        el2.style.zIndex = '9999';
                        el2.style.display = 'block';
                        el2.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
                        el2.style.outline = '3px solid lime';
                            try {
                                console.log('diag el2 parent', el2.parentElement && el2.parentElement.className);
                                console.log('diag el2 offsetParent', el2.offsetParent && el2.offsetParent.className, 'offsetTop', el2.offsetTop, 'offsetLeft', el2.offsetLeft);
                                console.log('diag el2 outerHTML snippet', el2.outerHTML.slice(0, 300));
                            } catch (e) {
                                console.warn('diag el2 parent read failed', e);
                            }
                    }
                    if (el1) {
                        el1.style.position = 'absolute';
                        el1.style.top = '0px';
                        el1.style.left = '0px';
                        el1.style.opacity = '0';
                        el1.style.zIndex = '1';
                        el1.style.outline = '3px solid red';
                    }
                } catch (e) {
                    console.error('diag error', e);
                }
            }

            if (progress >= 0.5 && currentPhrase === 1) {
                console.log('[sticky] progress >= 0.5 — switching to phrase 2');
                currentPhrase = 2;

                gsap.to(".col-2", { opacity: 0, scale: 0.75, duration: 0.75 }); //switch to phase 2 if we are still on 1
                gsap.to(".col-3", { x: "0%", duration: 0.75, scale: 0.98  }); //move in from the bottom
                gsap.to(".col-4", { y: "0%", duration: 0.75 }); //move in from the left

                gsap.to(".col-3 .col-content-wrapper .line span", {
                    y: "-125%",
                    duration: 0.75,
                });
                gsap.to(".col-3 .col-content-wrapper-2 .line span", {
                    y: "0%",
                    duration: 0.75,
                    delay: 0.5,
                });
                
                // Swap glass visibility: hide wrapper-1 glass, show wrapper-2 glass
                gsap.to(".col-3 .col-content-wrapper .liquid-glass--bend, .col-3 .col-content-wrapper .liquid-glass--face, .col-3 .col-content-wrapper .liquid-glass--edge", { opacity: 0, duration: 0.75 });
                gsap.to(".col-3 .col-content-wrapper-2 .liquid-glass--bend, .col-3 .col-content-wrapper-2 .liquid-glass--face, .col-3 .col-content-wrapper-2 .liquid-glass--edge", { opacity: 1, duration: 0.75, delay: 0.5 });

            }

            if (progress < 0.25 && currentPhrase >= 1) {
                console.log('[sticky] progress < 0.25 — returning to phrase 0');
                currentPhrase = 0;

                gsap.to(".col-1", { opacity: 1, scale: 1, duration: 0.75 });
                gsap.to(".col-2", { x: "100%", duration: 0.75 });
                gsap.to(".col-3", { y: "100%", duration: 0.75 });

                gsap.to(".col-img-1 img", { scale: 1, duration: 0.75 });
                gsap.to(".col-img-2", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    duration: 0.75,
                });
                // Hide the second image's opacity as we return to phrase 0 so the
                // first image becomes visible without showing a gap.
                gsap.to(".col-img-2", { opacity: 0, duration: 0.5, delay: 0 });
                gsap.to(".col-img-1", { opacity: 1, duration: 0.5, delay: 0 });
                gsap.to(".col-img-2 img", { scale: 1.25, duration: 0.75 });
                // Ensure the first image is revealed again by restoring its clip-path
                // (it may have been clipped when moving to phrase 1).
                gsap.to(".col-img-1", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.75,
                });
            }

            if (progress < 0.5 && currentPhrase === 2) {
                console.log('[sticky] progress < 0.5 — returning to phrase 1');
                currentPhrase = 1;

                gsap.to(".col-2", { opacity: 1, scale: 1, duration: 0.75 });
                gsap.to(".col-3", { x: "100%", duration: 0.75, scale: 1.005 });
                gsap.to(".col-4", { y: "100%", duration: 0.75 });

                gsap.to(".col-3 .col-content-wrapper .line span", {
                    y: "0%",
                    duration: 0.75,
                    delay: 0.5,
                });
                gsap.to(".col-3 .col-content-wrapper-2 .line span", {
                    y: "-125%",
                    duration: 0.75,
                });
                
                // Swap glass visibility back: show wrapper-1 glass, hide wrapper-2 glass
                gsap.to(".col-3 .col-content-wrapper .liquid-glass--bend, .col-3 .col-content-wrapper .liquid-glass--face, .col-3 .col-content-wrapper .liquid-glass--edge", { opacity: 1, duration: 0.75, delay: 0.5 });
                gsap.to(".col-3 .col-content-wrapper-2 .liquid-glass--bend, .col-3 .col-content-wrapper-2 .liquid-glass--face, .col-3 .col-content-wrapper-2 .liquid-glass--edge", { opacity: 0, duration: 0.75 });
            }
        },
    })

    // Ensure we start at the top after a refresh / back-forward navigation.
    // Use Lenis' scrollTo if available so smooth-scrolling state is consistent.
    const scrollToTop = () => {
        try {
            if (lenis && typeof lenis.scrollTo === 'function') {
                lenis.scrollTo(0, { immediate: true })
            } else {
                window.scrollTo(0, 0)
            }
        } catch (e) {
            window.scrollTo(0, 0)
        }
    }

    // on initial load
    scrollToTop()

    // when page is shown from bfcache
    window.addEventListener('pageshow', (e) => { if (e.persisted) scrollToTop() })

    // before unloading, ensure the scroll is at top so reloads start at top
    window.addEventListener('beforeunload', () => { window.scrollTo(0, 0) })

    // Try to autoplay the background video for the sticky section. It's muted so
    // most browsers will allow autoplay; if play is blocked we'll attempt to
    // resume playback on first user interaction.
    const bgVideo = document.querySelector('.bg-key');
    if (bgVideo) {
        // scope the presence flag to the sticky section so the video isn't
        // considered present everywhere on the page
        const sticky = document.querySelector('.sticky-cols');
        if (sticky) sticky.classList.add('has-bg-key');
        const tryPlay = async () => {
            try {
                await bgVideo.play();
            } catch (e) {
                // If autoplay is blocked, wait for a user gesture to try again
                const resume = () => {
                    bgVideo.play().catch(() => {});
                    document.removeEventListener('click', resume);
                    document.removeEventListener('touchstart', resume);
                };
                document.addEventListener('click', resume, { once: true });
                document.addEventListener('touchstart', resume, { once: true });
            }
        };
        // small fade-in so the video doesn't pop abruptly
        bgVideo.style.opacity = '0';
        bgVideo.style.transition = 'opacity 520ms ease-out';
        tryPlay().finally(() => { requestAnimationFrame(() => { bgVideo.style.opacity = '1'; }); });

        // log errors if the video fails to load so we can surface issues
        bgVideo.addEventListener('error', (ev) => {
            console.log('bg-key video failed to load or play:', ev, bgVideo.currentSrc);
            // provide a subtle fallback background color scoped to sticky section
            if (sticky) sticky.classList.add('bg-key-missing');
        });
    }

    // Toggle a root-level `has-scrollbar` class when the document is scrollable.
    // Some browsers render the viewport scrollbar on `document.documentElement`
    // (html) so we add/remove the class there. This allows CSS to target the
    // scrollbar pseudo-elements reliably.
    function updateScrollbarClass() {
        try {
            const root = document.documentElement;
            const isScrollable = root.scrollHeight > root.clientHeight;
            root.classList.toggle('has-scrollbar', !!isScrollable);
        } catch (e) {
            // no-op on weird environments
        }
    }
    // Run at load and on resize. Also run after a short timeout to catch
    // late-loading content (fonts/media) that might change layout.
    updateScrollbarClass();
    window.addEventListener('resize', updateScrollbarClass, { passive: true });
    window.addEventListener('load', updateScrollbarClass);
    setTimeout(updateScrollbarClass, 250);
});

// Sticky taskbar behavior (copied from tmp/taskbarExample.js, adapted)
document.addEventListener('DOMContentLoaded', function () {
    const taskbar = document.querySelector('.taskbar-container');
    if (!taskbar) return;

    // Create a placeholder to avoid layout jump when taskbar becomes fixed
    const placeholder = document.createElement('div');
    placeholder.style.display = 'none';
    placeholder.style.width = '100%';
    taskbar.parentNode.insertBefore(placeholder, taskbar.nextSibling);

    // Compute the initial offsetTop for the taskbar (distance from top of document)
    let initialTop = taskbar.getBoundingClientRect().top + window.scrollY;
    placeholder.style.height = taskbar.offsetHeight + 'px';

    // Create a backdrop element that will sit behind the taskbar and apply blur
    const backdrop = document.createElement('div');
    backdrop.className = 'taskbar-backdrop';
    backdrop.style.pointerEvents = 'none';
    backdrop.style.position = 'absolute';
    backdrop.style.zIndex = '9998';
    // Initial placement (will be recalculated below)
    const initialRect = taskbar.getBoundingClientRect();
    backdrop.style.left = (initialRect.left + window.scrollX) + 'px';
    backdrop.style.top = (initialRect.top + window.scrollY) + 'px';
    backdrop.style.width = initialRect.width + 'px';
    backdrop.style.height = initialRect.height + 'px';
    // Visual blur (use both vendor prefix and standard)
    backdrop.style.background = 'rgba(255,255,255,0.02)';
    backdrop.style.backdropFilter = 'blur(8px)';
    backdrop.style.webkitBackdropFilter = 'blur(8px)';
    // Insert backdrop immediately after the taskbar so it sits behind it in the DOM
    taskbar.parentNode.insertBefore(backdrop, taskbar.nextSibling);

    let isFixed = false;

    function onScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY >= initialTop && !isFixed) {
            // Fix the taskbar to the top of the viewport
            const rect = taskbar.getBoundingClientRect();
            taskbar.style.position = 'fixed';
            taskbar.style.top = '0';
            taskbar.style.left = rect.left + 'px';
            taskbar.style.width = rect.width + 'px';
            taskbar.style.zIndex = '9999';
            placeholder.style.display = 'block';
            // Make backdrop fixed and align to the top as well, behind taskbar
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0';
            backdrop.style.left = rect.left + 'px';
            backdrop.style.width = rect.width + 'px';
            backdrop.style.height = rect.height + 'px';
            backdrop.style.display = '';
            isFixed = true;
        } else if (scrollY < initialTop && isFixed) {
            // Restore original flow
            taskbar.style.position = '';
            taskbar.style.top = '';
            taskbar.style.left = '';
            taskbar.style.width = '';
            taskbar.style.zIndex = '';
            placeholder.style.display = 'none';
            // Return backdrop to absolute positioning and hide until resized
            backdrop.style.position = 'absolute';
            backdrop.style.left = (taskbar.getBoundingClientRect().left + window.scrollX) + 'px';
            backdrop.style.top = (taskbar.getBoundingClientRect().top + window.scrollY) + 'px';
            backdrop.style.width = taskbar.offsetWidth + 'px';
            backdrop.style.height = taskbar.offsetHeight + 'px';
            isFixed = false;
        }
    }

    function onResize() {
        // Recompute positions/sizes so fixed state remains aligned
        placeholder.style.height = taskbar.offsetHeight + 'px';
        if (isFixed) {
            const phRect = placeholder.getBoundingClientRect();
            taskbar.style.left = phRect.left + 'px';
            taskbar.style.width = phRect.width + 'px';
            // keep backdrop aligned when fixed
            backdrop.style.left = phRect.left + 'px';
            backdrop.style.width = phRect.width + 'px';
            backdrop.style.height = taskbar.offsetHeight + 'px';
        }
        // recompute initialTop relative to document
        initialTop = taskbar.getBoundingClientRect().top + window.scrollY;
        // update backdrop when not fixed
        if (!isFixed) {
            const rect = taskbar.getBoundingClientRect();
            backdrop.style.left = (rect.left + window.scrollX) + 'px';
            backdrop.style.top = (rect.top + window.scrollY) + 'px';
            backdrop.style.width = rect.width + 'px';
            backdrop.style.height = rect.height + 'px';
        }
        onScroll();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // In case the page loads scrolled or content above changes dynamically
    setTimeout(onResize, 200);
});

// Minimal taskbar JS: clock updater and start menu toggle scoped to this taskbar.
(function(){
    // Clock + date display with optional timezone support and AM/PM (no seconds)
    // If the #clock element has a `data-timezone` attribute (IANA tz string)
    // it will be used; otherwise the browser locale/timezone is used.
    function lt() {
        var t = document.querySelector("#clock");
        if (!t) return;

        // Detect timezone via IP geolocation (cached on window). Runs in the
        // user's browser so their IP is what the geolocation service will see.
        async function detectTimezone() {
            if (window.__detectedClockTZ) return window.__detectedClockTZ;
            try {
                // Use a short timeout so a blocked or slow request doesn't delay rendering
                var controller = new AbortController();
                var timeoutId = setTimeout(function() { controller.abort(); }, 2500);
//                var resp = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!resp.ok) throw new Error('tz fetch failed');
                var json = await resp.json();
                if (json && json.timezone) {
                    window.__detectedClockTZ = json.timezone;
                    return json.timezone;
                }
            } catch (e) {
                // silently fail and fallback to browser locale
            }
            return undefined;
        }

        async function render() {
            var now = new Date();
            var tz = t.dataset && t.dataset.timezone ? t.dataset.timezone : undefined;
            if (!tz) tz = await detectTimezone();
            var timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            var dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            try {
                var timeFormatter = tz ? new Intl.DateTimeFormat(undefined, Object.assign({ timeZone: tz }, timeOptions)) : new Intl.DateTimeFormat(undefined, timeOptions);
                var dateFormatter = tz ? new Intl.DateTimeFormat(undefined, Object.assign({ timeZone: tz }, dateOptions)) : new Intl.DateTimeFormat(undefined, dateOptions);
                var timeStr = timeFormatter.format(now);
                // Ensure AM/PM is capitalized (e.g. 'am' -> 'AM', 'a.m.' -> 'AM')
                timeStr = timeStr.replace(/(a\.?m\.?|p\.?m\.?)/ig, function(m){ return m.toUpperCase().replace(/\./g,''); });
                var dateStr = dateFormatter.format(now);
                t.innerHTML = "<div>" + timeStr + "</div><div>" + dateStr + "</div>";
            } catch (err) {
                var timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
                timeStr = timeStr.replace(/(a\.?m\.?|p\.?m\.?)/ig, function(m){ return m.toUpperCase().replace(/\./g,''); });
                var dateStr = now.toLocaleDateString();
                t.innerHTML = "<div>" + timeStr + "</div><div>" + dateStr + "</div>";
            }
        }

        // initial render (don't await detect) and then update every second
        render();
        setInterval(function() { render(); }, 1000);
    }

    document.addEventListener('DOMContentLoaded', function(){
        lt();
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








/*
      _             _            __   _            _    _                       _    __      __      _____  _____ _____  _____ _____ _______ 
     | |           | |          / _| | |          | |  | |                     | |  /\ \    / /\    / ____|/ ____|  __ \|_   _|  __ \__   __|
  ___| |_ __ _ _ __| |_    ___ | |_  | |_ __ _ ___| | _| |__   __ _ _ __       | | /  \ \  / /  \  | (___ | |    | |__) | | | | |__) | | |   
 / __| __/ _` | '__| __|  / _ \|  _| | __/ _` / __| |/ / '_ \ / _` | '__|  _   | |/ /\ \ \/ / /\ \  \___ \| |    |  _  /  | | |  ___/  | |   
 \__ \ || (_| | |  | |_  | (_) | |   | || (_| \__ \   <| |_) | (_| | |    | |__| / ____ \  / ____ \ ____) | |____| | \ \ _| |_| |      | |   
 |___/\__\__,_|_|   \__|  \___/|_|    \__\__,_|___/_|\_\_.__/ \__,_|_|     \____/_/    \_\/_/    \_\_____/ \_____|_|  \_\_____|_|      |_|   
                                                                                                                                             
                                                                                                                                             
*/
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

        var maxShift = 12; // maximum shift in px when taskbar reaches top
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


  // Liquid Glass Effect
  (function() {
    try {
      const canvas = document.getElementById("liquid-glass-canvas");
      const gl = canvas.getContext("webgl");
      const img = new Image();
      img.src = 'images/screenshot.png';
      img.crossOrigin = 'anonymous';

      const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight-42;
      };
      setCanvasSize();

      const vsSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision mediump float;

        uniform vec3 iResolution;
        uniform float iTime;
        uniform vec4 iMouse;
        uniform sampler2D iChannel0;
        uniform vec2 iImageResolution;
        uniform float uEnabled;
  uniform vec2 uCenterA;
  uniform vec2 uCenterB;
  // per-lens pixel radii for asymmetric width/height control (pixels)
  uniform vec2 uRadiusB;

        void mainImage(out vec4 fragColor, in vec2 fragCoord)
        {
          // Constant definitions
          const float NUM_ZERO = 0.0;
          const float NUM_ONE = 1.0;
          const float NUM_HALF = 0.5;
          const float NUM_TWO = 2.0;
          const float POWER_EXPONENT = 6.0;
          const float MASK_MULTIPLIER_1 = 50000.0;
          const float MASK_MULTIPLIER_2 = 47500.0;
          const float MASK_MULTIPLIER_3 = 55000.0;
          const float LENS_MULTIPLIER = 5000.0;
          const float MASK_STRENGTH_1 = 8.0;
          const float MASK_STRENGTH_2 = 16.0;
          const float MASK_STRENGTH_3 = 2.0;
          const float MASK_THRESHOLD_1 = 0.95;
          const float MASK_THRESHOLD_2 = 0.9;
          const float MASK_THRESHOLD_3 = 1.5;
          const float SAMPLE_RANGE = 4.0;
          const float SAMPLE_OFFSET = 1.0;
          const float GRADIENT_RANGE = 0.2;
          const float GRADIENT_OFFSET = 0.1;
          const float GRADIENT_EXTREME = -1000.0;
          const float LIGHTING_INTENSITY = 0.3;

          vec2 canvasUV = fragCoord / iResolution.xy;
          float scale = max(iResolution.x / iImageResolution.x, iResolution.y / iImageResolution.y);
          vec2 center = iResolution.xy * 0.5;
          vec2 offset = fragCoord - center;
          vec2 texUV = offset / (iImageResolution.xy * scale) + 0.5;

          // compute two lens masks (A = bottom-right by default, B = top-left)
          vec2 ca = uCenterA / iResolution.xy;
          vec2 cb = uCenterB / iResolution.xy;

          // m2 for each lens (smaller core for both)
          // keep lens A calculation as before (unchanged)
          vec2 m2a = (canvasUV - ca) * 0.7;
          // compute lens B using pixel-radius so we can have independent
          // width/height (tall/narrow) without altering lens A.
          vec2 relB = fragCoord - uCenterB; // pixel offset from center
          // normalize by the pixel radius (uRadiusB) to get unit-space for mask
          vec2 m2b = relB / uRadiusB;

          float roundedBoxA = pow(abs(m2a.x * iResolution.x / iResolution.y), POWER_EXPONENT) + pow(abs(m2a.y), POWER_EXPONENT);
          float ra1 = clamp((NUM_ONE - roundedBoxA * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
          float ra2 = clamp((MASK_THRESHOLD_1 - roundedBoxA * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
            clamp(pow(MASK_THRESHOLD_2 - roundedBoxA * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
          float ra3 = clamp((MASK_THRESHOLD_3 - roundedBoxA * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
            clamp(pow(NUM_ONE - roundedBoxA * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);
          float transA = smoothstep(NUM_ZERO, NUM_ONE, ra1 + ra2);

          float roundedBoxB = pow(abs(m2b.x * iResolution.x / iResolution.y), POWER_EXPONENT) + pow(abs(m2b.y), POWER_EXPONENT);
          float rb1 = clamp((NUM_ONE - roundedBoxB * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
          float rb2 = clamp((MASK_THRESHOLD_1 - roundedBoxB * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
            clamp(pow(MASK_THRESHOLD_2 - roundedBoxB * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
          float rb3 = clamp((MASK_THRESHOLD_3 - roundedBoxB * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
            clamp(pow(NUM_ONE - roundedBoxB * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);
          float transB = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);

          // base image
          vec4 base = texture2D(iChannel0, texUV);

          // apply effects only when enabled
          float enabled = uEnabled;

          vec4 result = base;

          if (enabled > NUM_ZERO) {
            // lens A sampling
            if (transA > NUM_ZERO) {
              vec2 lensA = ((canvasUV - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBoxA * LENS_MULTIPLIER) + NUM_HALF);
              vec4 accumA = vec4(NUM_ZERO);
              float totalA = NUM_ZERO;
              for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
                for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
                  vec2 off = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
                  vec2 sCanvasUV = off + lensA;
                  vec2 sFrag = sCanvasUV * iResolution.xy;
                  vec2 sOff = sFrag - center;
                  vec2 sTex = sOff / (iImageResolution.xy * scale) + 0.5;
                  accumA += texture2D(iChannel0, sTex);
                  totalA += NUM_ONE;
                }
              }
              accumA /= totalA;
              float gradA = clamp((clamp(m2a.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
                clamp((clamp(-m2a.y, GRADIENT_EXTREME, GRADIENT_RANGE) * ra3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
              vec4 pinkTint = vec4(1.0, 0.8, 0.9, 1.0);
              vec4 lightA = clamp(accumA * pinkTint + vec4(ra1) * gradA + vec4(ra2) * LIGHTING_INTENSITY, NUM_ZERO, NUM_ONE);
              result = mix(result, lightA, transA);
            }

            // lens B sampling
            if (transB > NUM_ZERO) {
              vec2 lensB = ((canvasUV - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBoxB * LENS_MULTIPLIER) + NUM_HALF);
              vec4 accumB = vec4(NUM_ZERO);
              float totalB = NUM_ZERO;
              for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
                for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
                  vec2 off = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
                  vec2 sCanvasUV = off + lensB;
                  vec2 sFrag = sCanvasUV * iResolution.xy;
                  vec2 sOff = sFrag - center;
                  vec2 sTex = sOff / (iImageResolution.xy * scale) + 0.5;
                  accumB += texture2D(iChannel0, sTex);
                  totalB += NUM_ONE;
                }
              }
              accumB /= totalB;
              float gradB = clamp((clamp(m2b.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
                clamp((clamp(-m2b.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
              vec4 pinkTint = vec4(1.0, 0.8, 0.9, 1.0);
              vec4 lightB = clamp(accumB * pinkTint + vec4(rb1) * gradB + vec4(rb2) * LIGHTING_INTENSITY, NUM_ZERO, NUM_ONE);
              result = mix(result, lightB, transB);
            }
          }

          fragColor = result;
        }

        void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
        }
      `;

      const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("Shader error:", gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      const program = gl.createProgram();

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const uniforms = {
        resolution: gl.getUniformLocation(program, "iResolution"),
        time: gl.getUniformLocation(program, "iTime"),
        mouse: gl.getUniformLocation(program, "iMouse"),
        texture: gl.getUniformLocation(program, "iChannel0"),
        imageResolution: gl.getUniformLocation(program, "iImageResolution"),
        enabled: gl.getUniformLocation(program, "uEnabled"),
        centerA: gl.getUniformLocation(program, "uCenterA"),
        centerB: gl.getUniformLocation(program, "uCenterB"),
        radiusB: gl.getUniformLocation(program, "uRadiusB"),
      };

      let mouse = [canvas.width - 210, 200]; // bottom right

      // Keep canvas visible at all times. Toggle the glass effect (shader) via
      // the `uEnabled` uniform when the user clicks the music tray icon.
      let glassEnabled = 1.0;
      const musicIcon = document.querySelector('.small-icon.music');
      if (musicIcon) {
        musicIcon.style.cursor = 'pointer';
        musicIcon.addEventListener('click', () => {
          glassEnabled = glassEnabled ? 0.0 : 1.0;
          try { gl.uniform1f(uniforms.enabled, glassEnabled); } catch (e) { /* ignore until program ready */ }
          musicIcon.classList.toggle('glass-off', glassEnabled === 0.0);
        });
      }

      const texture = gl.createTexture();
      const setupTexture = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform2f(uniforms.imageResolution, img.width, img.height);
        // ensure effect starts enabled
        try { gl.uniform1f(uniforms.enabled, 1.0); } catch (e) { }
      };

      if (img.complete) {
        setupTexture();
      } else {
        img.onload = setupTexture;
      }

      // Rendering
      const startTime = performance.now();
      const render = () => {
        const currentTime = (performance.now() - startTime) / 1000;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
        gl.uniform1f(uniforms.time, currentTime);
        gl.uniform4f(uniforms.mouse, mouse[0], mouse[1], 0, 0);
        // update shader-controlled toggles and lens centers every frame
        try {
          gl.uniform1f(uniforms.enabled, glassEnabled);
          // place one lens at the top-left and the other at the bottom-right
          gl.uniform2f(uniforms.centerA, 1650.0, 200.0); // top-left (unchanged)

          // centerB explicit settings — easy to tweak
          const lensBSettings = {
            x: 1650.0,
            y: 282.0,
            width: 5300.0,  // total width in pixels
            height: 3300.0 // total height in pixels
          };
          gl.uniform2f(uniforms.centerB, lensBSettings.x, lensBSettings.y);
          // shader expects radii (half-dimensions)
          gl.uniform2f(uniforms.radiusB, lensBSettings.width * 0.5, lensBSettings.height * 0.5);
        } catch (e) {}

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.texture, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
      };

      render();
    } catch (e) {
      console.error("Liquid glass error:", e);
    }
  })();

