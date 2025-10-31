// === Setup scene ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Lighting ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x555555));

// === Make a voxel terrain ===
const geometry = new THREE.BoxGeometry(1, 1, 1);
const grass = new THREE.MeshStandardMaterial({ color: 0x22aa22 });
const dirt = new THREE.MeshStandardMaterial({ color: 0x885533 });

for (let x = -10; x < 10; x++) {
  for (let z = -10; z < 10; z++) {
    const height = Math.floor(Math.random() * 3) + 1; // random terrain
    for (let y = 0; y < height; y++) {
      const cube = new THREE.Mesh(geometry, y === height - 1 ? grass : dirt);
      cube.position.set(x, y, z);
      scene.add(cube);
    }
  }
}

camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// === Camera control ===
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function updateCamera() {
  const speed = 0.1;
  if (keys["w"]) camera.position.z -= speed;
  if (keys["s"]) camera.position.z += speed;
  if (keys["a"]) camera.position.x -= speed;
  if (keys["d"]) camera.position.x += speed;
  if (keys[" "]) camera.position.y += speed;
  if (keys["shift"]) camera.position.y -= speed;
}

// === Render loop ===
function animate() {
  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}
animate();

// === Handle resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
