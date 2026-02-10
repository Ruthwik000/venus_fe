// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";

export function renderLanding(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const page = document.createElement("div");
    page.className = "landing-page-hero";
    page.innerHTML = `
        <!-- Navbar -->
        <nav class="hero-navbar">
            <div class="hero-nav-container">
                <div class="hero-nav-left">
                    <span class="hero-brand">Venus</span>
                </div>
                <div class="hero-nav-right">
                    <button id="hero-login-btn" class="hero-nav-link">Sign In</button>
                    <button id="hero-signup-btn" class="hero-btn-primary">Start Free Trial</button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="hero-content-wrapper">
            <div class="hero-background">
                <canvas id="spline-canvas"></canvas>
                <div class="hero-gradient-overlay"></div>
            </div>
            
            <div class="hero-content">
                <div class="hero-text-container">
                    <h1 class="hero-title">
                        Design the Future with<br />
                        Professional 3D CAD
                    </h1>
                    <p class="hero-description">
                        Professional-grade 3D modeling powered by OpenCascade and WebAssembly.<br />
                        Create complex geometries, parametric designs, and engineering-ready models—all in your browser.
                    </p>
                    <div class="hero-buttons">
                        <button id="hero-cta-trial" class="hero-btn-cta">Start Free Trial</button>
                        <button id="hero-cta-demo" class="hero-btn-secondary">
                            <svg class="hero-play-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                            Watch Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Screenshot Section -->
        <div class="hero-screenshot-section">
            <div class="hero-screenshot-container">
                <img 
                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1920&h=1080&fit=crop&q=80" 
                    alt="Venus Interface" 
                    class="hero-screenshot"
                />
            </div>
        </div>

        <!-- Features Section -->
        <div class="hero-features-section">
            <div class="hero-features-grid">
                <div class="hero-feature-card">
                    <div class="hero-feature-icon">�</div>
                    <h3>Parametric Modeling</h3>
                    <p>Create intelligent, constraint-based models that update automatically when parameters change</p>
                </div>
                <div class="hero-feature-card">
                    <div class="hero-feature-icon">⚡</div>
                    <h3>WebAssembly Powered</h3>
                    <p>Desktop-class performance with OpenCascade technology running natively in your browser</p>
                </div>
                <div class="hero-feature-card">
                    <div class="hero-feature-icon">☁️</div>
                    <h3>Cloud Collaboration</h3>
                    <p>Work together in real-time, share designs, and access your projects from anywhere</p>
                </div>
            </div>
        </div>
    `;

    container.appendChild(page);

    // Initialize Spline background
    initSplineBackground();

    // Event handlers
    document.getElementById("hero-login-btn")?.addEventListener("click", () => {
        router.navigate("/login");
    });

    document.getElementById("hero-signup-btn")?.addEventListener("click", () => {
        router.navigate("/signup");
    });

    document.getElementById("hero-cta-trial")?.addEventListener("click", () => {
        router.navigate("/signup");
    });

    document.getElementById("hero-cta-demo")?.addEventListener("click", () => {
        router.navigate("/login");
    });
}

function initSplineBackground(): void {
    const canvas = document.getElementById("spline-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    // Use dynamic import for Spline
    import("@splinetool/runtime")
        .then((module) => {
            const spline = new module.Application(canvas);
            spline.load("https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode");
        })
        .catch((error) => {
            console.error("Failed to load Spline scene:", error);
            // Fallback to particle background if Spline fails
            initFallbackBackground();
        });
}

function initFallbackBackground(): void {
    const canvas = document.getElementById("spline-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle system
    const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            size: Math.random() * 4 + 1.5,
        });
    }

    // Animation loop
    function animate() {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            // Draw particle
            ctx.fillStyle = "rgba(130, 0, 219, 0.6)";
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach((p2) => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 180) {
                    ctx.strokeStyle = `rgba(130, 0, 219, ${0.25 * (1 - distance / 180)})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();
}
