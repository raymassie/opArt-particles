# Particle Op-Art

3D particle system generator creating abstract op-art patterns with WebGL splats. Explore mesmerizing optical illusions in three-dimensional space.

**[🎨 Live Demo](https://raymassie.github.io/opArt-particles/)**

## Features

### 11 Dynamic Patterns

- **Spiral Vortex** - Helical particle spirals with twist animations
- **Wave Field** - Multi-directional wave interference in 3D
- **Ripple Pool** - Multi-source wave interference with four ripple centers
- **Liquid Metal** - Flowing metallic surface with droplet disturbances
- **Cymatics** - Standing wave patterns (Chladni plates)
- **Flowing Fabric** - Cloth simulation with wind effects
- **Torus Knot** - 3D mathematical knot with wave modulation
- **Sphere Burst** - Pulsing Fibonacci sphere with noise displacement
- **Tunnel Vision** - Infinite tunnel with zebra stripe effects
- **3D Moiré** - Layered interference patterns with rotation
- **Tornado** - Helical vortex with accelerating rotation

### Real-time Controls

- **Particle Count** - 1,000 to 50,000 particles (performance dependent)
- **Speed** - Animation speed control
- **Spread** - Spatial distribution scale
- **Complexity** - Pattern detail and variation
- **Particle Size** - Splat size adjustment
- **Rotation Speed** - Camera auto-rotation speed
- **Black & White** - Toggle color/monochrome
- **Animate** - Play/pause animation
- **Auto Rotate** - Toggle automatic camera rotation

### Interaction

- **Click + Drag** - Manual camera rotation
- **Mouse Wheel** - Zoom in/out
- **Spacebar** - Pause/play animation
- **Randomize** - Generate random combinations
- **Save Image** - Export current frame as PNG
- **Record Video** - Capture animations as WebM video (60 FPS)

## Technical Details

- **Renderer**: Three.js WebGL
- **Particles**: Custom shader material with soft circular splats
- **Blending**: Additive blending for luminous effects
- **Shaders**: Custom vertex/fragment shaders for splat rendering
- **Performance**: Up to 50K particles at 60 FPS (hardware dependent)

## Architecture

```
opArt-particles/
├── index.html          # Main page
├── styles.css          # UI styling
├── sketch.js           # Three.js setup and main loop
├── utils/
│   └── helpers.js      # Utilities and shader code
└── patterns/
    ├── spiral.js       # Spiral vortex pattern
    ├── wave.js         # Wave field pattern
    ├── ripple.js       # Ripple pool pattern
    ├── liquid.js       # Liquid metal pattern
    ├── cymatics.js     # Cymatics pattern
    ├── fabric.js       # Flowing fabric pattern
    ├── torus.js        # Torus knot pattern
    ├── sphere.js       # Sphere burst pattern
    ├── tunnel.js       # Tunnel vision pattern
    ├── moire.js        # 3D moiré pattern
    └── tornado.js      # Tornado pattern
```

## Adding New Patterns

1. Create a new file in `patterns/` (e.g., `mypattern.js`)
2. Implement pattern class:

```javascript
class MyPattern {
    constructor() {
        this.name = "My Pattern";
    }
    
    generate(count, params) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Generate particle data
        // params: time, spread, complexity, size, blackWhite
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = x;     // X position
            positions[i * 3 + 1] = y; // Y position
            positions[i * 3 + 2] = z; // Z position
            
            colors[i * 3] = r;        // Red (0-1)
            colors[i * 3 + 1] = g;    // Green (0-1)
            colors[i * 3 + 2] = b;    // Blue (0-1)
            
            sizes[i] = size;          // Particle size
        }
        
        return { positions, colors, sizes };
    }
}
```

3. Add script tag to `index.html`
4. Register in `sketch.js`: `patterns.mypattern = new MyPattern();`
5. Add option to pattern selector

## Usage

1. Visit the [live demo](https://raymassie.github.io/opArt-particles/) or open `index.html` locally
2. Select pattern from dropdown
3. Adjust parameters with sliders
4. Click + drag to rotate view
5. Scroll to zoom
6. Click **Randomize** for instant variations
7. Click **Save Image** to export PNG
8. Click **Record Video** to capture animations

## Performance Tips

- Lower particle count for smoother performance on slower hardware
- Disable auto-rotate when manually controlling camera
- Some patterns (Wave, Moiré) are more computationally intensive
- Close other browser tabs for best performance

## Browser Requirements

- Modern browser with WebGL 2.0 support
- Chrome, Firefox, Safari, Edge (recent versions)
- GPU acceleration recommended

## License

Free to use and modify.

