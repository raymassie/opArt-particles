// Liquid metal surface pattern

class LiquidPattern {
    constructor() {
        this.name = "Liquid Metal";
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
                
                // Create flowing liquid surface with multiple frequencies
                const freq1 = Math.sin(x * 0.01 * complexity + time * 1.5) * 
                             Math.cos(z * 0.01 * complexity + time);
                const freq2 = Math.sin(x * 0.02 * complexity - time * 2) * 
                             Math.sin(z * 0.015 * complexity + time * 1.3);
                const freq3 = Math.cos(x * 0.005 * complexity + z * 0.005 * complexity - time * 0.8);
                
                // Combine frequencies for complex liquid motion
                const y = (freq1 * 40 + freq2 * 30 + freq3 * 20);
                
                // Add localized "droplet" disturbances
                const dropletX = Math.sin(time * 0.7) * 200 * spread;
                const dropletZ = Math.cos(time * 0.7) * 200 * spread;
                const distToDroplet = Math.sqrt((x - dropletX) ** 2 + (z - dropletZ) ** 2);
                const droplet = Math.sin(distToDroplet * 0.05 - time * 5) * 
                              Math.exp(-distToDroplet * 0.005) * 30;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y + droplet;
                positions[idx * 3 + 2] = z;
                
                // Metallic/reflective color scheme
                const height = (y + droplet + 90) / 180;
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = height;
                } else {
                    // Chrome-like gradient
                    colors[idx * 3] = height * 0.8 + 0.2;
                    colors[idx * 3 + 1] = height * 0.9 + 0.1;
                    colors[idx * 3 + 2] = height;
                }
                
                sizes[idx] = params.size * (0.8 + height * 0.4);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

