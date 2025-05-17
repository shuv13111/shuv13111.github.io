document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bg-animation');
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Full screen canvas
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Color configurations for different sections
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
        }
    };

    // Current color state
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

    // Function to interpolate between two colors
    function lerpColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + factor * (color2.r - color1.r)),
            g: Math.round(color1.g + factor * (color2.g - color1.g)),
            b: Math.round(color1.b + factor * (color2.b - color1.b))
        };
    }

    // Function to update colors based on scroll progress
    function updateColors(scrollProgress) {
        // Interpolate between hero and about color schemes
        currentColors.start = lerpColor(colorSchemes.hero.start, colorSchemes.about.start, scrollProgress);
        currentColors.mid = lerpColor(colorSchemes.hero.mid, colorSchemes.about.mid, scrollProgress);
        currentColors.end = lerpColor(colorSchemes.hero.end, colorSchemes.about.end, scrollProgress);
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

    // Draw a subtle wave
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
        
        // Get wave color based on current interpolation
        const scrollProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress') || 0);
        const color1 = colorSchemes.hero.waveColors[index];
        const color2 = colorSchemes.about.waveColors[index];
        
        // For simplicity, just switch colors based on scroll threshold
        const waveColor = scrollProgress > 0.5 ? color2 : color1;
        
        ctx.fillStyle = `rgba(${waveColor}, ${wave.opacity})`;
        ctx.fill();
    }

    // Add subtle stars/dots
    function drawStars() {
        // Create a few subtle stars
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.7; // Keep stars in upper part
            const size = Math.random() * 1.5 + 0.5;
            
            // Fade stars based on scroll progress
            const scrollProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress') || 0);
            const opacity = Math.random() * 0.15 + 0.05 - (scrollProgress * 0.05);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
            ctx.fill();
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get current scroll progress
        const scrollProgress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress') || 0);
        
        // Update colors based on scroll
        updateColors(scrollProgress);
        
        // Draw background
        drawBackground();
        
        // Draw stars
        drawStars();
        
        // Draw waves
        waves.forEach((wave, index) => {
            drawWave(wave, index);
        });
        
        // Update time
        time += 1;
        
        requestAnimationFrame(animate);
    }

    // Set CSS variable for initial state
    document.documentElement.style.setProperty('--scroll-progress', '0');

    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', setCanvasSize);
});