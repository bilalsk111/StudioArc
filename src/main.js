import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  smooth: true,
  duration: 1.2, // Controls scroll smoothing duration
});

gsap.ticker.add((time) => {
  lenis.raf(time * 2500);
});
gsap.ticker.lagSmoothing(0);

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.body.appendChild(renderer.domElement);


// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0x0000, 0.8);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0x22222, 7.5);
mainLight.position.set(0.5, 5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x2222, 2);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0x55555, 0x909090, 1.5);
scene.add(hemiLight);

// Basic render loop
function basicAnimation() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimation);
}
basicAnimation();

// Load GLTF model
let model;
const loader = new GLTFLoader();
loader.load("./public/double-chair.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.metalness = 3;
        node.material.roughness = 1.5;
        node.material.envMapIntensity = 2;
        node.material.color.setHex(0x5f5f5f);
        
      }
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // Center model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  // Adjust camera position
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 2.5;

  // Initial scale and rotation
  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  // Stop basic animation and start custom animation
  cancelAnimationFrame(basicAnimation);
  animate();
});

// Variables for scroll and float effects
const scrollRotationSpeed = 0.008; // Lower value for smoother rotation
const floatAmplitude = 0.5; // Floating effect amplitude
const floatSpeed = 0.7; // Slower float speed for smooth motion
const baseTilt = 0.15; // Subtle tilt effect
let previousScroll = 0;
let currentScroll = 0;

// Smooth scrolling rotation
lenis.on("scroll", (e) => {
  let currentScroll = e.scroll;
  let scrollDelta = currentScroll - previousScroll;
  if (model) model.rotation.x += scrollDelta * scrollRotationSpeed; // Smoother rotation
  previousScroll = currentScroll;
});

// Initial animation to scale the model
function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1, // Slower scaling duration
      ease: "power3.out",
    });
  }
}

// Main animation loop
function animate() {
  if (model) {
    // Floating effect
    const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
    model.position.x = floatOffset;

    // Scroll-based tilt effect
    const scrollProgress = currentScroll / (document.documentElement.scrollHeight - window.innerHeight);
    model.rotation.y = scrollProgress * Math.PI * 2 + baseTilt;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 0;

const outroSec = document.querySelector(".outro");

const splitText = new SplitType(".outro-copy h2", {
  type: "lines",
  lineClass: "line",
});

splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style='display:block; transform: translateY(70px);'>${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top bottom",
  onEnter: () => {
    gsap.to(".outro-copy h2 .line span", {
      transform: "translateY(0)",
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro-copy h2 .line span", {
      transform: "translateY(70px)",
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});