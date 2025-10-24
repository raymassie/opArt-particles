// Particles forming a pyramid

class ParticlePyramidPattern {
    constructor() {
        this.name = "Particle Pyramid";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const size = 200 * spread;
        const height = 300 * spread;
        
        // Pyramid edges
        const base = [
            [-1, -0.5, -1], [1, -0.5, -1],
            [1, -0.5, -1], [1, -0.5, 1],
            [1, -0.5, 1], [-1, -0.5, 1],
            [-1, -0.5, 1], [-1, -0.5, -1]
        ];
        const apex = [0, 1, 0];
        
        const edges = [
            // Base
            [[-1, -0.5, -1], [1, -0.5, -1]],
            [[1, -0.5, -1], [1, -0.5, 1]],
            [[1, -0.5, 1], [-1, -0.5, 1]],
            [[-1, -0.5, 1], [-1, -0.5, -1]],
            // To apex
            [[-1, -0.5, -1], apex],
            [[1, -0.5, -1], apex],
            [[1, -0.5, 1], apex],
            [[-1, -0.5, 1], apex]
        ];
        
        const particlesPerEdge = Math.floor(count / edges.length);
        
        let idx = 0;
        for (let e = 0; e < edges.length; e++) {
            const [start, end] = edges[e];
            
            for (let i = 0; i < particlesPerEdge && idx < count; i++) {
                const t = i / particlesPerEdge;
                
                let x = (start[0] + (end[0] - start[0]) * t) * size;
                let y = (start[1] + (end[1] - start[1]) * t) * height;
                let z = (start[2] + (end[2] - start[2]) * t) * size;
                
                // Pulse effect
                const pulse = 1 + Math.sin(time * 2 + t * Math.PI * 2) * 0.15;
                
                positions[idx * 3] = x * pulse;
                positions[idx * 3 + 1] = y * pulse;
                positions[idx * 3 + 2] = z * pulse;
                
                // Color gradient from base to apex
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = 1;
                } else {
                    const gradientT = (y + height * 0.5) / (height * 1.5);
                    colors[idx * 3] = 1 - gradientT * 0.7;
                    colors[idx * 3 + 1] = gradientT;
                    colors[idx * 3 + 2] = 0.5 + Math.sin(time + e) * 0.5;
                }
                
                sizes[idx] = params.size * (1.5 - t * 0.5);
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

