// Particles forming the edges of a cube

class ParticleCubePattern {
    constructor() {
        this.name = "Particle Cube";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const size = 200 * spread;
        const edges = [
            // Bottom square
            [[-1,-1,-1], [1,-1,-1]], [[1,-1,-1], [1,-1,1]], [[1,-1,1], [-1,-1,1]], [[-1,-1,1], [-1,-1,-1]],
            // Top square
            [[-1,1,-1], [1,1,-1]], [[1,1,-1], [1,1,1]], [[1,1,1], [-1,1,1]], [[-1,1,1], [-1,1,-1]],
            // Vertical edges
            [[-1,-1,-1], [-1,1,-1]], [[1,-1,-1], [1,1,-1]], [[1,-1,1], [1,1,1]], [[-1,-1,1], [-1,1,1]]
        ];
        
        const particlesPerEdge = Math.floor(count / edges.length);
        
        let idx = 0;
        for (let e = 0; e < edges.length; e++) {
            const [start, end] = edges[e];
            
            for (let i = 0; i < particlesPerEdge && idx < count; i++) {
                const t = i / particlesPerEdge;
                
                // Lerp between start and end
                const x = (start[0] + (end[0] - start[0]) * t) * size;
                const y = (start[1] + (end[1] - start[1]) * t) * size;
                const z = (start[2] + (end[2] - start[2]) * t) * size;
                
                // Add breathing effect
                const breathe = 1 + Math.sin(time * 2) * 0.1;
                
                // Add slight noise for organic feel
                const noise = Math.sin(t * 10 + time + e) * 5 * complexity;
                
                positions[idx * 3] = x * breathe + noise;
                positions[idx * 3 + 1] = y * breathe + noise;
                positions[idx * 3 + 2] = z * breathe + noise;
                
                // Color based on edge
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = 1;
                } else {
                    colors[idx * 3] = (e % 3 === 0) ? 1 : 0.2;
                    colors[idx * 3 + 1] = (e % 3 === 1) ? 1 : 0.2;
                    colors[idx * 3 + 2] = (e % 3 === 2) ? 1 : 0.2;
                }
                
                sizes[idx] = params.size * (0.8 + Math.sin(t * Math.PI) * 0.4);
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

