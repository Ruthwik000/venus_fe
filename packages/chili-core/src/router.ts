// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

export interface RouteParams {
    [key: string]: string;
}

export interface RouteMatch {
    params: RouteParams;
    query: URLSearchParams;
    path: string;
}

export type RouteHandler = (match: RouteMatch) => void | Promise<void>;

export interface Route {
    path: string;
    handler: RouteHandler;
    pattern: RegExp;
    paramNames: string[];
}

export interface IRouter {
    addRoute(path: string, handler: RouteHandler): void;
    navigate(path: string, state?: unknown): void;
    back(): void;
    forward(): void;
    getCurrentPath(): string;
    start(): void;
    stop(): void;
}

export class Router implements IRouter {
    private routes: Route[] = [];
    private isStarted = false;

    constructor() {
        this.handlePopState = this.handlePopState.bind(this);
    }

    addRoute(path: string, handler: RouteHandler): void {
        const { pattern, paramNames } = this.pathToRegex(path);
        this.routes.push({
            path,
            handler,
            pattern,
            paramNames,
        });
    }

    navigate(path: string, state?: unknown): void {
        window.history.pushState(state, "", path);
        this.handleRoute(path);
    }

    back(): void {
        window.history.back();
    }

    forward(): void {
        window.history.forward();
    }

    getCurrentPath(): string {
        return window.location.pathname + window.location.search;
    }

    start(): void {
        if (this.isStarted) return;
        this.isStarted = true;
        window.addEventListener("popstate", this.handlePopState);
        this.handleRoute(this.getCurrentPath());
    }

    stop(): void {
        if (!this.isStarted) return;
        this.isStarted = false;
        window.removeEventListener("popstate", this.handlePopState);
    }

    private handlePopState(): void {
        this.handleRoute(this.getCurrentPath());
    }

    private async handleRoute(fullPath: string): Promise<void> {
        const [pathname, search] = fullPath.split("?");
        const query = new URLSearchParams(search || "");

        for (const route of this.routes) {
            const match = pathname.match(route.pattern);
            if (match) {
                const params: RouteParams = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });

                await route.handler({
                    params,
                    query,
                    path: pathname,
                });
                return;
            }
        }

        // No route matched - could handle 404 here
        console.warn(`No route matched for path: ${pathname}`);
    }

    private pathToRegex(path: string): { pattern: RegExp; paramNames: string[] } {
        const paramNames: string[] = [];
        const pattern = path
            .replace(/\//g, "\\/")
            .replace(/:(\w+)/g, (_, paramName) => {
                paramNames.push(paramName);
                return "([^\\/]+)";
            })
            .replace(/\*/g, ".*");

        return {
            pattern: new RegExp(`^${pattern}$`),
            paramNames,
        };
    }
}
