// ======== Scene Setup ========
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff,0.8);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// ======== Controls ========
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
document.body.addEventListener('click', ()=> controls.lock());
let move = {w:false,a:false,s:false,d:false,space:false,shift:false};
document.addEventListener('keydown', e=>{ if(move[e.key.toLowerCase()]!==undefined) move[e.key.toLowerCase()]=true; });
document.addEventListener('keyup', e=>{ if(move[e.key.toLowerCase()]!==undefined) move[e.key.toLowerCase()]=false; });

// ======== Blocks ========
const BLOCKS = {grass:0x22aa22,dirt:0x885533,stone:0x888888,wood:0x8b4513};
const world = [];
function createBlock(x,y,z,type){
  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({color:BLOCKS[type]});
  const cube = new THREE.Mesh(geo,mat);
  cube.position.set(x,y,z);
  cube.userData.type=type;
  scene.add(cube);
  world.push(cube);
  return cube;
}

// Flat terrain
for(let x=-10;x<10;x++){
  for(let z=-10;z<10;z++){
    let h=Math.floor(Math.random()*3)+1;
    for(let y=0;y<h;y++){
      createBlock(x,y,z, y===h-1 ? "grass":"dirt");
    }
  }
}

// ======== Player ========
const player = {height:1.8, velocity:new THREE.Vector3(), health:20};
camera.position.set(0,player.height,5);

// ======== Movement & Collision ========
function checkCollision(pos){
  for(const b of world){
    const dx=Math.abs(pos.x-b.position.x);
    const dy=Math.abs(pos.y-(b.position.y+0.5));
    const dz=Math.abs(pos.z-b.position.z);
    if(dx<0.5 && dy<player.height && dz<0.5) return true;
  }
  return false;
}
function updatePlayer(){
  const speed=0.1;
  const dir=new THREE.Vector3();
  if(move.w) dir.z-=speed;
  if(move.s) dir.z+=speed;
  if(move.a) dir.x-=speed;
  if(move.d) dir.x+=speed;
  if(move.space) dir.y+=speed;
  if(move.shift) dir.y-=speed;
  const newPos = camera.position.clone().add(dir);
  if(!checkCollision(newPos)) camera.position.copy(newPos);
}

// ======== Raycasting (Block Interaction) ========
const ray = new THREE.Raycaster();
function breakBlock(){
  ray.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
  const hits = ray.intersectObjects(world);
  if(hits.length>0){
    const b = hits[0].object;
    addToInventory(b.userData.type);
    scene.remove(b);
    world.splice(world.indexOf(b),1);
  }
}
function placeBlock(type){
  ray.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
  const hits = ray.intersectObjects(world);
  if(hits.length>0){
    const pos = hits[0].point.clone().floor().addScalar(0.5);
    createBlock(pos.x,pos.y,pos.z,type);
  }
}
document.addEventListener('mousedown', e=>{
  if(e.button===0) breakBlock();
  if(e.button===2) placeBlock(selectedBlock);
});

// ======== Inventory & Hotbar ========
let inventory={grass:0,dirt:0,stone:0,wood:0,planks:0,sticks:0};
let hotbarOrder=["grass","dirt","stone","wood"];
let selectedBlock="dirt";
const hotbarDiv = document.getElementById("hotbar");
function updateHotbar(){
  hotbarDiv.innerHTML="";
  hotbarOrder.forEach(b=>{
    const slot=document.createElement("div");
    slot.classList.add("hotbar-slot");
    if(b===selectedBlock) slot.classList.add("hotbar-selected");
    slot.innerText=b+" ("+(inventory[b]||0)+")";
    hotbarDiv.appendChild(slot);
  });
}
function addToInventory(type){ inventory[type]=(inventory[type]||0)+1; updateHotbar(); }
document.addEventListener('keydown', e=>{
  if("1234".includes(e.key)) selectedBlock=hotbarOrder[parseInt(e.key)-1]; updateHotbar();
});
updateHotbar();

// ======== Crafting ========
const recipes={
  planks:{wood:1},
  sticks:{planks:2},
};
function craft(item){
  const recipe = recipes[item];
  if(Object.keys(recipe).every(i=>inventory[i]>=recipe[i])){
    Object.keys(recipe).forEach(i=>inventory[i]-=recipe[i]);
    inventory[item]=(inventory[item]||0)+1;
    updateHotbar();
  }
}

// ======== Game Loop ========
function animate(){
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene,camera);
}
animate();

// ======== Resize ========
window.addEventListener("resize", ()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
