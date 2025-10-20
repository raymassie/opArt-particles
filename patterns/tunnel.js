// Tunnel vision pattern

class TunnelPattern {
    constructor() {
        this.name = "Tunnel Vision";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        const ringsCount = 50;
        const particlesPerRing = Math.floor(count / ringsCount);
        
        let idx = 0;
        for (let ring = 0; ring < ringsCount; ring++) {
            const z = (ring / ringsCount - 0.5) * 800 * spread - (time * 100) % 800;
            const radius = 150 * (1 - Math.abs(z / 400));
            const rotationOffset = ring * 0.5 + time * complexity;
            
            for (let i = 0; i < particlesPerRing && idx < count; i++) {
                const angle = (i / particlesPerRing) * Math.PI * 2 + rotationOffset;
                
                // Add wave to radius
                const wave = Math.sin(angle * 8 * complexity + time * 3) * 10;
                const r = radius + wave;
                
                positions[idx * 3] = Math.cos(angle) * r;
                positions[idx * 3 + 1] = Math.sin(angle) * r;
                positions[idx * 3 + 2] = z;
                
                // Zebra stripe effect
                const stripe = Math.floor(ring + time * 2) % 2;
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = stripe;
                } else {
                    const hue = (ring / ringsCount + time * 0.1) % 1;
                    colors[idx * 3] = Math.sin(hue * Math.PI * 2) * 0.5 + 0.5;
                    colors[idx * 3 + 1] = Math.sin((hue + 0.33) * Math.PI * 2) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = Math.sin((hue + 0.66) * Math.PI * 2) * 0.5 + 0.5;
                }
                
                // Fade particles based on distance
                const depthFade = 1 - Math.abs(z / 400);
                sizes[idx] = params.size * depthFade * 2;
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

