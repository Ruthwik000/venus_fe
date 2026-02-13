// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";

export function renderLanding(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "height: 100vh; overflow-y: auto; overflow-x: hidden;";

    const page = document.createElement("div");
    page.className = "landing-page";
    page.innerHTML = `
        <div class="synthetic-hero">
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
        </div>

        <section class="features-section">
            <div class="features-container">
                <div class="features-section-header">
                    <span class="section-badge">CAPABILITIES</span>
                    <h2 class="section-title">Powerful Features for Modern Design</h2>
                    <p class="section-description">Everything you need to create professional 3D models</p>
                </div>

                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                <path d="M8 10h.01"/>
                                <path d="M12 10h.01"/>
                                <path d="M16 10h.01"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">AI Prompt to 3D Model</h3>
                        <p class="feature-description">Transform text descriptions into 3D models instantly with AI-powered generation</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">Parametric Modeling</h3>
                        <p class="feature-description">Create intelligent models with constraints and relationships that update automatically</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">Real-Time Collaboration</h3>
                        <p class="feature-description">Work together with your team in real-time with instant synchronization</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">WebAssembly Powered</h3>
                        <p class="feature-description">Native performance in the browser with OpenCascade technology</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">Import & Export</h3>
                        <p class="feature-description">Support for STEP, IGES, STL, and other industry-standard formats</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">Advanced Boolean Operations</h3>
                        <p class="feature-description">Combine, subtract, and intersect shapes with precision</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="testimonials-section">
            <div class="testimonials-container">
                <div class="features-section-header">
                    <span class="section-badge">TESTIMONIALS</span>
                    <h2 class="section-title">Trusted by Design Professionals</h2>
                    <p class="section-description">See what our users have to say</p>
                </div>

                <div class="testimonials-track-wrapper">
                    <div class="testimonials-track" id="testimonials-track">
                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"Venus has transformed how we approach 3D modeling. The parametric engine is incredibly powerful and the real-time collaboration features are game-changing."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">SM</div>
                                <div class="author-info">
                                    <div class="author-name">Sarah Mitchell</div>
                                    <div class="author-role">Lead Designer, TechCorp</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"The WebAssembly performance is outstanding. We can handle complex assemblies that would crash other browser-based CAD tools. Highly recommended!"</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">JC</div>
                                <div class="author-info">
                                    <div class="author-name">James Chen</div>
                                    <div class="author-role">Engineering Manager, AutoDesign</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"Finally, a CAD tool that works seamlessly in the browser. The cloud storage and collaboration features make remote work effortless."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">EP</div>
                                <div class="author-info">
                                    <div class="author-name">Emily Parker</div>
                                    <div class="author-role">Product Designer, InnovateLab</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"The parametric modeling capabilities are on par with desktop applications. Venus has become an essential tool in our design workflow."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">MR</div>
                                <div class="author-info">
                                    <div class="author-name">Michael Rodriguez</div>
                                    <div class="author-role">Senior CAD Engineer, BuildTech</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"Impressive performance and intuitive interface. The import/export functionality works flawlessly with our existing workflows."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">LW</div>
                                <div class="author-info">
                                    <div class="author-name">Lisa Wang</div>
                                    <div class="author-role">Design Director, FutureMake</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"Venus has transformed how we approach 3D modeling. The parametric engine is incredibly powerful and the real-time collaboration features are game-changing."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">SM</div>
                                <div class="author-info">
                                    <div class="author-name">Sarah Mitchell</div>
                                    <div class="author-role">Lead Designer, TechCorp</div>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-card">
                            <div class="testimonial-stars">★★★★★</div>
                            <p class="testimonial-text">"The WebAssembly performance is outstanding. We can handle complex assemblies that would crash other browser-based CAD tools. Highly recommended!"</p>
                            <div class="testimonial-author">
                                <div class="author-avatar">JC</div>
                                <div class="author-info">
                                    <div class="author-name">James Chen</div>
                                    <div class="author-role">Engineering Manager, AutoDesign</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    container.appendChild(page);

    // Initialize shader background
    initShaderBackground();

    // Add animations
    animateHeroElements();

    // Initialize testimonials carousel
    initTestimonialsCarousel();

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

function initTestimonialsCarousel(): void {
    const track = document.getElementById("testimonials-track");
    if (!track) return;

    const cards = track.querySelectorAll(".testimonial-card");
    const cardWidth = 400; // Card width + gap
    const totalWidth = cardWidth * (cards.length / 2); // Half because we duplicated

    let position = 0;
    const speed = 0.5; // Pixels per frame

    function animate() {
        position -= speed;

        // Reset position when we've scrolled through half the cards (original set)
        if (Math.abs(position) >= totalWidth) {
            position = 0;
        }

        track.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
    }

    animate();

    // Pause on hover
    track.addEventListener("mouseenter", () => {
        track.style.animationPlayState = "paused";
    });

    track.addEventListener("mouseleave", () => {
        track.style.animationPlayState = "running";
    });
}
