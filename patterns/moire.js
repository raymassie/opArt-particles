// 3D Moiré pattern

class MoirePattern {
    constructor() {
        this.name = "3D Moiré";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        const layers = 3;
        const particlesPerLayer = Math.floor(count / layers);
        const gridSize = Math.ceil(Math.sqrt(particlesPerLayer));
        
        let idx = 0;
        
        for (let layer = 0; layer < layers; layer++) {
            const zOffset = (layer - 1) * 100 * spread;
            const rotation = layer * Math.PI / 3 + time * complexity * 0.5;
            
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (idx >= count) break;
                    
                    const x = (i / gridSize - 0.5) * 400 * spread;
                    const y = (j / gridSize - 0.5) * 400 * spread;
                    
                    // Rotate each layer
                    const rotX = x * Math.cos(rotation) - y * Math.sin(rotation);
                    const rotY = x * Math.sin(rotation) + y * Math.cos(rotation);
                    
                    // Add sinusoidal displacement
                    const displacement = Math.sin(rotX * 0.02 * complexity + time) * 
                                       Math.cos(rotY * 0.02 * complexity - time) * 20;
                    
                    positions[idx * 3] = rotX;
                    positions[idx * 3 + 1] = rotY;
                    positions[idx * 3 + 2] = zOffset + displacement;
                    
                    // Interference pattern coloring
                    const interference = Math.sin(rotX * 0.03 * complexity + time) * 
                                       Math.cos(rotY * 0.03 * complexity - time);
                    
                    if (blackWhite) {
                        const val = (interference + 1) / 2;
                        colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = val;
                    } else {
                        colors[idx * 3] = (Math.sin(interference * Math.PI + time) + 1) / 2;
                        colors[idx * 3 + 1] = (Math.cos(interference * Math.PI + time * 1.5) + 1) / 2;
                        colors[idx * 3 + 2] = (Math.sin(interference * Math.PI * 2 - time) + 1) / 2;
                    }
                    
                    sizes[idx] = params.size * (1 + Math.abs(interference) * 0.5);
                    
                    idx++;
                }
            }
        }
        
        return { positions, colors, sizes };
    }
}

