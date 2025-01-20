// imports
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Import OrbitControls
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';


// setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
//scene.fog = new THREE.Fog('#202030', 5, 15);

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(0, 0, 5);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 50;
controls.update();

// Add ambient light
//const light = new THREE.AmbientLight(0x2012050); // Brighter ambient light
//scene.add(light);

// Sphere Geometry 1
const sphereGeometry = new THREE.SphereGeometry(1 * 0.5, 32 * 0.5, 16 * 0.5);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFA500, // Base color 
  emissive: 0xFF8C00, // Glow color
  emissiveIntensity: 0.2, // Initial intensity of the glow
  metalness: 0.5,
  roughness: 0.3,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 2, 1);
scene.add(sphere);

// Sphere Geometry 2
const sphereGeometry2 = new THREE.SphereGeometry(1 * 0.5, 32 * 0.5, 16 * 0.5); // Same size or different
const sphereMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xFFA500, // Base color of the sphere 
  emissive: 0xFF8C00, // Glow color
  emissiveIntensity: 0.2, // Initial glow intensity
  metalness: 0.5,
  roughness: 0.3,
});
const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphere2.position.set(5, 2, -2); // Position it slightly to the right of the first sphere
scene.add(sphere2);

// Event listeners for mouse events
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster with mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find intersections with the spheres
  const intersects1 = raycaster.intersectObject(sphere);
  const intersects2 = raycaster.intersectObject(sphere2);

  // Hover effect for the first sphere
  if (intersects1.length > 0) {
    sphere.material.emissiveIntensity = 1.0;
    document.body.style.cursor = 'pointer'; // Change cursor to indicate interactivity
  } else {
    sphere.material.emissiveIntensity = 0.2;
  }

  // Hover effect for the second sphere
  if (intersects2.length > 0) {
    sphere2.material.emissiveIntensity = 1.0;
    document.body.style.cursor = 'pointer'; // Change cursor to indicate interactivity
  } else {
    sphere2.material.emissiveIntensity = 0.2;
  }
}

function onMouseClick(event) {
  const intersects1 = raycaster.intersectObject(sphere);
  const intersects2 = raycaster.intersectObject(sphere2);

  // Handle click for the first sphere
  if (intersects1.length > 0) {
    alert('Sphere 1 click!'); // Replace with any function to show letter, modal, or text
  }

  // Handle click for the second sphere
  if (intersects2.length > 0) {
    alert('Sphere 2 click!'); // Replace with any function to show letter, modal, or text
  }
}

// Add event listeners
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);



// Lighting for Bloom
const pointLight = new THREE.PointLight(0xffffff, 2, 50);
pointLight.position.set(5, 5, 10);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Post-Processing (Bloom Effect)
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.0, // Bloom strength
  0.4, // Bloom radius
  0.1 // Bloom threshold
);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);

// Load Model
const loader = new GLTFLoader();
let loadedModel;

loader.load(
  'assets/realelementsthreejs/realthreejselements.gltf',
  function (gltf) {
    let scl = 0.3;
    loadedModel = gltf.scene;
    loadedModel.scale.set(1 * scl, 1 * scl, 1 * scl);
    loadedModel.position.set(1, 1, 0);
    scene.add(loadedModel);
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);

// Add images (no changes made here)
const addImage = (path, geometry, position, rotation) => {
  const loader = new THREE.TextureLoader();
  loader.load(
    path,
    (texture) => {
      const material = new THREE.MeshLambertMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      scene.add(mesh);
    },
    undefined,
    (error) => console.error(`Error loading ${path}:`, error)
  );
};

// Image Elements
addImage(
  'assets/realelementsthreejs/phoebe.jpg',
  new THREE.BoxGeometry(1.875*2.4, 1.25*2.4, 0.07*2.4),
  [7, 3, 0.2*2.4],
  [0, 7.99, 0]
);

addImage(
  'assets/realelementsthreejs/taksimsq.png',
  new THREE.BoxGeometry(1.7*2.4, 1.0*2.4, 0.056*2.4),
  [-3, 3, 0],
  [0, 7.7999, 0]
);

addImage(
  'assets/realelementsthreejs/mischa.png',
  new THREE.BoxGeometry(1.5*2.4, 0.96*2.4, 0.056*2.4),
  [1, 2.6, 4.7],
  [0, 0, 0]
);

addImage(
  'assets/realelementsthreejs/kylanetics.png',
  new THREE.BoxGeometry(0.96*2.4, 1.2*2.4, 0.056*2.4),
  [1.9, 3.3, -5],
  [0, 0, 0]
);

addImage(
  'assets/realelementsthreejs/kylanetics2.png',
  new THREE.BoxGeometry(0.96*2.4, 1.4*2.4, 0.056*2.4),
  [0.2, 3.5, -5.2],
  [0, 0, 0]
);

// Load HDR Environment Map
new RGBELoader().load('assets/kloppenheim_02_puresky_4k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// Rendering loop
function draw() {
  controls.update();
  composer.render(); // Use composer to include post-processing
}

renderer.setAnimationLoop(draw);

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
