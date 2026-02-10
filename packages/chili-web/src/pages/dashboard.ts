// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { authService, type IApplication, type IRouter, type ProjectData, projectService } from "chili-core";

export function renderDashboard(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const username = localStorage.getItem("username") || "User";

    const page = document.createElement("div");
    page.className = "modern-dashboard";
    page.innerHTML = `
        <!-- Sidebar -->
        <aside class="modern-sidebar">
            <div class="sidebar-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Venus</span>
            </div>
            
            <nav class="sidebar-menu">
                <a href="#" class="menu-item active">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Overview</span>
                </a>
                <a href="#" class="menu-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Projects</span>
                </a>
                <a href="#" class="menu-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Team</span>
                </a>
                <a href="#" class="menu-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                </a>
            </nav>
            
            <button id="logout-btn" class="sidebar-logout">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
            </button>
        </aside>

        <!-- Main Content -->
        <main class="modern-main">
            <!-- Header -->
            <header class="modern-header">
                <div class="header-left">
                    <h1>Welcome back, ${username}</h1>
                    <p>Here's what's happening with your projects</p>
                </div>
                <div class="header-right">
                    <button class="header-icon-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <div class="header-user">
                        <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                        <span>${username}</span>
                    </div>
                </div>
            </header>

            <!-- Stats Grid -->
            <div class="stats-container">
                <div class="stat-glass-card">
                    <div class="stat-header">
                        <span class="stat-label">Total Projects</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div class="stat-value" id="total-projects-count">--</div>
                    <div class="stat-trend positive" id="projects-trend"></div>
                </div>

                <div class="stat-glass-card">
                    <div class="stat-header">
                        <span class="stat-label">Active Hours</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-value">--</div>
                    <div class="stat-trend neutral">--</div>
                </div>

                <div class="stat-glass-card">
                    <div class="stat-header">
                        <span class="stat-label">Storage Used</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <div class="stat-value">--</div>
                    <div class="stat-trend positive">--</div>
                </div>
            </div>

            <!-- Projects Section -->
            <div class="section-header-modern">
                <h2>Recent Projects</h2>
                <button id="new-project" class="btn-modern-primary">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </button>
            </div>

            <div class="projects-modern-grid" id="projects-grid">
                <!-- Projects will be loaded dynamically -->
                <div class="project-glass-card" style="display:flex;align-items:center;justify-content:center;min-height:150px;">
                    <p style="color:#888;">Loading projects...</p>
                </div>
            </div>
        </main>
    `;

    container.appendChild(page);

    // ─── Event handlers ─────────────────────────────────────────────────

    document.getElementById("logout-btn")?.addEventListener("click", async () => {
        try {
            await authService.signOutUser();
            router.navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to logout. Please try again.");
        }
    });

    document.getElementById("new-project")?.addEventListener("click", async () => {
        try {
            const projectName = prompt("Enter project name:", `Project-${Date.now()}`);
            if (!projectName) return;

            // Create project in Firestore — generates a session ID
            const project = await projectService.createProject(projectName);

            // Store the session ID so editor & AI chat can use it
            localStorage.setItem("currentSessionId", project.sessionId);
            localStorage.setItem("currentProjectName", project.projectName);

            // Navigate to editor with session ID in URL
            router.navigate(`/editor?sessionId=${project.sessionId}`);
        } catch (error) {
            console.error("Failed to create project:", error);
            alert("Failed to create project. Please try again.");
        }
    });

    // ─── Load real projects from Firestore ──────────────────────────────
    loadProjects(router);
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

async function loadProjects(router: IRouter): Promise<void> {
    const grid = document.getElementById("projects-grid");
    const countEl = document.getElementById("total-projects-count");

    try {
        const projects = await projectService.getProjects();

        if (countEl) countEl.textContent = String(projects.length);

        if (!grid) return;

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="project-glass-card" style="display:flex;align-items:center;justify-content:center;min-height:150px;cursor:default;">
                    <div style="text-align:center;color:#888;">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin:0 auto 12px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <p>No projects yet. Click "New Project" to get started.</p>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = "";

        for (const project of projects) {
            const card = document.createElement("div");
            card.className = "project-glass-card";
            card.innerHTML = `
                <div class="project-preview">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div class="project-info-modern">
                    <h3>${escapeHtml(project.projectName)}</h3>
                    <p class="project-time">Updated ${formatTimeAgo(project.lastModified)}</p>
                    <div class="project-tags">
                        <span class="tag-modern">${project.fileUrl ? "Saved" : "New"}</span>
                    </div>
                </div>
                <button class="project-delete-btn" data-session-id="${project.sessionId}" title="Delete project" style="position:absolute;top:8px;right:8px;background:rgba(255,60,60,0.15);border:none;color:#ff4444;border-radius:6px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">
                    ✕
                </button>
            `;
            card.style.position = "relative";

            // Click card → open project in editor
            card.addEventListener("click", (e) => {
                // Don't navigate if clicking the delete button
                if ((e.target as HTMLElement).closest(".project-delete-btn")) return;

                localStorage.setItem("currentSessionId", project.sessionId);
                localStorage.setItem("currentProjectName", project.projectName);
                router.navigate(`/editor?sessionId=${project.sessionId}`);
            });

            // Delete button
            const deleteBtn = card.querySelector(".project-delete-btn");
            deleteBtn?.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (!confirm(`Delete project "${project.projectName}"?`)) return;
                try {
                    await projectService.deleteProject(project.sessionId);
                    card.remove();
                    // Update count
                    const remaining = document.querySelectorAll(".project-glass-card").length;
                    if (countEl) countEl.textContent = String(remaining);
                } catch (err) {
                    console.error("Failed to delete project:", err);
                    alert("Failed to delete project.");
                }
            });

            grid.appendChild(card);
        }
    } catch (error) {
        console.error("Failed to load projects:", error);
        if (grid) {
            grid.innerHTML = `
                <div class="project-glass-card" style="display:flex;align-items:center;justify-content:center;min-height:150px;">
                    <p style="color:#ff4444;">Failed to load projects. Please try again.</p>
                </div>
            `;
        }
    }
}

function escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
