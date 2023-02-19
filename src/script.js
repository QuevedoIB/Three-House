import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

const brickOcclusion = textureLoader.load(
  "/textures/bricks/ambientOcclusion.jpg"
);
const brickColor = textureLoader.load("/textures/bricks/color.jpg");
const brickNormal = textureLoader.load("/textures/bricks/normal.jpg");
const brickRoughness = textureLoader.load("/textures/bricks/roughness.jpg");

const grassOcclusion = textureLoader.load(
  "/textures/grass/ambientOcclusion.jpg"
);
const grassColor = textureLoader.load("/textures/grass/color.jpg");
const grassNormal = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughness = textureLoader.load("/textures/grass/roughness.jpg");

const doorOcclusion = textureLoader.load("/textures/door/ambientOcclusion.jpg");
const doorColor = textureLoader.load("/textures/door/color.jpg");
const doorNormal = textureLoader.load("/textures/door/normal.jpg");
const doorRoughness = textureLoader.load("/textures/door/roughness.jpg");
const doorAlpha = textureLoader.load("/textures/door/alpha.jpg");
const doorHeight = textureLoader.load("/textures/door/height.jpg");
const doorMetalness = textureLoader.load("/textures/door/metalness.jpg");

const house = new THREE.Group();

/**
 * walls
 */

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(6, 3, 6),
  new THREE.MeshStandardMaterial()
);

walls.material.aoMap = brickOcclusion;
walls.material.roughnessMap = brickRoughness;
walls.material.colorMap = brickColor;
walls.material.normalMap = brickNormal;

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: "#a9c388" })
);
floor.material.aoMap = grassOcclusion;
floor.material.normalMap = grassNormal;
floor.material.colorMap = grassColor;
floor.material.roughnessMap = grassRoughness;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

walls.position.y = floor.position.y + walls.geometry.parameters.height * 0.5;

const helper = new THREE.AxesHelper(10);
scene.add(helper);

/** DOOR */
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 2.2),
  new THREE.MeshStandardMaterial()
);

door.position.set(
  walls.position.x,
  floor.position.y + door.geometry.parameters.height * 0.5,
  walls.position.z + walls.geometry.parameters.width * 0.5 + 0.01
);
door.material.colorMap = doorColor;
door.material.roughnessMap = doorRoughness;
door.material.metalnessMap = doorMetalness;
door.material.aoMap = doorOcclusion;
door.material.normalMap = doorNormal;
door.material.alphaMap = doorAlpha;
door.material.transparent = true;
door.material.heightMap = doorHeight;

/** ROOF */

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(walls.geometry.parameters.width - 1, 1, 4, 1),
  new THREE.MeshBasicMaterial({ color: 0xfa4b7f })
);

roof.rotation.y = Math.PI * 0.25;

roof.position.y =
  walls.position.y +
  walls.geometry.parameters.height * 0.5 +
  roof.geometry.parameters.height * 0.5 +
  0.01;

house.add(roof);
house.add(walls);
house.add(door);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
camera.lookAt(door);
scene.add(house);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
