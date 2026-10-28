import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const PAGE_FADE = "page-fade";

export const getRouter = () =>
  createRouter({
    routeTree,
    context: {},

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultViewTransition: { types: ({ pathChanged }) => (pathChanged ? [PAGE_FADE] : false) },
  });
