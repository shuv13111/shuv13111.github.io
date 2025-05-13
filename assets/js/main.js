/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

document.addEventListener('DOMContentLoaded', () => {
    // Get all sections that have an ID defined
    const sections = document.querySelectorAll("section[id]");
    
    // Add active class to nav items when scrolling
    const scrollActive = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`nav a[href*=${sectionId}]`).classList.add("active");
            } else {
                document.querySelector(`nav a[href*=${sectionId}]`).classList.remove("active");
            }
        });
    };
    
    window.addEventListener("scroll", scrollActive);
    
    // Add scroll reveal animation to elements
    const revealElements = () => {
        const elements = document.querySelectorAll('.project-card, .timeline-item, .section-container');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('revealed');
            }
        });
    };
    
    // Initial check for elements in view
    revealElements();
    
    // Check again on scroll
    window.addEventListener('scroll', revealElements);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .project-card, .timeline-item, .section-container {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        nav a.active {
            color: var(--primary-color);
        }
        
        nav a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});