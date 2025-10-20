// Wave field pattern

class WavePattern {
    constructor() {
        this.name = "Wave Field";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        const gridSize = Math.ceil(Math.sqrt(count));
        
        let idx = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (idx >= count) break;
                
                const x = (i / gridSize - 0.5) * 600 * spread;
                const z = (j / gridSize - 0.5) * 600 * spread;
                
                // Multiple wave interference
                const dist = Math.sqrt(x * x + z * z);
                const wave1 = Math.sin(dist * 0.02 * complexity - time * 2) * 50;
                const wave2 = Math.cos(x * 0.01 * complexity + time) * 30;
                const wave3 = Math.sin(z * 0.01 * complexity - time * 1.5) * 30;
                
                const y = wave1 + wave2 + wave3;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Color based on height
                const normalizedY = (y + 110) / 220;
                if (blackWhite) {
                    colors[idx * 3] = normalizedY;
                    colors[idx * 3 + 1] = normalizedY;
                    colors[idx * 3 + 2] = normalizedY;
                } else {
                    colors[idx * 3] = normalizedY;
                    colors[idx * 3 + 1] = Math.sin(normalizedY * Math.PI) * 0.8 + 0.2;
                    colors[idx * 3 + 2] = 1 - normalizedY;
                }
                
                sizes[idx] = params.size * (0.8 + normalizedY * 0.4);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

