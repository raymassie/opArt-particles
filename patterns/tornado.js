// Tornado pattern

class TornadoPattern {
    constructor() {
        this.name = "Tornado";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const { time, spread, complexity, blackWhite } = params;
        
        for (let i = 0; i < count; i++) {
            const t = i / count;
            
            // Vertical position
            const y = (t - 0.5) * 600 * spread;
            
            // Radius grows with height
            const radiusBase = Math.abs(y) * 0.5;
            const radiusNoise = Math.sin(t * Math.PI * 10 * complexity + time * 3) * 20;
            const radius = radiusBase + radiusNoise;
            
            // Angle accelerates with height
            const angleSpeed = (1 + Math.abs(t - 0.5) * 2) * complexity;
            const angle = t * Math.PI * 20 * angleSpeed + time * 2;
            
            // Create helical motion
            const wobble = Math.sin(angle * 5 + time * 4) * 15;
            
            positions[i * 3] = Math.cos(angle) * radius + wobble;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(angle) * radius + wobble;
            
            // Color based on rotation and height
            if (blackWhite) {
                const stripe = Math.floor((angle / Math.PI + time) * 4) % 2;
                colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = stripe;
            } else {
                const hue = (angle / (Math.PI * 2) + time * 0.2) % 1;
                colors[i * 3] = Math.sin(hue * Math.PI * 2) * 0.5 + 0.5;
                colors[i * 3 + 1] = Math.sin((hue + 0.33) * Math.PI * 2) * 0.5 + 0.5;
                colors[i * 3 + 2] = Math.sin((hue + 0.66) * Math.PI * 2) * 0.5 + 0.5;
            }
            
            // Size variation
            sizes[i] = params.size * (0.8 + Math.sin(t * Math.PI * 8 + time) * 0.4);
        }
        
        return { positions, colors, sizes };
    }
}

