// Particles forming an octahedron (double pyramid)

class ParticleOctahedronPattern {
    constructor() {
        this.name = "Particle Octahedron";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        const size = 200 * spread;
        
        // 6 vertices (top, bottom, 4 around middle)
        const vertices = [
            [0, 1, 0],    // top
            [0, -1, 0],   // bottom
            [1, 0, 0],    // right
            [-1, 0, 0],   // left
            [0, 0, 1],    // front
            [0, 0, -1]    // back
        ];
        
        // 12 edges
        const edges = [
            // Top pyramid
            [0,2], [0,4], [0,3], [0,5],
            // Bottom pyramid
            [1,2], [1,4], [1,3], [1,5],
            // Middle square
            [2,4], [4,3], [3,5], [5,2]
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
                
                // Multi-axis rotation
                const angle1 = time * 0.7;
                const angle2 = time * 0.5;
                
                let rotX = x * Math.cos(angle1) - z * Math.sin(angle1);
                let rotZ = x * Math.sin(angle1) + z * Math.cos(angle1);
                let rotY = y * Math.cos(angle2) - rotZ * Math.sin(angle2);
                rotZ = y * Math.sin(angle2) + rotZ * Math.cos(angle2);
                
                // Pulse effect
                const pulse = 1 + Math.sin(time * 2.5 + e * 0.3) * 0.15;
                
                positions[idx * 3] = rotX * pulse;
                positions[idx * 3 + 1] = rotY * pulse;
                positions[idx * 3 + 2] = rotZ * pulse;
                
                if (blackWhite) {
                    colors[idx * 3] = colors[idx * 3 + 1] = colors[idx * 3 + 2] = 1;
                } else {
                    // Different color per face
                    const faceGroup = Math.floor(e / 4);
                    colors[idx * 3] = faceGroup === 0 ? 1 : 0.3;
                    colors[idx * 3 + 1] = faceGroup === 1 ? 1 : 0.3;
                    colors[idx * 3 + 2] = faceGroup === 2 ? 1 : 0.3;
                }
                
                sizes[idx] = params.size * (0.9 + Math.sin(t * Math.PI * 2 + time) * 0.3);
                idx++;
            }
        }
        
        return { positions, colors, sizes };
    }
}

