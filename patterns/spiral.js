// Spiral vortex pattern

class SpiralPattern {
    constructor() {
        this.name = "Spiral Vortex";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 20 * complexity + time;
            const radius = t * 300 * spread;
            
            // Create 3D spiral
            const height = (t - 0.5) * 500 * spread;
            const twist = Math.sin(t * Math.PI * 4 * complexity + time) * 50;
            
            positions[i * 3] = Math.cos(angle) * (radius + twist);
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * (radius + twist);
            
            // Color based on position
            if (blackWhite) {
                const gray = t;
                colors[i * 3] = gray;
                colors[i * 3 + 1] = gray;
                colors[i * 3 + 2] = gray;
            } else {
                colors[i * 3] = Math.sin(t * Math.PI * 2 + time) * 0.5 + 0.5;
                colors[i * 3 + 1] = Math.cos(t * Math.PI * 3 + time * 1.3) * 0.5 + 0.5;
                colors[i * 3 + 2] = Math.sin(t * Math.PI * 5 + time * 0.7) * 0.5 + 0.5;
            }
            
            sizes[i] = params.size * (1 + Math.sin(t * Math.PI * 10) * 0.5);
        }
        
        return { positions, colors, sizes };
    }
}

