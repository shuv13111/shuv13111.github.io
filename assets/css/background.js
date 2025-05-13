import * as THREE from './three.module.js';

let scene, camera, renderer;
let particles;
const particleCount = 5000; // Number of particles
const mouse = new THREE.Vector2(); // To store mouse position

// Initialize the animation
function init() {
    const container = document.getElementById('bg-animation');
    if (!container) {
        console.error("Error: The div with id 'bg-animation' was not found.");
        return;
    }

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60; // Adjust camera position to view particles

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha:true for transparent background if needed
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        // Position particles randomly in a larger cube
        positions[i * 3] = (Math.random() - 0.5) * 250;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 250;

        // Assign slightly varied colors (e.g., cool blues/purples)
        color.setHSL(0.55 + Math.random() * 0.15, 0.7, 0.5 + Math.random() * 0.2);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true, // Enable vertex colors
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending // For a brighter, glowing effect
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Event Listeners
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Handle mouse movement
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;

    // Make particles react to mouse
    // This creates a subtle pull/push effect or general movement influence
    for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        // const iz = i * 3 + 2; // z-component

        // Example: particles move slightly on their X and Y based on mouse
        // The factor (e.g., 0.0005) controls sensitivity.
        // A more direct interaction would involve raycasting or checking distance to mouse vector
        positions[ix] += (mouse.x * 20 - positions[ix]) * 0.0003; // Influence X position
        positions[iy] += (mouse.y * 20 - positions[iy]) * 0.0003; // Influence Y position

        // Add a very slow, gentle drift/twinkle to particles
        positions[iy] += Math.sin(Date.now() * 0.0001 + ix) * 0.005;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Gently rotate the entire particle system for ambient motion
    particles.rotation.x += 0.00005;
    particles.rotation.y += 0.0001;

    renderer.render(scene, camera);
}

// Start animation once DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // DOMContentLoaded has already fired
} 