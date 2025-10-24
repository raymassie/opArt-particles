// Bridget Riley inspired wavy lines pattern

class RileyLinesPattern {
    constructor() {
        this.name = "Riley Lines";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const numLines = 30 * spread;
        const particlesPerLine = Math.floor(count / numLines);
        
        let idx = 0;
        for (let line = 0; line < numLines; line++) {
            const y = (line / numLines - 0.5) * 600 * spread;
            
            for (let i = 0; i < particlesPerLine && idx < count; i++) {
                const t = i / particlesPerLine;
                const x = (t - 0.5) * 800 * spread;
                
                // Multiple wave frequencies create Riley effect
                const wave1 = Math.sin(x * 0.01 * complexity + time + line * 0.3) * 40;
                const wave2 = Math.sin(x * 0.02 * complexity - time * 0.5 + line * 0.2) * 20;
                const wave3 = Math.sin(x * 0.005 * complexity + time * 1.5) * 60;
                
                const z = wave1 + wave2 + wave3;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // Alternating line colors for contrast
                const lineColor = Math.floor(line) % 2;
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = lineColor;
                } else {
                    // Color based on wave amplitude
                    const amp = (z + 120) / 240;
                    colors[idx * 3] = lineColor ? amp : 1 - amp;
                    colors[idx * 3 + 1] = Math.sin(amp * Math.PI) * 0.8 + 0.2;
                    colors[idx * 3 + 2] = lineColor ? 1 - amp : amp;
                }
                
                sizes[idx] = params.size * 1.2;
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

