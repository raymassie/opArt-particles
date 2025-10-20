// Fabric/cloth simulation pattern

class FabricPattern {
    constructor() {
        this.name = "Flowing Fabric";
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
                
                // Create flowing cloth with wind effect
                const windX = Math.sin(time * 0.5) * 100;
                const windZ = Math.cos(time * 0.7) * 100;
                
                const distanceFromWind = Math.sqrt((x - windX) ** 2 + (z - windZ) ** 2);
                
                // Multiple harmonics for cloth-like motion
                const wave1 = Math.sin(x * 0.015 * complexity + time * 2) * 30;
                const wave2 = Math.cos(z * 0.012 * complexity - time * 1.7) * 25;
                const wave3 = Math.sin((x + z) * 0.01 * complexity + time * 1.5) * 20;
                const wave4 = Math.sin(distanceFromWind * 0.02 - time * 3) * 
                             Math.exp(-distanceFromWind * 0.003) * 40;
                
                const y = wave1 + wave2 + wave3 + wave4;
                
                // Add pinned corners effect
                const cornerDist = Math.min(
                    Math.abs(x + 300 * spread) + Math.abs(z + 300 * spread),
                    Math.abs(x - 300 * spread) + Math.abs(z + 300 * spread)
                );
                const pinWeight = Math.max(0, 1 - cornerDist / (600 * spread));
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y * (1 - pinWeight * 0.8);
                positions[idx * 3 + 2] = z;
                
                // Color based on height and position
                const normalizedY = (y + 115) / 230;
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = normalizedY;
                } else {
                    // Fabric-like color gradient
                    colors[idx * 3] = 0.3 + normalizedY * 0.5;
                    colors[idx * 3 + 1] = 0.2 + normalizedY * 0.6;
                    colors[idx * 3 + 2] = 0.5 + normalizedY * 0.5;
                }
                
                sizes[idx] = params.size * (0.9 + normalizedY * 0.2);
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

