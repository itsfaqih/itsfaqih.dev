import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

/** The view transition every navigation to another page plays unless its link brings its own
 * (see `page-fade` in arcade.css). Hash and search changes stay on the page, so they skip it. */
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
