import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { pageTransitionTypes } from "./routes/-components/rule-art";

export const getRouter = () =>
  createRouter({
    routeTree,
    context: {},

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultViewTransition: { types: pageTransitionTypes },
  });
