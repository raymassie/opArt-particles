// Dense concentric rings with variable spacing for moiré effect

class ConcentricRingsPattern {
    constructor() {
        this.name = "Concentric Rings";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const maxRadius = 500 * spread;
        let idx = 0;
        let radius = 10;
        
        while (radius < maxRadius && idx < count) {
            // Variable spacing creates optical beating effect
            const ringNum = radius / 20;
            const spacingMod = Math.sin(ringNum * 0.3 * complexity + time * 0.5) * 0.7 + 1.3;
            const nextRadius = radius + (8 * spacingMod);
            
            // Dense particles per ring
            const circumference = 2 * Math.PI * radius;
            const particlesInRing = Math.floor(circumference / (3 / complexity));
            
            for (let i = 0; i < particlesInRing && idx < count; i++) {
                const angle = (i / particlesInRing) * Math.PI * 2 + time * 0.2;
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const z = 0;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Alternating rings with gradient
                const ringColor = Math.floor(ringNum) % 2;
                const gradientT = radius / maxRadius;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = ringColor;
                } else {
                    colors[idx * 3] = ringColor ? gradientT : 1 - gradientT;
                    colors[idx * 3 + 1] = Math.sin(gradientT * Math.PI) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = ringColor ? 1 - gradientT : gradientT;
                }
                
                sizes[idx] = params.size * (1 + spacingMod * 0.3);
                idx++;
            }
            
            radius = nextRadius;
        }
        
        return { positions, colors, sizes };
    }
}

