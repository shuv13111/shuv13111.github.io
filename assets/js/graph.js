// Import necessary modules from Three.js CDN (jsm paths)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// Basic Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  3000
);
camera.position.z = 800;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Create Particle Geometry with a Spiral Distribution
const particleCount = 60; // Adjust for performance if needed
const radius = 1000;        // Overall radius of the swirl
const spiralTurns = 3;      // Number of spiral turns

const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const startColor = new THREE.Color(0x00ffff); // Cyan (example)
const endColor = new THREE.Color(0xffffff);   // White

for (let i = 0; i < particleCount; i++) {
  const t = i / particleCount;
  const angle = t * spiralTurns * Math.PI * 2;
  const r = t * radius;
  
  // Calculate positions for a spiral in the XY plane with slight randomness in Z
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  const z = (Math.random() - 0.5) * 200;
  
  positions[i * 3]     = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
  
  // Interpolate the color from cyan to white based on t
  const color = startColor.clone().lerp(endColor, t);
  colors[i * 3]     = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 3,
  vertexColors: true,
  transparent: true
});

const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

// Bloom (Glow) Effect Setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,  // bloom strength
  0.4,  // bloom radius
  0.85  // bloom threshold
);
composer.addPass(bloomPass);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  
  // Slowly rotate the point cloud for a dynamic effect
  pointCloud.rotation.y += 0.001;
  pointCloud.rotation.x += 0.0005;
  
  // Render the scene with bloom
  composer.render();
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
