import type { TestProject } from "vite-plus/test/node";
import { builtRoutes, serveSite, SITE_ROOT } from "../site";

export default async function setup(project: TestProject) {
  const routes = builtRoutes();
  const site = await serveSite(SITE_ROOT);
  project.provide("baseURL", site.url);
  project.provide("routes", routes);
  return site.close;
}

declare module "vitest" {
  export interface ProvidedContext {
    baseURL: string;
    routes: string[];
  }
}
