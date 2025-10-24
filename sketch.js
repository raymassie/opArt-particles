// Main WebGL particle sketch

let scene, camera, renderer, particleSystem;
let patterns = {};
let currentPattern = 'spiral';
let time = 0;
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// Post-processing
let composer, bloomPass;
let usePostProcessing = false;

// Stereo rendering
let stereoEffect, anaglyphEffect;
let currentStereoMode = 'none';

// Camera animation
let cameraPath = 0;

// Video recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let recordingStartTime = 0;
let recordingInterval;

// Mobile detection and touch
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let touches = [];
let lastPinchDistance = 0;

const params = {
    particleCount: isMobile ? 3000 : 10000, // Reduce particles on mobile
    speed: 1.0,
    spread: 1.0,
    complexity: 1.0,
    size: isMobile ? 3.0 : 2.0, // Slightly larger on mobile
    shape: 0,
    rotationSpeed: 0.5,
    animate: true,
    autoRotate: true,
    filledShapes: true,
    blackWhite: false,
    // Post-processing
    bloomEnabled: false,
    bloomStrength: 1.5,
    bloomRadius: 0.8,
    // Camera
    cameraPaths: false,
    stereoMode: 'none'
};

function init() {
    // Set up scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Set up camera
    const container = document.getElementById('canvas-container');
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        1,
        10000
    );
    camera.position.z = 500;
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true // For screenshots
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Set up post-processing (optional)
    try {
        setupPostProcessing();
    } catch(e) {
        console.warn('Post-processing not available:', e);
    }
    
    // Set up stereo effects (optional)
    try {
        if (typeof THREE.StereoEffect !== 'undefined') {
            stereoEffect = new THREE.StereoEffect(renderer);
            stereoEffect.setSize(container.clientWidth, container.clientHeight);
        }
        if (typeof THREE.AnaglyphEffect !== 'undefined') {
            anaglyphEffect = new THREE.AnaglyphEffect(renderer);
            anaglyphEffect.setSize(container.clientWidth, container.clientHeight);
        }
    } catch(e) {
        console.warn('Stereo effects not available:', e);
    }
    
    // Initialize patterns
    // 2D Op-Art (Dense)
    patterns.concentricRings = new ConcentricRingsPattern();
    patterns.denseRiley = new DenseRileyPattern();
    patterns.radialBurst = new RadialBurstPattern();
    // 3D Forms
    patterns.particleCube = new ParticleCubePattern();
    patterns.particlePyramid = new ParticlePyramidPattern();
    patterns.particleOctahedron = new ParticleOctahedronPattern();
    patterns.particleIcosahedron = new ParticleIcosahedronPattern();
    // Op-Art (Classic)
    patterns.rileyLines = new RileyLinesPattern();
    patterns.warpedGrid = new WarpedGridPattern();
    patterns.moireGrid = new MoireGridPattern();
    patterns.pulseRings = new PulseRingsPattern();
    // Flow & Motion patterns
    patterns.spiral = new SpiralPattern();
    patterns.wave = new WavePattern();
    patterns.ripple = new RipplePattern();
    patterns.liquid = new LiquidPattern();
    patterns.cymatics = new CymaticsPattern();
    patterns.fabric = new FabricPattern();
    patterns.torus = new TorusPattern();
    patterns.sphere = new SpherePattern();
    patterns.tunnel = new TunnelPattern();
    patterns.moire = new MoirePattern();
    patterns.tornado = new TornadoPattern();
    
    // Create particle system
    createParticleSystem();
    
    // Set up controls
    setupControls();
    
    // Set up mouse interaction
    setupMouseControls();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createParticleSystem() {
    // Remove old system if exists
    if (particleSystem) {
        scene.remove(particleSystem);
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Generate pattern data
    const patternData = patterns[currentPattern].generate(params.particleCount, {
        time: time,
        spread: params.spread,
        complexity: params.complexity,
        size: params.size,
        blackWhite: params.blackWhite
    });
    
    // Generate shape data
    const shapes = new Float32Array(params.particleCount);
    if (params.shape === 9) {
        // Mixed: random shape for each particle
        for (let i = 0; i < params.particleCount; i++) {
            shapes[i] = Math.floor(Math.random() * 9);
        }
    } else {
        // All particles same shape
        for (let i = 0; i < params.particleCount; i++) {
            shapes[i] = params.shape;
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(patternData.positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(patternData.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(patternData.sizes, 1));
    geometry.setAttribute('shapeType', new THREE.BufferAttribute(shapes, 1));
    
    // Create shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            filled: { value: params.filledShapes ? 1.0 : 0.0 }
        },
        vertexShader: getVertexShader(),
        fragmentShader: getFragmentShader(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create particle system
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function updateParticleSystem() {
    const patternData = patterns[currentPattern].generate(params.particleCount, {
        time: time,
        spread: params.spread,
        complexity: params.complexity,
        size: params.size,
        blackWhite: params.blackWhite
    });
    
    particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(patternData.positions, 3));
    particleSystem.geometry.setAttribute('customColor', new THREE.BufferAttribute(patternData.colors, 3));
    particleSystem.geometry.setAttribute('size', new THREE.BufferAttribute(patternData.sizes, 1));
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.customColor.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
    
    // Shape doesn't need updating every frame unless it's mixed
    if (params.shape === 9) {
        const shapes = new Float32Array(params.particleCount);
        for (let i = 0; i < params.particleCount; i++) {
            shapes[i] = Math.floor(Math.random() * 9);
        }
        particleSystem.geometry.setAttribute('shapeType', new THREE.BufferAttribute(shapes, 1));
        particleSystem.geometry.attributes.shapeType.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (params.animate) {
        time += 0.016 * params.speed;
        updateParticleSystem();
    }
    
    // Animated camera paths
    if (params.cameraPaths && !isDragging) {
        cameraPath += 0.005; // Smooth orbital speed
        
        // Orbit around the shape at fixed radius
        const radius = 600;
        camera.position.x = Math.sin(cameraPath) * radius;
        camera.position.y = Math.sin(cameraPath * 0.5) * 200; // Gentle vertical motion
        camera.position.z = Math.cos(cameraPath) * radius;
        
        // Always look at center
        camera.lookAt(0, 0, 0);
    }
    
    // Smooth camera rotation (only when not using camera paths)
    if (params.autoRotate && !params.cameraPaths) {
        targetRotationY += 0.001 * params.rotationSpeed;
    }
    
    // Only rotate the particle system if camera animation is off
    if (!params.cameraPaths) {
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        
        particleSystem.rotation.x = currentRotationX;
        particleSystem.rotation.y = currentRotationY;
    } else {
        // Keep shape stationary when camera is moving
        particleSystem.rotation.x = 0;
        particleSystem.rotation.y = 0;
    }
    
    // Render with appropriate method
    if (params.stereoMode !== 'none' && stereoEffect) {
        renderStereo();
    } else if (usePostProcessing && composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

function setupPostProcessing() {
    if (typeof THREE.EffectComposer === 'undefined') {
        console.warn('EffectComposer not available');
        return;
    }
    
    try {
        // Create composer
        composer = new THREE.EffectComposer(renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);
        
        // Bloom pass
        if (typeof THREE.UnrealBloomPass !== 'undefined') {
            bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,  // strength
                0.8,  // radius
                0.1   // threshold (lower = more glow)
            );
            bloomPass.enabled = false; // Start disabled
            composer.addPass(bloomPass);
        }
    } catch(e) {
        console.error('Error setting up post-processing:', e);
        composer = null;
    }
}

function renderStereo() {
    if (params.stereoMode === 'anaglyph' && anaglyphEffect) {
        anaglyphEffect.render(scene, camera);
    } else if (params.stereoMode === 'sideBySide' && stereoEffect) {
        stereoEffect.render(scene, camera);
    } else {
        // Fallback to normal render
        renderer.render(scene, camera);
    }
}

function setupMouseControls() {
    const container = document.getElementById('canvas-container');
    
    // Mouse controls
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });
    
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;
            
            targetRotationY += deltaX * 0.005;
            targetRotationX += deltaY * 0.005;
            
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        }
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.5;
        camera.position.z = clamp(camera.position.z, 100, 2000);
    });
    
    // Touch controls
    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touches = Array.from(e.touches);
        
        if (touches.length === 1) {
            isDragging = true;
            previousMouseX = touches[0].clientX;
            previousMouseY = touches[0].clientY;
        } else if (touches.length === 2) {
            isDragging = false;
            const dx = touches[1].clientX - touches[0].clientX;
            const dy = touches[1].clientY - touches[0].clientY;
            lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }, { passive: false });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        touches = Array.from(e.touches);
        
        if (touches.length === 1 && isDragging) {
            // Single touch - rotate
            const deltaX = touches[0].clientX - previousMouseX;
            const deltaY = touches[0].clientY - previousMouseY;
            
            targetRotationY += deltaX * 0.005;
            targetRotationX += deltaY * 0.005;
            
            previousMouseX = touches[0].clientX;
            previousMouseY = touches[0].clientY;
        } else if (touches.length === 2) {
            // Two fingers - pinch to zoom
            const dx = touches[1].clientX - touches[0].clientX;
            const dy = touches[1].clientY - touches[0].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastPinchDistance > 0) {
                const delta = distance - lastPinchDistance;
                camera.position.z -= delta * 2;
                camera.position.z = clamp(camera.position.z, 100, 2000);
            }
            
            lastPinchDistance = distance;
        }
    }, { passive: false });
    
    container.addEventListener('touchend', (e) => {
        e.preventDefault();
        touches = Array.from(e.touches);
        
        if (touches.length === 0) {
            isDragging = false;
            lastPinchDistance = 0;
        } else if (touches.length === 1) {
            isDragging = true;
            previousMouseX = touches[0].clientX;
            previousMouseY = touches[0].clientY;
            lastPinchDistance = 0;
        }
    }, { passive: false });
}

