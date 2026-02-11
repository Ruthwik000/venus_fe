// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";

export function renderLanding(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const page = document.createElement("div");
    page.className = "synthetic-hero";
    page.innerHTML = `
        <canvas id="shader-canvas" class="shader-canvas"></canvas>
        
        <div class="hero-content-center">
            <div class="hero-badge">
                <span class="badge-label">EXPERIENCE</span>
                <span class="badge-dot"></span>
                <span class="badge-text">Venus</span>
            </div>
            
            <h1 class="hero-title">
                <span class="title-line">Design the Future with</span>
                <span class="title-line">Professional 3D Modeling</span>
            </h1>
            
            <p class="hero-description">
                Experience next-generation CAD powered by OpenCascade and WebAssembly.<br />
                Create complex geometries, parametric designs, and engineering-ready models—all in your browser.
            </p>
            
            <div class="hero-cta-buttons">
                <button id="hero-signup-btn" class="hero-btn-primary">Start Free Trial</button>
                <button id="hero-login-btn" class="hero-btn-outline">Sign In</button>
            </div>
            
            <ul class="hero-micro-details">
                <li><span class="micro-dot"></span>Parametric modeling engine</li>
                <li><span class="micro-dot"></span>Real-time collaboration</li>
                <li><span class="micro-dot"></span>Cloud-native architecture</li>
            </ul>
        </div>
    `;

    container.appendChild(page);

    // Initialize shader background
    initShaderBackground();

    // Add animations
    animateHeroElements();

    // Event handlers
    document.getElementById("hero-signup-btn")?.addEventListener("click", () => {
        router.navigate("/signup");
    });

    document.getElementById("hero-login-btn")?.addEventListener("click", () => {
        router.navigate("/login");
    });
}

function initShaderBackground(): void {
    const canvas = document.getElementById("shader-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Vertex shader
    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // Fragment shader with animated pattern
    const fragmentShaderSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;

        vec2 toPolar(vec2 p) {
            float r = length(p);
            float a = atan(p.y, p.x);
            return vec2(r, a);
        }

        void main() {
            vec2 p = 6.0 * ((gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y);
            vec2 polar = toPolar(p);
            float r = polar.x;
            
            vec2 i = p;
            float c = 0.0;
            float rot = r + u_time + p.x * 0.1;
            
            for (float n = 0.0; n < 4.0; n++) {
                float rr = r + 0.15 * sin(u_time * 0.7 + n + r * 2.0);
                p *= mat2(cos(rot - sin(u_time / 10.0)), sin(rot),
                         -sin(cos(rot) - u_time / 10.0), cos(rot)) * -0.25;
                float t = r - u_time / (n + 30.0);
                i -= p + sin(t - i.y) + rr;
                c += 2.2 / length(vec2((sin(i.x + t) / 0.15), (cos(i.y + t) / 0.15)));
            }
            
            c /= 8.0;
            vec3 baseColor = vec3(0.2, 0.7, 0.5);
            vec3 finalColor = baseColor * smoothstep(0.0, 1.0, c * 0.6);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // Animation loop
    const startTime = Date.now();
    function render() {
        const currentTime = (Date.now() - startTime) * 0.001 * 0.5;

        gl.uniform1f(timeLocation, currentTime);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render();
}

function animateHeroElements(): void {
    // Animate badge
    const badge = document.querySelector(".hero-badge") as HTMLElement;
    if (badge) {
        badge.style.opacity = "0";
        badge.style.transform = "translateY(-8px)";
        setTimeout(() => {
            badge.style.transition = "all 0.5s ease-out";
            badge.style.opacity = "1";
            badge.style.transform = "translateY(0)";
        }, 100);
    }

    // Animate title lines
    const titleLines = document.querySelectorAll(".title-line");
    titleLines.forEach((line, index) => {
        const el = line as HTMLElement;
        el.style.opacity = "0";
        el.style.transform = "translateY(24px) scale(1.04)";
        el.style.filter = "blur(16px)";
        setTimeout(
            () => {
                el.style.transition = "all 0.9s ease-out";
                el.style.opacity = "1";
                el.style.transform = "translateY(0) scale(1)";
                el.style.filter = "blur(0)";
            },
            200 + index * 120,
        );
    });

    // Animate description
    const description = document.querySelector(".hero-description") as HTMLElement;
    if (description) {
        description.style.opacity = "0";
        description.style.transform = "translateY(8px)";
        setTimeout(() => {
            description.style.transition = "all 0.5s ease-out";
            description.style.opacity = "1";
            description.style.transform = "translateY(0)";
        }, 600);
    }

    // Animate buttons
    const buttons = document.querySelector(".hero-cta-buttons") as HTMLElement;
    if (buttons) {
        buttons.style.opacity = "0";
        buttons.style.transform = "translateY(8px)";
        setTimeout(() => {
            buttons.style.transition = "all 0.5s ease-out";
            buttons.style.opacity = "1";
            buttons.style.transform = "translateY(0)";
        }, 750);
    }

    // Animate micro details
    const microItems = document.querySelectorAll(".hero-micro-details li");
    microItems.forEach((item, index) => {
        const el = item as HTMLElement;
        el.style.opacity = "0";
        el.style.transform = "translateY(6px)";
        setTimeout(
            () => {
                el.style.transition = "all 0.5s ease-out";
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            },
            900 + index * 100,
        );
    });
}
