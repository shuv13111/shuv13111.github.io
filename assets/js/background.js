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

    // Mouse interaction
    const mouse = {
        x: undefined,
        y: undefined,
        radius: 150 // Interaction radius
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    // Touch support for mobile
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

    // Particle system
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 1.8 + 0.8;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.distance = undefined;
            this.color = this.getRandomColor();
            this.opacity = Math.random() * 0.6 + 0.3;
            
            // Each particle gets its own frequency and phase for independent movement
            this.amplitude = Math.random() * 0.8 + 0.1; // How far it moves
            this.frequency = Math.random() * 0.002 + 0.001; // How fast it cycles
            this.phase = Math.random() * Math.PI * 2; // Starting point in the cycle
        }

        getRandomColor() {
            // Primary colors for the particles - teal/cyan dominant with some variation
            const colors = [
                '0, 255, 255',   // Cyan (primary)
                '0, 210, 255',   // Sky blue
                '0, 255, 210',   // Teal
                '0, 180, 210',   // Dark cyan
                '100, 255, 255', // Light cyan
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }

        update() {
            // Wave-like motion that's more gentle and won't cause dizziness
            const time = Date.now();
            
            // X movement - gentle horizontal drift based on sine wave
            this.x = this.baseX + Math.sin((time * this.frequency) + this.phase) * this.amplitude * 3;
            
            // Y movement - gentle vertical drift based on cosine wave with different phase
            this.y = this.baseY + Math.cos((time * this.frequency) + this.phase + Math.PI/2) * this.amplitude * 2;
            
            // Check mouse proximity for interaction effect
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Create repulsion effect
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    const directionX = forceDirectionX * force * this.density * -0.6;
                    const directionY = forceDirectionY * force * this.density * -0.6;
                    
                    this.x += directionX;
                    this.y += directionY;
                }
            }
        }
    }

    class Connection {
        constructor(particle1, particle2, distance) {
            this.particle1 = particle1;
            this.particle2 = particle2;
            this.distance = distance;
            this.opacity = 0;
            this.active = false;
            
            // Add subtle pulsing to connections
            this.pulseSpeed = Math.random() * 0.0015 + 0.0005;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        draw() {
            // Only draw connections within distance threshold and with some opacity
            if (this.active && this.opacity > 0.05) {
                const pulse = 0.2 * Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
                
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 230, ${(this.opacity * 0.7) + pulse})`; 
                ctx.lineWidth = 0.5;
                ctx.moveTo(this.particle1.x, this.particle1.y);
                ctx.lineTo(this.particle2.x, this.particle2.y);
                ctx.stroke();
            }
        }

        update() {
            const dx = this.particle1.x - this.particle2.x;
            const dy = this.particle1.y - this.particle2.y;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Dynamically update connection visibility
            if (currentDistance < this.distance) {
                this.active = true;
                // Fade based on distance
                this.opacity = 1 - (currentDistance / this.distance);
            } else {
                this.active = false;
                this.opacity = 0;
            }
        }
    }

    // Initialize particles
    const particleCount = Math.min(180, Math.max(80, Math.floor(window.innerWidth * window.innerHeight / 8000)));
    let particles = [];
    let connections = [];

    function init() {
        particles = [];
        connections = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
        
        // Create connections between particles that are close enough
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].baseX - particles[j].baseX;
                const dy = particles[i].baseY - particles[j].baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Create connections only for particles within certain distance
                if (distance < 250) {
                    connections.push(new Connection(particles[i], particles[j], 250));
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        particles.forEach(particle => {
            particle.update();
        });
        
        // Update and draw connections first (behind particles)
        connections.forEach(connection => {
            connection.update();
            connection.draw();
        });
        
        // Draw particles on top
        particles.forEach(particle => {
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }

    // Initialize on load and when window is resized
    init();
    animate();
    
    // Reinitialize when window is resized to adapt to new dimensions
    window.addEventListener('resize', () => {
        setCanvasSize();
        init();
    });
});