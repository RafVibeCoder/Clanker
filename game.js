// game.js

// ====== BASIC THREE.JS SETUP ======
let scene, camera, renderer, clock;
let freddyModel, freddyMixer, freddyActions = {};
let animatronics = [];

const canvas = document.getElementById('gameCanvas');

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.7, 5); // player height

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    clock = new THREE.Clock();

    // Lights
    setupLights();

    // Load environment + animatronics
    loadEnvironment();
    loadFreddy();

    // Input
    setupInput();

    // Start loop
    animate();
}

function setupLights() {
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
}

// ====== ENVIRONMENT LOADING ======
const loader = new THREE.GLTFLoader();

function loadEnvironment() {
    loader.load('assets/models/rooms/security_office.glb', (gltf) => {
        const office = gltf.scene;
        office.traverse(obj => {
            obj.castShadow = true;
            obj.receiveShadow = true;
        });
        scene.add(office);
    });
}

// ====== FREDDY LOADING ======
function loadFreddy() {
    loader.load('assets/models/animatronics/freddy.glb', (gltf) => {
        freddyModel = gltf.scene;
        freddyModel.traverse(obj => {
            obj.castShadow = true;
            obj.receiveShadow = true;
        });

        freddyModel.position.set(0, 0, -10);
        scene.add(freddyModel);

        freddyMixer = new THREE.AnimationMixer(freddyModel);

        gltf.animations.forEach(clip => {
            freddyActions[clip.name] = freddyMixer.clipAction(clip);
        });

        playFreddyAction('Idle_Breathe');

        animatronics.push({
            name: 'Freddy',
            model: freddyModel,
            mixer: freddyMixer,
            actions: freddyActions
        });
    });
}

function playFreddyAction(name) {
    if (!freddyActions[name]) return;
    Object.values(freddyActions).forEach(a => a.stop());
    freddyActions[name].play();
}

// ====== INPUT / PLAYER CONTROL (BASIC) ======
let keys = {};

function setupInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

function updatePlayer(delta) {
    const speed = 3;

    if (keys['KeyW']) camera.position.z -= speed * delta;
    if (keys['KeyS']) camera.position.z += speed * delta;
    if (keys['KeyA']) camera.position.x -= speed * delta;
    if (keys['KeyD']) camera.position.x += speed * delta;
}

// ====== ANIMATRONIC AI HOOK (FREDDY) ======
function updateAnimatronics(delta) {
    // Freddy AI logic will live in freddyAI.js
    // Here we just update mixers
    if (freddyMixer) freddyMixer.update(delta);

    // Example: call external AI
    if (typeof updateFreddyAI === 'function') {
        updateFreddyAI({
            model: freddyModel,
            actions: freddyActions,
            playAction: playFreddyAction,
            camera
        }, delta);
    }
}

// ====== MAIN LOOP ======
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updatePlayer(delta);
    updateAnimatronics(delta);

    renderer.render(scene, camera);
}

// ====== RESIZE ======
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ====== START ======
init();
