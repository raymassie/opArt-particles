// Dense Bridget Riley style wavy lines

class DenseRileyPattern {
    constructor() {
        this.name = "Dense Riley Waves";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const lineSpacing = 8;
        const numLines = Math.floor(600 * spread / lineSpacing);
        const particlesPerLine = Math.floor(count / numLines);
        
        let idx = 0;
        for (let line = 0; line < numLines && idx < count; line++) {
            const y = (line / numLines - 0.5) * 600 * spread;
            
            // Dense particles along each line
            for (let i = 0; i < particlesPerLine && idx < count; i++) {
                const t = i / particlesPerLine;
                const x = (t - 0.5) * 900 * spread;
                
                // Multiple wave frequencies for Riley shimmer
                const freq1 = 0.015 * complexity;
                const freq2 = 0.008 * complexity;
                const freq3 = 0.003 * complexity;
                
                const wave = Math.sin(x * freq1 + time * 2 + line * 0.2) * 30 +
                            Math.sin(x * freq2 - time + line * 0.15) * 20 +
                            Math.sin(x * freq3 + time * 0.5) * 40;
                
                const z = wave;
                
                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                
                // High contrast alternating lines
                const lineGroup = Math.floor(line / 2) % 2;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = lineGroup;
                } else {
                    const waveT = (z + 90) / 180;
                    colors[idx * 3] = lineGroup ? waveT : 1 - waveT;
                    colors[idx * 3 + 1] = Math.abs(Math.sin(waveT * Math.PI * 2));
                    colors[idx * 3 + 2] = lineGroup ? 1 - waveT : waveT;
                }
                
                sizes[idx] = params.size * 1.5;
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