function setupControls() {
    // Pattern selector
    const patternSelect = document.getElementById('patternSelect');
    patternSelect.addEventListener('change', (e) => {
        currentPattern = e.target.value;
        createParticleSystem();
    });
    
    // Particle count
    const particleCountSlider = document.getElementById('particleCount');
    const particleCountValue = document.getElementById('particleCountValue');
    particleCountSlider.addEventListener('input', (e) => {
        params.particleCount = parseInt(e.target.value);
        particleCountValue.textContent = params.particleCount;
        createParticleSystem();
    });
    
    // Speed
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', (e) => {
        params.speed = parseFloat(e.target.value);
        speedValue.textContent = params.speed.toFixed(1);
    });
    
    // Spread
    const spreadSlider = document.getElementById('spread');
    const spreadValue = document.getElementById('spreadValue');
    spreadSlider.addEventListener('input', (e) => {
        params.spread = parseFloat(e.target.value);
        spreadValue.textContent = params.spread.toFixed(1);
    });
    
    // Complexity
    const complexitySlider = document.getElementById('complexity');
    const complexityValue = document.getElementById('complexityValue');
    complexitySlider.addEventListener('input', (e) => {
        params.complexity = parseFloat(e.target.value);
        complexityValue.textContent = params.complexity.toFixed(1);
    });
    
    // Particle size
    const sizeSlider = document.getElementById('particleSize');
    const sizeValue = document.getElementById('sizeValue');
    sizeSlider.addEventListener('input', (e) => {
        params.size = parseFloat(e.target.value);
        sizeValue.textContent = params.size.toFixed(1);
    });
    
    // Shape selector
    const shapeSelect = document.getElementById('shapeSelect');
    shapeSelect.addEventListener('change', (e) => {
        params.shape = parseInt(e.target.value);
        
        // Update all particle shapes
        const shapes = new Float32Array(params.particleCount);
        if (params.shape === 9) {
            // Mixed
            for (let i = 0; i < params.particleCount; i++) {
                shapes[i] = Math.floor(Math.random() * 9);
            }
        } else {
            for (let i = 0; i < params.particleCount; i++) {
                shapes[i] = params.shape;
            }
        }
        particleSystem.geometry.setAttribute('shapeType', new THREE.BufferAttribute(shapes, 1));
        particleSystem.geometry.attributes.shapeType.needsUpdate = true;
    });
    
    // Rotation speed
    const rotationSlider = document.getElementById('rotationSpeed');
    const rotationValue = document.getElementById('rotationValue');
    rotationSlider.addEventListener('input', (e) => {
        params.rotationSpeed = parseFloat(e.target.value);
        rotationValue.textContent = params.rotationSpeed.toFixed(1);
    });
    
    // Animate checkbox
    const animateCheckbox = document.getElementById('animate');
    animateCheckbox.addEventListener('change', (e) => {
        params.animate = e.target.checked;
    });
    
    // Auto-rotate checkbox
    const autoRotateCheckbox = document.getElementById('autoRotate');
    autoRotateCheckbox.addEventListener('change', (e) => {
        params.autoRotate = e.target.checked;
    });
    
    // Filled shapes checkbox
    const filledShapesCheckbox = document.getElementById('filledShapes');
    filledShapesCheckbox.addEventListener('change', (e) => {
        params.filledShapes = e.target.checked;
        particleSystem.material.uniforms.filled.value = params.filledShapes ? 1.0 : 0.0;
    });
    
    // Black & white checkbox
    const blackWhiteCheckbox = document.getElementById('blackWhite');
    blackWhiteCheckbox.addEventListener('change', (e) => {
        params.blackWhite = e.target.checked;
    });
    
    // Bloom enabled
    const bloomEnabledCheckbox = document.getElementById('bloomEnabled');
    bloomEnabledCheckbox.addEventListener('change', (e) => {
        params.bloomEnabled = e.target.checked;
        updatePostProcessing();
    });
    
    // Bloom strength
    const bloomStrengthSlider = document.getElementById('bloomStrength');
    const bloomStrengthValue = document.getElementById('bloomStrengthValue');
    bloomStrengthSlider.addEventListener('input', (e) => {
        params.bloomStrength = parseFloat(e.target.value);
        bloomStrengthValue.textContent = params.bloomStrength.toFixed(1);
        if (bloomPass) {
            bloomPass.strength = params.bloomStrength;
        }
    });
    
    // Bloom radius
    const bloomRadiusSlider = document.getElementById('bloomRadius');
    const bloomRadiusValue = document.getElementById('bloomRadiusValue');
    bloomRadiusSlider.addEventListener('input', (e) => {
        params.bloomRadius = parseFloat(e.target.value);
        bloomRadiusValue.textContent = params.bloomRadius.toFixed(2);
        if (bloomPass) {
            bloomPass.radius = params.bloomRadius;
        }
    });
    
    // Camera paths
    const cameraPathsCheckbox = document.getElementById('cameraPaths');
    cameraPathsCheckbox.addEventListener('change', (e) => {
        params.cameraPaths = e.target.checked;
        if (e.target.checked) {
            // Reset rotation values when enabling camera paths
            targetRotationX = 0;
            targetRotationY = 0;
            currentRotationX = 0;
            currentRotationY = 0;
            particleSystem.rotation.x = 0;
            particleSystem.rotation.y = 0;
            cameraPath = 0; // Start from beginning
        } else {
            // Reset camera position
            camera.position.set(0, 0, 500);
            camera.lookAt(0, 0, 0);
        }
    });
    
    // Stereo mode
    const stereoModeSelect = document.getElementById('stereoMode');
    stereoModeSelect.addEventListener('change', (e) => {
        params.stereoMode = e.target.value;
        currentStereoMode = e.target.value;
    });
    
    // Randomize button
    const randomizeBtn = document.getElementById('randomize');
    randomizeBtn.addEventListener('click', () => {
        const patternNames = Object.keys(patterns);
        currentPattern = patternNames[Math.floor(Math.random() * patternNames.length)];
        patternSelect.value = currentPattern;
        
        params.particleCount = Math.floor(randomRange(5000, 30000) / 1000) * 1000;
        particleCountSlider.value = params.particleCount;
        particleCountValue.textContent = params.particleCount;
        
        params.speed = randomRange(0.2, 3);
        speedSlider.value = params.speed;
        speedValue.textContent = params.speed.toFixed(1);
        
        params.spread = randomRange(0.5, 2);
        spreadSlider.value = params.spread;
        spreadValue.textContent = params.spread.toFixed(1);
        
        params.complexity = randomRange(0.5, 3);
        complexitySlider.value = params.complexity;
        complexityValue.textContent = params.complexity.toFixed(1);
        
        params.size = randomRange(1, 6);
        sizeSlider.value = params.size;
        sizeValue.textContent = params.size.toFixed(1);
        
        params.rotationSpeed = randomRange(0, 1.5);
        rotationSlider.value = params.rotationSpeed;
        rotationValue.textContent = params.rotationSpeed.toFixed(1);
        
        params.filledShapes = Math.random() > 0.3;
        filledShapesCheckbox.checked = params.filledShapes;
        particleSystem.material.uniforms.filled.value = params.filledShapes ? 1.0 : 0.0;
        
        params.blackWhite = Math.random() > 0.7;
        blackWhiteCheckbox.checked = params.blackWhite;
        
        params.shape = Math.floor(Math.random() * 10);
        shapeSelect.value = params.shape;
        
        createParticleSystem();
    });
    
    // Screenshot button
    const screenshotBtn = document.getElementById('screenshot');
    screenshotBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `particle-opArt_${currentPattern}_${Date.now()}.png`;
        link.href = renderer.domElement.toDataURL();
        link.click();
    });
    
    // Video recording button
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            params.animate = !params.animate;
            animateCheckbox.checked = params.animate;
        }
    });
    
    // Menu toggle for mobile/tablet
    const menuToggle = document.getElementById('menuToggle');
    const controls = document.getElementById('controls');
    
    // Initialize controls state based on viewport
    if (window.innerWidth > 768) {
        controls.classList.remove('controls-closed', 'controls-open');
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            controls.classList.toggle('controls-open');
            controls.classList.toggle('controls-closed');
        });
        
        // Close menu when clicking on canvas on mobile/tablet
        document.getElementById('canvas-container').addEventListener('click', () => {
            if (window.innerWidth <= 768 && controls.classList.contains('controls-open')) {
                menuToggle.classList.remove('active');
                controls.classList.remove('controls-open');
                controls.classList.add('controls-closed');
            }
        });
    }
    
    // Update particle count slider max on mobile
    if (isMobile) {
        const particleCountSlider = document.getElementById('particleCount');
        particleCountSlider.max = 10000; // Lower max on mobile
        particleCountSlider.value = params.particleCount;
        particleCountValue.textContent = params.particleCount;
    }
}

