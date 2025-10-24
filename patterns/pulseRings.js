// Concentric rings with variable spacing (pulsing illusion)

class PulseRingsPattern {
    constructor() {
        this.name = "Pulse Rings";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const maxRadius = 400 * spread;
        const baseSpacing = 15;
        
        let idx = 0;
        let radius = 0;
        
        while (radius < maxRadius && idx < count) {
            // Variable spacing creates "beating" optical effect
            const spacingMod = Math.sin(radius * 0.02 * complexity + time) * 0.5 + 1;
            const spacing = baseSpacing * spacingMod;
            
            radius += spacing;
            
            // Particles per ring based on circumference
            const circumference = 2 * Math.PI * radius;
            const particlesInRing = Math.max(10, Math.floor(circumference / 5));
            
            for (let i = 0; i < particlesInRing && idx < count; i++) {
                const angle = (i / particlesInRing) * Math.PI * 2;
                
                // Add subtle rotation
                const rotatedAngle = angle + time * 0.5;
                
                const x = Math.cos(rotatedAngle) * radius;
                const y = Math.sin(rotatedAngle) * radius;
                
                // Height variation creates 3D cone effect
                const z = Math.sin(radius * 0.01 * complexity - time) * 50;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Alternating ring colors
                const ringNum = Math.floor(radius / 30);
                const isOdd = ringNum % 2 === 1;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = isOdd ? 0 : 1;
                } else {
                    const hue = (radius / maxRadius + time * 0.1) % 1;
                    colors[idx * 3] = Math.sin(hue * Math.PI * 2) * 0.5 + 0.5;
                    colors[idx * 3 + 1] = Math.sin((hue + 0.33) * Math.PI * 2) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = Math.sin((hue + 0.66) * Math.PI * 2) * 0.5 + 0.5;
                }
                
                // Size varies with spacing for emphasis
                sizes[idx] = params.size * spacingMod;
                
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

