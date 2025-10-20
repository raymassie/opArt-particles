// Utility functions for particle op-art

function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function sphericalToCartesian(radius, theta, phi) {
    return {
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.cos(theta),
        z: radius * Math.sin(theta) * Math.sin(phi)
    };
}

function distance3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}

// Create vertex shader for particles
function getVertexShader() {
    return `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
}

// Create fragment shader for particles
function getFragmentShader() {
    return `
        varying vec3 vColor;
        
        void main() {
            // Create soft circular splat
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            if (dist > 0.5) {
                discard;
            }
            
            // Soft falloff
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha = pow(alpha, 2.0);
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `;
}

