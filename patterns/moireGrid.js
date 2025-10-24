// Rotating moiré grid pattern

class MoireGridPattern {
    constructor() {
        this.name = "Moiré Grid";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        // Create two overlapping grids
        const halfCount = Math.floor(count / 2);
        const lineSpacing = 20 * complexity;
        const numLines = Math.floor(600 * spread / lineSpacing);
        const particlesPerLine = Math.floor(halfCount / numLines);
        
        let idx = 0;
        
        // First grid - vertical lines
        for (let line = 0; line < numLines && idx < halfCount; line++) {
            const x = (line / numLines - 0.5) * 600 * spread;
            
            for (let i = 0; i < particlesPerLine && idx < halfCount; i++) {
                const y = (i / particlesPerLine - 0.5) * 600 * spread;
                
                // Rotate around center
                const angle = time * 0.3;
                const rotX = x * Math.cos(angle) - y * Math.sin(angle);
                const rotY = x * Math.sin(angle) + y * Math.cos(angle);
                
                positions[idx * 3] = rotX;
                positions[idx * 3 + 1] = rotY;
                positions[idx * 3 + 2] = 0;
                
                colors[idx * 3] = blackWhite ? 1 : 0.8;
                colors[idx * 3 + 1] = blackWhite ? 1 : 0.2;
                colors[idx * 3 + 2] = blackWhite ? 1 : 0.3;
                
                sizes[idx] = params.size;
                idx++;
            }
        }
        
        // Second grid - horizontal lines (rotated differently)
        for (let line = 0; line < numLines && idx < count; line++) {
            const y = (line / numLines - 0.5) * 600 * spread;
            
            for (let i = 0; i < particlesPerLine && idx < count; i++) {
                const x = (i / particlesPerLine - 0.5) * 600 * spread;
                
                // Rotate opposite direction
                const angle = -time * 0.2 + Math.PI / 6; // Offset angle for moiré
                const rotX = x * Math.cos(angle) - y * Math.sin(angle);
                const rotY = x * Math.sin(angle) + y * Math.cos(angle);
                
                positions[idx * 3] = rotX;
                positions[idx * 3 + 1] = rotY;
                positions[idx * 3 + 2] = 0;
                
                colors[idx * 3] = blackWhite ? 1 : 0.3;
                colors[idx * 3 + 1] = blackWhite ? 1 : 0.7;
                colors[idx * 3 + 2] = blackWhite ? 1 : 0.9;
                
                sizes[idx] = params.size;
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

