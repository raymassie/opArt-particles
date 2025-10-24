// Warped grid/checkerboard with spherical distortion

class WarpedGridPattern {
    constructor() {
        this.name = "Warped Grid";
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
                
                // Distance from center for spherical warp
                const dist = Math.sqrt(x * x + z * z);
                const maxDist = 300 * spread;
                
                // Spherical bulge effect
                const bulge = Math.sin((dist / maxDist) * Math.PI * 0.5) * 200;
                const warp = Math.pow(1 - Math.min(dist / maxDist, 1), 2) * bulge;
                
                // Add time-based pulsing
                const pulse = Math.sin(time * 2 + dist * 0.01) * 30;
                
                const y = warp + pulse;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Checkerboard pattern
                const cellSize = 50 * complexity;
                const cellX = Math.floor((x + 300 * spread) / cellSize);
                const cellZ = Math.floor((z + 300 * spread) / cellSize);
                const isBlack = (cellX + cellZ) % 2 === 0;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = isBlack ? 0 : 1;
                } else {
                    const hue = (y + 200) / 400;
                    colors[idx * 3] = isBlack ? hue : 1 - hue;
                    colors[idx * 3 + 1] = isBlack ? 0.2 : 0.8;
                    colors[idx * 3 + 2] = isBlack ? 1 - hue : hue;
                }
                
                // Vary size based on height for depth effect
                sizes[idx] = params.size * (0.5 + (y + 200) / 400 * 0.5);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

