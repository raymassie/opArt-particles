// Radiating lines from center with density variation

class RadialBurstPattern {
    constructor() {
        this.name = "Radial Burst";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const numRays = Math.floor(60 * complexity);
        const particlesPerRay = Math.floor(count / numRays);
        const maxRadius = 500 * spread;
        
        let idx = 0;
        for (let ray = 0; ray < numRays && idx < count; ray++) {
            const baseAngle = (ray / numRays) * Math.PI * 2;
            
            // Subtle rotation
            const angle = baseAngle + time * 0.3;
            
            for (let i = 0; i < particlesPerRay && idx < count; i++) {
                const t = i / particlesPerRay;
                
                // Variable density along ray
                const densityMod = Math.sin(t * Math.PI * 3 + time) * 0.5 + 1;
                const radius = t * maxRadius;
                
                // Slight spiral
                const spiralAngle = angle + t * 0.5;
                
                const x = Math.cos(spiralAngle) * radius;
                const y = Math.sin(spiralAngle) * radius;
                const z = Math.sin(t * Math.PI * 2 + time) * 20;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Alternating rays
                const rayGroup = ray % 2;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = rayGroup;
                } else {
                    colors[idx * 3] = rayGroup ? t : 1 - t;
                    colors[idx * 3 + 1] = Math.sin(t * Math.PI);
                    colors[idx * 3 + 2] = rayGroup ? 1 - t : t;
                }
                
                sizes[idx] = params.size * densityMod;
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

