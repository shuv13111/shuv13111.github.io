document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize animations once everything is loaded
    initScrollAnimations();
    setupRevealObserver();
});

function initScrollAnimations() {
    // Create a timeline for the hero section
    const heroTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            markers: true, // For development - shows trigger points
        }
    });

    // Hero section animations
    heroTimeline
        .to('.hero h1', { 
            y: -50, 
            opacity: 0,
            ease: 'power2.inOut' 
        }, 0)
        .to('.hero .subtitle', { 
            y: -30, 
            opacity: 0,
            ease: 'power2.inOut' 
        }, 0.1)
        .to('.hero .tagline', { 
            y: -20, 
            opacity: 0,
            ease: 'power2.inOut' 
        }, 0.2)
        .to('.cta-buttons', { 
            y: -10, 
            opacity: 0,
            ease: 'power2.inOut' 
        }, 0.3);

    // About section reveal animation
    const aboutTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
            markers: true, // For development
        }
    });

    aboutTimeline
        .from('#about h2', { 
            y: 50, 
            opacity: 0,
            ease: 'power2.out' 
        }, 0)
        .from('.about-content', { 
            y: 70, 
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out' 
        }, 0.2);

    // Background color transitions
    gsap.to('#bg-animation', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
        },
        onUpdate: function() {
            // We'll use this to control our background wave colors and behavior
            // This is just a placeholder for the POC
            const progress = this.progress();
            document.documentElement.style.setProperty('--scroll-progress', progress);
        }
    });
}

// Setup Intersection Observer for reveal animations
function setupRevealObserver() {
    const revealElements = document.querySelectorAll('.reveal, .fade-in, .slide-in-left, .slide-in-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
} 