import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import Stats from "stats.js";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

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
  new THREE.PlaneGeometry(1.4, 2.2),
  new THREE.MeshStandardMaterial({
    map: doorColor,
    alphaMap: doorAlpha,
    normalMap: doorNormal,
    roughnessMap: doorRoughness,
    aoMap: doorOcclusion,
    heightMap: doorHeight,
    metalnessMap: doorMetalness,
    transparent: true,
  })
);

door.position.set(
  walls.position.x,
  floor.position.y + door.geometry.parameters.height * 0.5,
  walls.position.z + walls.geometry.parameters.width * 0.5 + 0.01
);

door.translateY(-0.1);

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
 * BUSHES
 */

const houseCorners = new THREE.Box3();
houseCorners.setFromObject(walls);

const low = houseCorners.min;
const high = houseCorners.max;

const cornerBottomLeft = new THREE.Vector3(low.x, low.y, low.z);
const cornerBottomRight = new THREE.Vector3(high.x, low.y, low.z);
const cornerUpperRight = new THREE.Vector3(high.x, low.y, high.z);
const cornerUpperLeft = new THREE.Vector3(low.x, low.y, high.z);

const bushMaterial = new THREE.MeshStandardMaterial({ color: "green" });
bushMaterial.aoMap = grassOcclusion;
bushMaterial.normalMap = grassNormal;
bushMaterial.colorMap = grassColor;
bushMaterial.roughnessMap = grassRoughness;

const bushSize = 0.5;
const bushGeometry = new THREE.SphereGeometry(bushSize, 8, 8);

const minDoorOffset = door.position.x - door.geometry.parameters.width;
const maxDoorOffset = door.position.x + door.geometry.parameters.width * 0.5;

for (let i = minDoorOffset; i > cornerUpperLeft.x; i -= bushSize * 2) {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.x = i;
  bush.position.y = cornerUpperLeft.y;
  bush.position.z = cornerUpperLeft.z;
  house.add(bush);
}

for (let i = cornerUpperLeft.z; i > cornerBottomLeft.z; i -= bushSize * 2) {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.x = cornerBottomLeft.x;
  bush.position.y = cornerBottomLeft.y;
  bush.position.z = i;
  house.add(bush);
}

for (let i = cornerBottomLeft.x; i < cornerBottomRight.x; i += bushSize * 2) {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.x = i;
  bush.position.y = cornerBottomRight.y;
  bush.position.z = cornerBottomRight.z;
  house.add(bush);
}

for (let i = cornerBottomRight.z; i < cornerUpperRight.z; i += bushSize * 2) {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.x = cornerUpperRight.x;
  bush.position.y = cornerUpperRight.y;
  bush.position.z = i;
  house.add(bush);
}

for (let i = cornerUpperRight.x; i > maxDoorOffset; i -= bushSize * 2) {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.x = i;
  bush.position.y = cornerUpperRight.y;
  bush.position.z = cornerUpperRight.z;
  house.add(bush);
}

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
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.end();
};

tick();
