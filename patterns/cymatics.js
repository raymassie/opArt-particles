// Cymatics-inspired standing wave pattern

class CymaticsPattern {
    constructor() {
        this.name = "Cymatics";
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
                
                const x = (i / gridSize - 0.5) * 500 * spread;
                const z = (j / gridSize - 0.5) * 500 * spread;
                
                // Chladni plate equations (cymatics)
                const n = Math.floor(2 + complexity);
                const m = Math.floor(2 + complexity * 1.3);
                
                const normalizedX = (x / (250 * spread) + 1) * Math.PI;
                const normalizedZ = (z / (250 * spread) + 1) * Math.PI;
                
                const chladni = Math.sin(n * normalizedX) * Math.sin(m * normalizedZ) +
                              Math.sin(m * normalizedX) * Math.sin(n * normalizedZ);
                
                // Modulate with time
                const timeWave = Math.sin(time * 2) * 0.3 + 0.7;
                const y = chladni * 60 * timeWave;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Color nodes and antinodes differently
                const amplitude = Math.abs(chladni);
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = amplitude;
                } else {
                    colors[idx * 3] = amplitude;
                    colors[idx * 3 + 1] = Math.sin(amplitude * Math.PI + time) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = 1 - amplitude;
                }
                
                // Make nodes more visible
                sizes[idx] = params.size * (amplitude > 0.3 ? 1.5 : 0.5);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

