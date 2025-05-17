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
            markers: false, // Removed debug markers
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
            markers: false, // Removed debug markers
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

    // Projects section animations
    const projectsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '#projects',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
            markers: false,
        }
    });

    projectsTimeline
        .from('#projects h2', { 
            y: 50, 
            opacity: 0,
            ease: 'power2.out' 
        }, 0);

    // Experience section animations
    const experienceTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '#experience',
            start: 'top bottom', // Change to trigger as soon as the bottom of the viewport reaches the top of the section
            end: 'bottom center',
            scrub: false, // Disable scrubbing to make animation happen immediately
            markers: false,
            toggleActions: 'play none none none', // Play animation once when entering
            onEnter: () => {
                console.log("Experience section entered viewport"); // Debugging log
                // Manually set experience section to visible if needed
                document.getElementById('experience').style.opacity = 1;
                document.getElementById('experience').style.visibility = 'visible';
                
                // Make timeline items visible
                document.querySelectorAll('#experience .timeline-item').forEach(item => {
                    item.style.opacity = 1;
                    item.style.visibility = 'visible';
                    item.style.transform = 'none';
                });
            }
        }
    });

    experienceTimeline
        .from('#experience h2', { 
            y: 50, 
            opacity: 0,
            autoAlpha: 0,
            ease: 'power2.out',
            duration: 0.5
        }, 0)
        .from('#experience .timeline-item', {
            x: -50,
            opacity: 0,
            autoAlpha: 0,
            stagger: 0.2,
            ease: 'power2.out',
            duration: 0.5
        }, 0.2);

    // Background color transitions for all sections
    // Hero to About transition
    gsap.to('#bg-animation', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
        },
        onUpdate: function() {
            const progress = this.progress();
            document.documentElement.style.setProperty('--scroll-progress', progress);
        }
    });
    
    // Projects section background transition
    gsap.to('#bg-animation', {
        scrollTrigger: {
            trigger: '#projects',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
        },
        onUpdate: function() {
            const progress = this.progress();
            document.documentElement.style.setProperty('--projects-progress', progress);
        }
    });
    
    // Experience section background transition
    gsap.to('#bg-animation', {
        scrollTrigger: {
            trigger: '#experience',
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
        },
        onUpdate: function() {
            const progress = this.progress();
            document.documentElement.style.setProperty('--experience-progress', progress);
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