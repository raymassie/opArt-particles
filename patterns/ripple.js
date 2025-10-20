// Multi-source ripple pattern

class RipplePattern {
    constructor() {
        this.name = "Ripple Pool";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        const gridSize = Math.ceil(Math.sqrt(count));
        
        // Multiple wave sources
        const sources = [
            { x: 100 * spread, z: 100 * spread, phase: time },
            { x: -150 * spread, z: -100 * spread, phase: time * 1.3 },
            { x: 50 * spread, z: -150 * spread, phase: time * 0.8 },
            { x: -100 * spread, z: 150 * spread, phase: time * 1.1 }
        ];
        
        let idx = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (idx >= count) break;
                
                const x = (i / gridSize - 0.5) * 600 * spread;
                const z = (j / gridSize - 0.5) * 600 * spread;
                
                // Calculate interference from all sources
                let totalWave = 0;
                let colorPhase = 0;
                
                for (let s of sources) {
                    const dist = Math.sqrt((x - s.x) ** 2 + (z - s.z) ** 2);
                    const wave = Math.sin(dist * 0.02 * complexity - s.phase * 2) * 
                                Math.exp(-dist * 0.001);
                    totalWave += wave;
                    colorPhase += wave;
                }
                
                const y = totalWave * 40;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Color based on wave amplitude and phase
                const normalizedWave = (totalWave + 2) / 4;
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = normalizedWave;
                } else {
                    colors[idx * 3] = Math.sin(colorPhase + time) * 0.5 + 0.5;
                    colors[idx * 3 + 1] = Math.cos(colorPhase + time * 1.5) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = Math.sin(colorPhase * 2 - time) * 0.5 + 0.5;
                }
                
                sizes[idx] = params.size * (0.8 + normalizedWave * 0.4);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

