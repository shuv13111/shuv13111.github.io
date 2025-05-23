document.addEventListener('DOMContentLoaded', () => {
    // Get the background container
    const container = document.getElementById('bg-animation');
    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Track mouse position
    const mouse = {
        x: undefined,
        y: undefined,
        radius: 100
    };

    // Array to store particles
    let particles = [];
    const particleCount = 40;
    
    // Canvas sizing
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Create particles AFTER canvas is sized
        createParticles();
    }
    
    // Create a particle object - avoiding class syntax entirely
    function createParticle(x, y) {
        return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 2 + 1.5,
            density: (Math.random() * 15) + 10,
            color: '255, 255, 255',
            opacity: Math.random() * 0.4 + 0.1,
            
            // Methods as object properties
            draw: function() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.fill();
            },
            
            update: function() {
                // Return to base position
                this.x += (this.baseX - this.x) * 0.02;
                this.y += (this.baseY - this.y) * 0.02;
                
                // Mouse interaction
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const moveX = forceDirectionX * force * this.density * -0.8;
                        const moveY = forceDirectionY * force * this.density * -0.8;
                        this.x += moveX;
                        this.y += moveY;
                    }
                }
            }
        };
    }
    
    // Populate particles array
    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(createParticle(x, y));
        }
    }

    // Initialize canvas and particles
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Mouse events
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }, { passive: true });
    
    window.addEventListener('touchend', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    // Color schemes for different sections
    const colorSchemes = {
        hero: {
            start: { r: 10, g: 25, b: 47 },      // Dark blue
            mid: { r: 8, g: 35, b: 66 },         // Slightly lighter blue
            end: { r: 6, g: 15, b: 30 },         // Darker blue
            waveColors: [
                '0, 255, 255',                   // Cyan
                '0, 210, 255',                   // Sky blue
                '0, 255, 210'                    // Teal
            ]
        },
        about: {
            start: { r: 15, g: 30, b: 60 },      // Slightly brighter blue
            mid: { r: 20, g: 40, b: 70 },        // Medium blue
            end: { r: 10, g: 20, b: 45 },        // Dark blue
            waveColors: [
                '80, 200, 255',                  // Light blue
                '40, 180, 240',                  // Medium blue
                '0, 210, 255'                    // Sky blue
            ]
        },
        projects: {
            start: { r: 20, g: 35, b: 70 },     // Medium blue-purple
            mid: { r: 25, g: 45, b: 80 },       // Lighter blue-purple
            end: { r: 15, g: 25, b: 55 },       // Darker blue-purple
            waveColors: [
                '100, 180, 255',                // Periwinkle
                '120, 130, 255',                // Lavender
                '90, 150, 255'                  // Light indigo
            ]
        },
        experience: {
            start: { r: 25, g: 20, b: 50 },     // Deep purple
            mid: { r: 35, g: 25, b: 65 },       // Medium purple
            end: { r: 20, g: 15, b: 40 },       // Dark purple
            waveColors: [
                '180, 100, 255',                // Light purple
                '140, 80, 255',                 // Medium purple
                '120, 40, 240'                  // Deep purple
            ]
        }
    };

    // Current colors
    let currentColors = {
        start: { ...colorSchemes.hero.start },
        mid: { ...colorSchemes.hero.mid },
        end: { ...colorSchemes.hero.end },
        waveColors: [...colorSchemes.hero.waveColors]
    };

    // Wave settings
    const waves = [
        { amplitude: 50, frequency: 0.005, speed: 0.0005, y: 0.4, opacity: 0.03 },
        { amplitude: 30, frequency: 0.008, speed: 0.001, y: 0.5, opacity: 0.02 },
        { amplitude: 60, frequency: 0.003, speed: 0.0008, y: 0.6, opacity: 0.03 }
    ];

    // Animation time
    let time = 0;

    // Color interpolation
    function lerpColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + factor * (color2.r - color1.r)),
            g: Math.round(color1.g + factor * (color2.g - color1.g)),
            b: Math.round(color1.b + factor * (color2.b - color1.b))
        };
    }

    // Update colors based on scroll position
    function updateColors() {
        const aboutProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress') || 0);
        const projectsProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--projects-progress') || 0);
        const experienceProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--experience-progress') || 0);
        
        let targetWaveColors = colorSchemes.hero.waveColors;

        if (experienceProgress > 0) {
            currentColors.start = lerpColor(colorSchemes.projects.start, colorSchemes.experience.start, experienceProgress);
            currentColors.mid = lerpColor(colorSchemes.projects.mid, colorSchemes.experience.mid, experienceProgress);
            currentColors.end = lerpColor(colorSchemes.projects.end, colorSchemes.experience.end, experienceProgress);
            targetWaveColors = experienceProgress > 0.5 ? colorSchemes.experience.waveColors : colorSchemes.projects.waveColors;
        } 
        else if (projectsProgress > 0) {
            currentColors.start = lerpColor(colorSchemes.about.start, colorSchemes.projects.start, projectsProgress);
            currentColors.mid = lerpColor(colorSchemes.about.mid, colorSchemes.projects.mid, projectsProgress);
            currentColors.end = lerpColor(colorSchemes.about.end, colorSchemes.projects.end, projectsProgress);
            targetWaveColors = projectsProgress > 0.5 ? colorSchemes.projects.waveColors : colorSchemes.about.waveColors;
        } 
        else if (aboutProgress > 0) {
            currentColors.start = lerpColor(colorSchemes.hero.start, colorSchemes.about.start, aboutProgress);
            currentColors.mid = lerpColor(colorSchemes.hero.mid, colorSchemes.about.mid, aboutProgress);
            currentColors.end = lerpColor(colorSchemes.hero.end, colorSchemes.about.end, aboutProgress);
            targetWaveColors = aboutProgress > 0.5 ? colorSchemes.about.waveColors : colorSchemes.hero.waveColors;
        } 
        else {
            currentColors.start = { ...colorSchemes.hero.start };
            currentColors.mid = { ...colorSchemes.hero.mid };
            currentColors.end = { ...colorSchemes.hero.end };
            targetWaveColors = colorSchemes.hero.waveColors;
        }
        for (let i = 0; i < waves.length; i++) {
            if (targetWaveColors[i]) {
                 waves[i].color = targetWaveColors[i];
            }
        }
    }

    // Draw background gradient
    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `rgb(${currentColors.start.r}, ${currentColors.start.g}, ${currentColors.start.b})`);
        gradient.addColorStop(0.5, `rgb(${currentColors.mid.r}, ${currentColors.mid.g}, ${currentColors.mid.b})`);
        gradient.addColorStop(1, `rgb(${currentColors.end.r}, ${currentColors.end.g}, ${currentColors.end.b})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw animated waves
    function drawWave(wave, index) {
        ctx.beginPath();
        const y = canvas.height * wave.y;
        ctx.moveTo(0, y);
        for (let x = 0; x < canvas.width; x++) {
            const dx = x * wave.frequency;
            const dy = Math.sin(dx + time * wave.speed) * wave.amplitude;
            ctx.lineTo(x, y + dy);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        const waveColor = wave.color || colorSchemes.hero.waveColors[index];
        ctx.fillStyle = `rgba(${waveColor}, ${wave.opacity})`;
        ctx.fill();
    }

    // Draw star-like particles
    function drawStars() {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.7;
            const size = Math.random() * 1.5 + 0.5;
            const scrollProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress') || 0);
            const opacity = Math.random() * 0.15 + 0.05 - (scrollProgress * 0.05);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
            ctx.fill();
        }
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateColors();
        drawBackground();
        drawStars();
        waves.forEach((wave, index) => {
            drawWave(wave, index);
        });
        
        // Update and draw particles
        particles.forEach(particle => particle.update());
        particles.forEach(particle => particle.draw());
        
        time += 1;
        requestAnimationFrame(animate);
    }

    // Set initial CSS variables
    document.documentElement.style.setProperty('--scroll-progress', '0');
    document.documentElement.style.setProperty('--projects-progress', '0');
    document.documentElement.style.setProperty('--experience-progress', '0');

    // Start animation
    animate();
});