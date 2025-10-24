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
        attribute float shapeType;
        uniform float filled;
        varying vec3 vColor;
        varying float vShapeType;
        varying float vFilled;
        
        void main() {
            vColor = customColor;
            vShapeType = shapeType;
            vFilled = filled;
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
        varying float vShapeType;
        varying float vFilled;
        
        // Iridescent color shift based on angle and distance
        vec3 getIridescence(vec2 p, float dist) {
            float angle = atan(p.y, p.x);
            float hue = angle * 0.1 + dist * 2.0;
            
            // Chromatic aberration at edges
            vec3 chroma = vec3(
                sin(hue) * 0.3,
                sin(hue + 2.094) * 0.3,
                sin(hue + 4.189) * 0.3
            );
            
            return chroma;
        }
        
        // Soft glow falloff
        float softGlow(float dist, float radius) {
            return exp(-dist * dist / (radius * radius));
        }
        
        // Helper function to create outline from filled shape
        float toOutline(float fillAlpha, vec2 p) {
            if (fillAlpha < 0.01) return 0.0;
            
            // Create outline by keeping only the edge region
            float innerEdge = 0.4;
            float outerEdge = 0.05;
            
            // Only show the outline band between innerEdge and outerEdge
            if (fillAlpha > innerEdge) {
                // Inside - fade toward center
                return smoothstep(1.0, innerEdge, fillAlpha);
            } else if (fillAlpha > outerEdge) {
                // In the outline band
                return 1.0;
            } else {
                // Outside - fade to transparent
                return smoothstep(0.0, outerEdge, fillAlpha);
            }
        }
        
        // Shape functions
        float circle(vec2 p) {
            float dist = length(p);
            return 1.0 - smoothstep(0.35, 0.45, dist);
        }
        
        float square(vec2 p) {
            vec2 d = abs(p);
            float dist = max(d.x, d.y);
            return 1.0 - smoothstep(0.30, 0.40, dist);
        }
        
        float triangle(vec2 p) {
            const float PI = 3.14159265359;
            float a = atan(p.y, p.x) + PI;
            float r = length(p);
            float segments = 3.0;
            float an = PI * 2.0 / segments;
            float sector = floor(a / an);
            float localAngle = a - sector * an - an * 0.5;
            float dist = r * cos(localAngle) / cos(an * 0.5);
            return 1.0 - smoothstep(0.35, 0.45, dist);
        }
        
        float flower(vec2 p) {
            float a = atan(p.y, p.x);
            float r = length(p);
            float f = abs(cos(a * 5.0 / 2.0)) * 0.25 + 0.25;
            return 1.0 - smoothstep(f - 0.02, f + 0.02, r);
        }
        
        float star(vec2 p) {
            const float PI = 3.14159265359;
            float a = atan(p.y, p.x) + PI;
            float r = length(p);
            
            // 5-pointed star
            float segments = 5.0;
            float an = PI * 2.0 / segments;
            float sector = floor((a + an * 0.5) / an);
            float localAngle = a - sector * an;
            
            // Create sharp points
            float innerRadius = 0.15;
            float outerRadius = 0.4;
            
            float t = abs(localAngle / (an * 0.5));
            float radius = mix(outerRadius, innerRadius, t);
            
            return 1.0 - smoothstep(radius - 0.05, radius + 0.05, r);
        }
        
        float crossShape(vec2 p) {
            vec2 d = abs(p);
            float thickness = 0.15;
            float armLength = 0.40;
            
            // Filled cross - two overlapping rectangles
            float horizontal = (d.y < thickness && d.x < armLength) ? 1.0 : 0.0;
            float vertical = (d.x < thickness && d.y < armLength) ? 1.0 : 0.0;
            
            float inShape = max(horizontal, vertical);
            
            // Distance to nearest edge for soft falloff
            float distToEdge = 1.0;
            if (inShape > 0.5) {
                if (horizontal > 0.5 && vertical < 0.5) {
                    distToEdge = min(thickness - d.y, armLength - d.x);
                } else if (vertical > 0.5 && horizontal < 0.5) {
                    distToEdge = min(thickness - d.x, armLength - d.y);
                } else {
                    distToEdge = min(min(thickness - d.y, thickness - d.x), 
                                   min(armLength - d.x, armLength - d.y));
                }
            }
            
            return inShape * (1.0 - smoothstep(0.0, 0.05, -distToEdge));
        }
        
        float diamond(vec2 p) {
            // Elongated diamond (more distinct from square)
            p.y *= 1.5; // Stretch vertically
            float dist = abs(p.x) + abs(p.y);
            return 1.0 - smoothstep(0.45, 0.55, dist);
        }
        
        float hexagon(vec2 p) {
            // Filled regular hexagon
            const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
            p = abs(p);
            p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
            p -= vec2(clamp(p.x, -k.z * 0.5, k.z * 0.5), 0.0);
            float dist = length(p) + 0.15;
            return 1.0 - smoothstep(0.35, 0.45, dist);
        }
        
        float ring(vec2 p) {
            float dist = length(p);
            float ring = abs(dist - 0.30);
            return 1.0 - smoothstep(0.05, 0.10, ring);
        }
        
        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            float alpha = 0.0;
            
            // Select shape based on shapeType
            int shape = int(vShapeType);
            
            if (shape == 0) {
                alpha = circle(center);
            } else if (shape == 1) {
                alpha = square(center);
            } else if (shape == 2) {
                alpha = triangle(center);
            } else if (shape == 3) {
                alpha = flower(center);
            } else if (shape == 4) {
                alpha = star(center);
            } else if (shape == 5) {
                alpha = crossShape(center);
            } else if (shape == 6) {
                alpha = diamond(center);
            } else if (shape == 7) {
                alpha = hexagon(center);
            } else if (shape == 8) {
                alpha = ring(center);
            }
            
            // Convert to outline if not filled
            if (vFilled < 0.5) {
                alpha = toOutline(alpha, center);
            }
            
            if (alpha < 0.01) {
                discard;
            }
            
            // Soft glow with radial gradient
            float glow = softGlow(dist, 0.5);
            
            // Add iridescence for bubble-like effect
            vec3 iridescence = getIridescence(center, dist);
            vec3 finalColor = vColor + iridescence * alpha * 0.4;
            
            // Edge highlight for translucent bubble effect
            float edgeGlow = smoothstep(0.1, 0.4, dist) * smoothstep(0.5, 0.4, dist);
            finalColor += vec3(0.3) * edgeGlow * alpha;
            
            // Soft translucent alpha with glow
            float finalAlpha = alpha * (0.7 + glow * 0.3);
            
            gl_FragColor = vec4(finalColor, finalAlpha);
        }
    `;
}

