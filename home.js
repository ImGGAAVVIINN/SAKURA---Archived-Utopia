// Use globals provided by the CDN scripts included in `home.html`:
// - `gsap` (GSAP core)
// - `ScrollTrigger` (GSAP plugin)
// - `SplitText` (GSAP SplitText plugin)
// - `Lenis` (lenis smooth-scrolling)
// The page loads these from CDN, so we can reference them as globals instead
// of using ES module imports which require the script to be loaded as a module.

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

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
                gsap.to(".col-img-2", {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.75,
                });
                gsap.to(".col-img-2 img", { scale: 1, duration: 0.75 });
            }

            if (progress >= 0.5 && currentPhrase === 1) {
                currentPhrase = 2;

                gsap.to(".col-2", { opacity: 0, scale: 0.75, duration: 0.75 }); //switch to phase 2 if we are still on 1
                gsap.to(".col-3", { x: "0%", duration: 0.75 }); //move in from the bottom
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
                gsap.to(".col-3", { x: "100%", duration: 0.75 });
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
            }
        },
    })
});