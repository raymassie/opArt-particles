// Particles forming an icosahedron (20-sided polyhedron)

class ParticleIcosahedronPattern {
    constructor() {
        this.name = "Particle Icosahedron";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const size = 200 * spread;
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        
        // 12 vertices of icosahedron
        const vertices = [
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
        ];
        
        // Normalize vertices
        for (let i = 0; i < vertices.length; i++) {
            const len = Math.sqrt(vertices[i][0]**2 + vertices[i][1]**2 + vertices[i][2]**2);
            vertices[i] = vertices[i].map(v => v / len);
        }
        
        // 30 edges
        const edges = [
            [0,11], [0,5], [0,1], [0,7], [0,10],
            [1,5], [1,7], [1,9], [1,8],
            [2,3], [2,4], [2,6], [2,10], [2,11],
            [3,4], [3,6], [3,8], [3,9],
            [4,5], [4,9], [4,11],
            [5,9], [5,11],
            [6,7], [6,8], [6,10],
            [7,8], [7,10],
            [8,9],
            [10,11]
        ];
        
        const particlesPerEdge = Math.floor(count / edges.length);
        
        let idx = 0;
        for (let e = 0; e < edges.length; e++) {
            const [startIdx, endIdx] = edges[e];
            const start = vertices[startIdx];
            const end = vertices[endIdx];
            
            for (let i = 0; i < particlesPerEdge && idx < count; i++) {
                const t = i / particlesPerEdge;
                
                const x = (start[0] + (end[0] - start[0]) * t) * size;
                const y = (start[1] + (end[1] - start[1]) * t) * size;
                const z = (start[2] + (end[2] - start[2]) * t) * size;
                
                // Pulsing rotation
                const angle = time * 0.5;
                const rotX = x * Math.cos(angle) - z * Math.sin(angle);
                const rotZ = x * Math.sin(angle) + z * Math.cos(angle);
                
                // Breathing
                const breathe = 1 + Math.sin(time * 1.5 + e * 0.1) * 0.1;
                
                positions[idx * 3] = rotX * breathe;
                positions[idx * 3 + 1] = y * breathe;
                positions[idx * 3 + 2] = rotZ * breathe;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = 1;
                } else {
                    const dist = Math.sqrt(x*x + y*y + z*z);
                    colors[idx * 3] = Math.sin(dist * 0.01 + time) * 0.5 + 0.5;
                    colors[idx * 3 + 1] = Math.sin(dist * 0.01 + time + Math.PI * 0.66) * 0.5 + 0.5;
                    colors[idx * 3 + 2] = Math.sin(dist * 0.01 + time + Math.PI * 1.33) * 0.5 + 0.5;
                }
                
                sizes[idx] = params.size;
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