function updatePostProcessing() {
    usePostProcessing = params.bloomEnabled;
    
    if (bloomPass) {
        bloomPass.enabled = params.bloomEnabled;
    }
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Update post-processing size
    if (composer) {
        composer.setSize(container.clientWidth, container.clientHeight);
    }
    
    // Update stereo effect size
    if (stereoEffect) {
        stereoEffect.setSize(container.clientWidth, container.clientHeight);
    }
    if (anaglyphEffect) {
        anaglyphEffect.setSize(container.clientWidth, container.clientHeight);
    }
    
    // Handle controls visibility on resize
    const controls = document.getElementById('controls');
    const menuToggle = document.getElementById('menuToggle');
    
    if (window.innerWidth > 768) {
        // Desktop - show controls, remove mobile classes
        controls.classList.remove('controls-closed', 'controls-open');
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    } else {
        // Mobile/Tablet - ensure controls are closed unless explicitly opened
        if (!controls.classList.contains('controls-open')) {
            controls.classList.add('controls-closed');
        }
    }
}

// Video recording functions
function startRecording() {
    const canvas = renderer.domElement;
    const stream = canvas.captureStream(60); // 60 FPS
    
    recordedChunks = [];
    
    const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
    };
    
    // Fallback for browsers that don't support vp9
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }
    }
    
    try {
        mediaRecorder = new MediaRecorder(stream, options);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `particle-opArt_${currentPattern}_${Date.now()}.webm`;
            link.click();
            URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        // Update UI
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.textContent = '■ Stop Recording';
        recordBtn.classList.add('recording');
        
        const recordingStatus = document.getElementById('recordingStatus');
        recordingStatus.classList.remove('hidden');
        
        // Update timer
        recordingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('recordingTime').textContent = `${minutes}:${seconds}`;
        }, 100);
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not start recording. Please check browser compatibility.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.textContent = '● Record Video';
        recordBtn.classList.remove('recording');
        
        const recordingStatus = document.getElementById('recordingStatus');
        recordingStatus.classList.add('hidden');
        
        // Clear timer interval
        if (recordingInterval) {
            clearInterval(recordingInterval);
            recordingInterval = null;
        }
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);

