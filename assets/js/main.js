/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js loaded"); // Log to confirm script is running
    
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
    
    // The IntersectionObserver in scroll-effects.js now handles adding the .active class to .reveal elements.
    // The .reveal.active CSS in style.css handles the reveal animation.
    // This script (main.js) will just add the base CSS for navigation active states.

    const style = document.createElement('style');
    style.textContent = `
        nav a.active {
            color: var(--primary-color);
        }
        
        nav a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});