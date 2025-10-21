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

// Touch controls
let isTouching = false;
let previousTouchX = 0;
let previousTouchY = 0;
let lastTouchDistance = 0;
let initialCameraZ = 500;

// Video recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let recordingStartTime = 0;
let recordingInterval;

// Performance monitoring for mobile
let frameCount = 0;
let lastTime = 0;
let fps = 60;
let performanceMode = isMobile;

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

const params = {
    particleCount: isMobile ? 5000 : 10000, // Reduce particles on mobile
    speed: 1.0,
    spread: 1.0,
    complexity: 1.0,
    size: 2.0,
    shape: 0,
    rotationSpeed: 0.5,
    animate: true,
    autoRotate: true,
    filledShapes: true,
    blackWhite: false
};

function init() {
    // Set up scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Set up camera
    const container = document.getElementById('canvas-container');
    camera = new THREE.PerspectiveCamera(
        isMobile ? 60 : 75, // Wider FOV on mobile for better viewing
        container.clientWidth / container.clientHeight,
        1,
        10000
    );
    camera.position.z = isMobile ? 400 : 500; // Closer on mobile
    initialCameraZ = camera.position.z;
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: !isMobile, // Disable antialiasing on mobile for performance
        preserveDrawingBuffer: true, // For screenshots
        powerPreference: isMobile ? "low-power" : "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Initialize patterns
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
    
    // Performance monitoring
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Update performance display
        if (isMobile) {
            document.getElementById('fpsDisplay').textContent = fps;
            document.getElementById('particleDisplay').textContent = params.particleCount;
        }
        
        // Auto-adjust quality on mobile if performance is poor
        if (isMobile && fps < 30 && params.particleCount > 2000) {
            params.particleCount = Math.max(2000, params.particleCount - 1000);
            document.getElementById('particleCount').value = params.particleCount;
            document.getElementById('particleCountValue').textContent = params.particleCount;
            createParticleSystem();
        }
    }
    
    if (params.animate) {
        time += 0.016 * params.speed;
        updateParticleSystem();
    }
    
    // Smooth camera rotation
    if (params.autoRotate) {
        targetRotationY += 0.001 * params.rotationSpeed;
    }
    
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    
    particleSystem.rotation.x = currentRotationX;
    particleSystem.rotation.y = currentRotationY;
    
    renderer.render(scene, camera);
}

function setupMouseControls() {
    const container = document.getElementById('canvas-container');
    
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
    
    // Touch controls for mobile
    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            // Single touch - rotation
            isTouching = true;
            previousTouchX = e.touches[0].clientX;
            previousTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Two finger pinch - zoom
            isTouching = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isTouching) {
            // Single touch - rotation
            const deltaX = e.touches[0].clientX - previousTouchX;
            const deltaY = e.touches[0].clientY - previousTouchY;
            
            targetRotationY += deltaX * 0.005;
            targetRotationX += deltaY * 0.005;
            
            previousTouchX = e.touches[0].clientX;
            previousTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && isTouching) {
            // Two finger pinch - zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            if (lastTouchDistance > 0) {
                const scale = currentDistance / lastTouchDistance;
                camera.position.z /= scale;
                camera.position.z = clamp(camera.position.z, 100, 2000);
            }
            
            lastTouchDistance = currentDistance;
        }
    });
    
    container.addEventListener('touchend', (e) => {
        e.preventDefault();
        isTouching = false;
        lastTouchDistance = 0;
    });
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
    
    // Mobile controls toggle
    if (isMobile) {
        const mobileToggle = document.getElementById('mobileControlsToggle');
        const controls = document.getElementById('controls');
        
        mobileToggle.addEventListener('click', () => {
            controls.classList.toggle('visible');
        });
        
        // Close controls when clicking outside
        document.addEventListener('click', (e) => {
            if (!controls.contains(e.target) && !mobileToggle.contains(e.target)) {
                controls.classList.remove('visible');
            }
        });
        
        // Show performance indicator on mobile
        const performanceIndicator = document.getElementById('mobilePerformance');
        performanceIndicator.classList.remove('hidden');
    }
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
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

