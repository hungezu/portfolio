import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env | undefined, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const projectRouteMatch = url.pathname.match(/^\/portfolio\/project\/([^/]+)\/?$/);
    const isPortfolioRoute =
      url.pathname === "/" ||
      url.pathname === "/index.html" ||
      url.pathname === "/portfolio" ||
      url.pathname === "/portfolio/";
    const servesPortfolioShell = isPortfolioRoute || Boolean(projectRouteMatch);

    if (!env?.ASSETS) {
      if (servesPortfolioShell) {
        const fallbackUrl = new URL("/portfolio.html", request.url);
        if (projectRouteMatch) fallbackUrl.searchParams.set("project", projectRouteMatch[1]);
        return Response.redirect(fallbackUrl, 302);
      }
      return handler.fetch(request, env, ctx);
    }

    if (servesPortfolioShell) {
      const assetUrl = new URL("/portfolio.html", request.url);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      const html = await response.text();
      const socialImageUrl = new URL("/og.png", request.url).toString();

      return new Response(
        html.replaceAll("https://portfolio.local/og.png", socialImageUrl),
        {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            "content-type": "text/html; charset=utf-8",
          },
        },
      );
    }

    const staticResponse = await env.ASSETS.fetch(request);
    if (staticResponse.status !== 404) {
      return staticResponse;
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
