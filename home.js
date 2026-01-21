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
                currentPhrase = 1;
                gsap.to(".col-1", { opacity: 0, scale: 0.75, duration: 0.75 }); //switch to phase 1 if we are still on 0
                gsap.to(".col-2", { x: "0%", duration: 0.75 }); //move in from the right
                gsap.to(".col-3", { y: "0%", duration: 0.75 }); //move in from the bottom

                gsap.to(".col-img img", { scale: 1.25, duration: 0.75 });
                gsap.to(".col-img-0", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.75,
                });
                gsap.to(".col-img-2 img", { scale: 1, duration: 0.75 });
            }

            if (progress >= 0.5 && currentPhrase === 1) {
                currentPhrase = 2;

                gsap.to(".col-2", { opacity: 0, scale: 0.75, duration: 0.75 }); //switch to phase 2 if we are still on 1
                gsap.to(".col-3", { x: "0%", duration: 0.75, scale: 0.98 }); //move in from the bottom
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
                currentPhrase = 0;

                gsap.to(".col-1", { opacity: 1, scale: 1, duration: 0.75 });
                gsap.to(".col-2", { x: "100%", duration: 0.75 });
                gsap.to(".col-3", { y: "100%", duration: 0.75 });

                gsap.to(".col-img-1 img", { scale: 1, duration: 0.75 });
                gsap.to(".col-img-2", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    duration: 0.75,
                });
                gsap.to(".col-img-2 img", { scale: 1.25, duration: 0.75 });
            }

            if (progress < 0.5 && currentPhrase === 2) {
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
});