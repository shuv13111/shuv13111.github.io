// Import necessary modules from Three.js CDN (jsm paths)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// Basic Scene Setup
const scene = new THREE.Scene();
scene.background = null; // Changed from 0x000000 to null for transparency

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  75, // Increased FOV from 60 to 75 for better visibility
  window.innerWidth / window.innerHeight,
  1,
  3000
);
camera.position.z = 1000; // Moved camera back a bit

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true
});
renderer.setClearColor(0x000000, 0); // Set clear color with 0 alpha
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Make sure container exists before adding canvas
const container = document.getElementById('container');
if (container) {
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(renderer.domElement);
} else {
    console.error('Container element not found!');
}

// Create Particle Geometry with a Spiral Distribution
const particleCount = 300; // More stars
const radius = 1200;      // Larger spread
const spiralTurns = 10;   // More spiral turns

// Create arrays for custom properties
const scales = new Float32Array(particleCount);
const rotationSpeeds = new Float32Array(particleCount);

const startColor = new THREE.Color(0xCCE6FF); // Light blue-white
const endColor = new THREE.Color(0xFFFFFF);   // Pure white

const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x444444,
    transparent: true,
    opacity: 0.95,
    shininess: 100
});

const geometry = new THREE.SphereGeometry(1, 16, 16); // Increased segments for smoother spheres
const points = new THREE.InstancedMesh(geometry, material, particleCount);

// Set position, scale, and color for each instance
const matrix = new THREE.Matrix4();
const scale = new THREE.Vector3();
for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const angle = t * spiralTurns * Math.PI * 2;
    const r = t * radius;
    
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = (Math.random() - 0.5) * 300;
    
    // Random scale between 0.8 and 2
    const starScale = 0.8 + Math.random() * 1.2;
    scales[i] = starScale;
    scale.set(starScale, starScale, starScale);
    
    // Random rotation speed
    rotationSpeeds[i] = (Math.random() - 0.5) * 0.002;
    
    matrix.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion(),
        scale
    );
    points.setMatrixAt(i, matrix);
    
    // Color varies with distance from center
    const color = startColor.clone().lerp(endColor, t);
    points.setColorAt(i, color);
}

scene.add(points);

// Bloom (Glow) Effect Setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // Adjusted bloom strength
    1.0,  // Increased bloom radius
    0.2   // Adjusted threshold
);
composer.addPass(bloomPass);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Base rotation
    points.rotation.y += 0.0003;
    points.rotation.x += 0.0001;
    
    // Parallax effect based on mouse position
    const mouseX = (window.mouseX || 0) - window.innerWidth / 2;
    const mouseY = (window.mouseY || 0) - window.innerHeight / 2;
    camera.position.x += (mouseX * 0.0002 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.0002 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Update individual star positions
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempScale = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    
    for (let i = 0; i < particleCount; i++) {
        points.getMatrixAt(i, tempMatrix);
        tempPosition.setFromMatrixPosition(tempMatrix);
        tempScale.setFromMatrixScale(tempMatrix);
        
        // Smoother movement with different frequencies for each star
        tempPosition.x += Math.sin(Date.now() * 0.0005 + i) * 0.08;
        tempPosition.y += Math.cos(Date.now() * 0.0004 + i) * 0.08;
        
        tempMatrix.compose(tempPosition, tempQuat, tempScale);
        points.setMatrixAt(i, tempMatrix);
    }
    
    points.instanceMatrix.needsUpdate = true;
    composer.render();
}

// Track mouse position
window.mouseX = 0;
window.mouseY = 0;
document.addEventListener('mousemove', (event) => {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
});

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
