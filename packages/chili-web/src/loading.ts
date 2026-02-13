// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

export class Loading extends HTMLElement {
    constructor() {
        super();
        this.initContainer();
        this.initAnimation();
        this.style.cssText = `
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
        `;
    }

    private initContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            padding: 48px;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.98));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;

        // Create spinner with multiple rings for depth
        const spinnerContainer = document.createElement("div");
        spinnerContainer.style.cssText = `
            position: relative;
            width: 80px;
            height: 80px;
        `;

        // Outer ring
        const outerRing = document.createElement("div");
        outerRing.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid rgba(16, 185, 129, 0.1);
            border-top-color: #10B981;
            animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        `;

        // Middle ring
        const middleRing = document.createElement("div");
        middleRing.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid rgba(16, 185, 129, 0.2);
            border-top-color: #059669;
            animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
        `;

        // Inner ring
        const innerRing = document.createElement("div");
        innerRing.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid rgba(16, 185, 129, 0.3);
            border-top-color: #10B981;
            animation: spin 0.8s linear infinite;
        `;

        // Center dot
        const centerDot = document.createElement("div");
        centerDot.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10B981, #059669);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
            animation: pulse 1.5s ease-in-out infinite;
        `;

        spinnerContainer.appendChild(outerRing);
        spinnerContainer.appendChild(middleRing);
        spinnerContainer.appendChild(innerRing);
        spinnerContainer.appendChild(centerDot);

        // Create label
        const label = document.createElement("div");
        label.innerText = "Loading...";
        label.style.cssText = `
            color: #fff;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 0.5px;
            animation: fadeInOut 2s ease-in-out infinite;
        `;

        // Create progress dots
        const dotsContainer = document.createElement("div");
        dotsContainer.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("div");
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10B981;
                animation: bounce 1.4s ease-in-out ${i * 0.2}s infinite;
            `;
            dotsContainer.appendChild(dot);
        }

        container.appendChild(spinnerContainer);
        container.appendChild(label);
        container.appendChild(dotsContainer);
        this.appendChild(container);
    }

    private initAnimation() {
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.8;
                }
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes bounce {
                0%, 80%, 100% { 
                    transform: translateY(0);
                }
                40% { 
                    transform: translateY(-12px);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

customElements.define("chili-loading", Loading);
