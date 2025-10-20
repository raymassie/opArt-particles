// Sphere burst pattern

class SpherePattern {
    constructor() {
        this.name = "Sphere Burst";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        for (let i = 0; i < count; i++) {
            const t = i / count;
            
            // Fibonacci sphere distribution
            const phi = Math.acos(1 - 2 * t);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            // Pulsing radius
            const pulse = Math.sin(time * 2 + t * Math.PI * complexity) * 0.3 + 1;
            const radius = 200 * spread * pulse;
            
            // Add noise
            const noise = Math.sin(theta * complexity * 2 + time) * 
                         Math.cos(phi * complexity * 2 - time) * 20;
            
            const r = radius + noise;
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            
            // Striped color pattern
            if (blackWhite) {
                const stripe = Math.floor(phi * 10 * complexity) % 2;
                colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = stripe;
            } else {
                colors[i * 3] = Math.sin(phi * complexity * 2 + time) * 0.5 + 0.5;
                colors[i * 3 + 1] = Math.cos(theta * complexity + time * 1.2) * 0.5 + 0.5;
                colors[i * 3 + 2] = Math.sin(theta * complexity * 0.5 - time * 0.8) * 0.5 + 0.5;
            }
            
            sizes[i] = params.size * pulse;
        }
        
        return { positions, colors, sizes };
    }
}

