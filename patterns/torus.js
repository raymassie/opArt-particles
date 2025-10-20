// Torus knot pattern

class TorusPattern {
    constructor() {
        this.name = "Torus Knot";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        // Torus knot parameters
        const p = 2 + Math.floor(complexity);
        const q = 3 + Math.floor(complexity * 1.5);
        
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            
            // Torus knot equations with wave modulation
            const r = 100 * spread + Math.sin(t * q + time * 2) * 20;
            const theta = p * t + time * 0.5;
            const phi = q * t;
            
            // Add wave perturbation
            const wave = Math.sin(t * 10 * complexity - time * 3) * 15;
            
            positions[i * 3] = (r + 100 * spread) * Math.cos(theta) + wave;
            positions[i * 3 + 1] = (r + 100 * spread) * Math.sin(theta);
            positions[i * 3 + 2] = 100 * spread * Math.sin(phi) + wave * 0.5;
            
            // Color based on knot position
            const colorT = (t / (Math.PI * 2) + time * 0.1) % 1;
            if (blackWhite) {
                colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = colorT;
            } else {
                colors[i * 3] = Math.sin(colorT * Math.PI * 2) * 0.5 + 0.5;
                colors[i * 3 + 1] = Math.sin((colorT + 0.33) * Math.PI * 2) * 0.5 + 0.5;
                colors[i * 3 + 2] = Math.sin((colorT + 0.66) * Math.PI * 2) * 0.5 + 0.5;
            }
            
            sizes[i] = params.size * (1 + Math.sin(t * 8 + time) * 0.3);
        }
        
        return { positions, colors, sizes };
    }
}

