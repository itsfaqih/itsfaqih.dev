import * as stylex from "@stylexjs/stylex";

/** Static utility styles compiled from the former utility classes. */
export const utilityStyles = stylex.create({
  "-ml-px": {
    "marginLeft": "-1px"
  },
  "-mt-px": {
    "marginTop": "-1px"
  },
  "-mx-4": {
    "marginInline": "calc(.25rem * -4)"
  },
  "align-bottom": {
    "verticalAlign": "bottom"
  },
  "animate-fade-in": {
    "animation": "fade-in .4s ease-out forwards"
  },
  "appearance-none": {
    "appearance": "none"
  },
  "bg-(--card-bg)": {
    "backgroundColor": "var(--card-bg)"
  },
  "bg-accent": {
    "backgroundColor": "var(--accent)"
  },
  "bg-background": {
    "backgroundColor": "var(--background)"
  },
  "bg-black": {
    "backgroundColor": "#000"
  },
  "bg-border": {
    "backgroundColor": "var(--border)"
  },
  "bg-brand": {
    "backgroundColor": "var(--brand)"
  },
  "bg-card": {
    "backgroundColor": "var(--card)"
  },
  "bg-foreground": {
    "backgroundColor": "var(--foreground)"
  },
  "bg-gray-300": {
    "backgroundColor": "oklch(87.2% .01 258.338)"
  },
  "bg-muted": {
    "backgroundColor": "var(--muted)"
  },
  "bg-none": {
    "backgroundImage": "none"
  },
  "bg-popover": {
    "backgroundColor": "var(--popover)"
  },
  "bg-white": {
    "backgroundColor": "#fff"
  },
  "bg-zinc-100": {
    "backgroundColor": "oklch(96.7% .001 286.375)"
  },
  "bg-zinc-200": {
    "backgroundColor": "oklch(92% .004 286.32)"
  },
  "bg-zinc-300": {
    "backgroundColor": "oklch(87.1% .006 286.286)"
  },
  "bg-zinc-50": {
    "backgroundColor": "oklch(98.5% 0 none)"
  },
  "bg-zinc-700": {
    "backgroundColor": "oklch(37% .013 285.805)"
  },
  "block": {
    "display": "block"
  },
  "border-border": {
    "borderColor": "var(--border)"
  },
  "border-muted-foreground": {
    "borderColor": "var(--muted-foreground)"
  },
  "border-negative": {
    "borderColor": "var(--negative)"
  },
  "border-zinc-200": {
    "borderColor": "oklch(92% .004 286.32)"
  },
  "border-zinc-300": {
    "borderColor": "oklch(87.1% .006 286.286)"
  },
  "border-zinc-700": {
    "borderColor": "oklch(37% .013 285.805)"
  },
  "bottom-0": {
    "bottom": "0"
  },
  "bottom-6": {
    "bottom": "calc(.25rem * 6)"
  },
  "col-end-1": {
    "gridColumnEnd": "1"
  },
  "container": {
    "@media (width>=40rem)": {
      "maxWidth": "40rem"
    },
    "@media (width>=48rem)": {
      "maxWidth": "48rem"
    },
    "@media (width>=64rem)": {
      "maxWidth": "64rem"
    },
    "@media (width>=80rem)": {
      "maxWidth": "80rem"
    },
    "@media (width>=96rem)": {
      "maxWidth": "96rem"
    },
    "width": "100%"
  },
  "decoration-border": {
    "textDecorationColor": "var(--border)",
    "WebkitextDecorationColor": "var(--border)"
  },
  "decoration-zinc-400": {
    "textDecorationColor": "oklch(70.5% .015 286.067)",
    "WebkitextDecorationColor": "oklch(70.5% .015 286.067)"
  },

  "fill-background": {
    "fill": "var(--background)"
  },
  "fill-foreground": {
    "fill": "var(--foreground)"
  },
  "fill-muted-foreground": {
    "fill": "var(--muted-foreground)"
  },
  "fixed": {
    "position": "fixed"
  },
  "flex": {
    "display": "flex"
  },
  "flex-1": {
    "flex": "1"
  },
  "flex-col": {
    "flexDirection": "column"
  },
  "flex-wrap": {
    "flexWrap": "wrap"
  },
  "font-mono": {
    "fontFamily": "\"Geist Mono\", ui-monospace, monospace"
  },
  "gap-0": {
    "gap": "0"
  },
  "gap-0.5": {
    "gap": "calc(.25rem * .5)"
  },
  "gap-1": {
    "gap": ".25rem"
  },
  "gap-1.5": {
    "gap": "calc(.25rem * 1.5)"
  },
  "gap-12": {
    "gap": "calc(.25rem * 12)"
  },
  "gap-2": {
    "gap": "calc(.25rem * 2)"
  },
  "gap-3": {
    "gap": "calc(.25rem * 3)"
  },
  "gap-4": {
    "gap": "calc(.25rem * 4)"
  },
  "gap-6": {
    "gap": "calc(.25rem * 6)"
  },
  "gap-8": {
    "gap": "calc(.25rem * 8)"
  },
  "grid": {
    "display": "grid"
  },

  "h-1.5": {
    "height": "calc(.25rem * 1.5)"
  },
  "h-1/4": {
    "height": "25%"
  },
  "h-1/5": {
    "height": "20%"
  },
  "h-12": {
    "height": "calc(.25rem * 12)"
  },
  "h-16": {
    "height": "calc(.25rem * 16)"
  },
  "h-2": {
    "height": "calc(.25rem * 2)"
  },
  "h-24": {
    "height": "calc(.25rem * 24)"
  },
  "h-4": {
    "height": "calc(.25rem * 4)"
  },
  "h-48": {
    "height": "calc(.25rem * 48)"
  },
  "h-5": {
    "height": "calc(.25rem * 5)"
  },
  "h-6": {
    "height": "calc(.25rem * 6)"
  },
  "h-8.5": {
    "height": "calc(.25rem * 8.5)"
  },
  "h-9": {
    "height": "calc(.25rem * 9)"
  },
  "h-auto": {
    "height": "auto"
  },
  "h-full": {
    "height": "100%"
  },
  "h-px": {
    "height": "1px"
  },
  "hidden": {
    "display": "none"
  },
  "hover:bg-accent": {
    ":hover": {
      "@media (hover:hover)": {
        "backgroundColor": "var(--accent)"
      }
    }
  },
  "hover:bg-border": {
    ":hover": {
      "@media (hover:hover)": {
        "backgroundColor": "var(--border)"
      }
    }
  },
  "hover:bg-muted": {
    ":hover": {
      "@media (hover:hover)": {
        "backgroundColor": "var(--muted)"
      }
    }
  },
  "hover:bg-zinc-600": {
    ":hover": {
      "@media (hover:hover)": {
        "backgroundColor": "oklch(44.2% .017 285.786)"
      }
    }
  },
  "hover:bg-zinc-700": {
    ":hover": {
      "@media (hover:hover)": {
        "backgroundColor": "oklch(37% .013 285.805)"
      }
    }
  },
  "hover:border-border": {
    ":hover": {
      "@media (hover:hover)": {
        "borderColor": "var(--border)"
      }
    }
  },
  "hover:border-muted-foreground": {
    ":hover": {
      "@media (hover:hover)": {
        "borderColor": "var(--muted-foreground)"
      }
    }
  },
  "hover:opacity-100": {
    ":hover": {
      "@media (hover:hover)": {
        "opacity": "1"
      }
    }
  },
  "hover:text-foreground": {
    ":hover": {
      "@media (hover:hover)": {
        "color": "var(--foreground)"
      }
    }
  },
  "hover:text-red-500": {
    ":hover": {
      "@media (hover:hover)": {
        "color": "oklch(63.7% .237 25.331)"
      }
    }
  },
  "hover:text-white": {
    ":hover": {
      "@media (hover:hover)": {
        "color": "#fff"
      }
    }
  },
  "hover:underline": {
    ":hover": {
      "@media (hover:hover)": {
        "textDecorationLine": "underline"
      }
    }
  },
  "hover:z-10": {
    ":hover": {
      "@media (hover:hover)": {
        "zIndex": "10"
      }
    }
  },
  "hover:z-20": {
    ":hover": {
      "@media (hover:hover)": {
        "zIndex": "20"
      }
    }
  },
  "inline": {
    "display": "inline"
  },
  "inline-block": {
    "display": "inline-block"
  },
  "inline-flex": {
    "display": "inline-flex"
  },
  "italic": {
    "fontStyle": "italic"
  },
  "left-0": {
    "left": "0"
  },
  "left-1/2": {
    "left": "50%"
  },
  "left-3": {
    "left": "calc(.25rem * 3)"
  },
  "lg:block": {
    "@media (width>=64rem)": {
      "display": "block"
    }
  },
  "lg:grid": {
    "@media (width>=64rem)": {
      "display": "grid"
    }
  },
  "lg:hidden": {
    "@media (width>=64rem)": {
      "display": "none"
    }
  },
  "lg:py-1.5": {
    "@media (width>=64rem)": {
      "paddingBlock": "calc(.25rem * 1.5)"
    }
  },
  "line-clamp-1": {
    "display": "-webkit-box",
    "overflow": "hidden",
    "WebkitineClamp": "1",
    "WebkitoxOrient": "vertical"
  },
  "line-clamp-2": {
    "display": "-webkit-box",
    "overflow": "hidden",
    "WebkitineClamp": "2",
    "WebkitoxOrient": "vertical"
  },
  "m-0": {
    "margin": "0"
  },
  "max-w-2xl": {
    "maxWidth": "42rem"
  },
  "max-w-3xl": {
    "maxWidth": "48rem"
  },
  "max-w-4xl": {
    "maxWidth": "56rem"
  },
  "max-w-5xl": {
    "maxWidth": "64rem"
  },
  "max-w-6xl": {
    "maxWidth": "72rem"
  },
  "max-w-lg": {
    "maxWidth": "32rem"
  },
  "max-w-md": {
    "maxWidth": "28rem"
  },
  "max-w-none": {
    "maxWidth": "none"
  },
  "max-w-xl": {
    "maxWidth": "36rem"
  },
  "mb-1": {
    "marginBottom": ".25rem"
  },
  "mb-12": {
    "marginBottom": "calc(.25rem * 12)"
  },
  "mb-16": {
    "marginBottom": "calc(.25rem * 16)"
  },
  "mb-2": {
    "marginBottom": "calc(.25rem * 2)"
  },
  "mb-20": {
    "marginBottom": "calc(.25rem * 20)"
  },
  "mb-3": {
    "marginBottom": "calc(.25rem * 3)"
  },
  "mb-4": {
    "marginBottom": "calc(.25rem * 4)"
  },
  "mb-6": {
    "marginBottom": "calc(.25rem * 6)"
  },
  "mb-8": {
    "marginBottom": "calc(.25rem * 8)"
  },
  "min-h-0": {
    "minHeight": "0"
  },
  "min-w-0": {
    "minWidth": "0"
  },
  "ml-1": {
    "marginLeft": ".25rem"
  },
  "ml-5": {
    "marginLeft": "calc(.25rem * 5)"
  },
  "mr-2": {
    "marginRight": "calc(.25rem * 2)"
  },
  "mt-0.5": {
    "marginTop": "calc(.25rem * .5)"
  },
  "mt-1": {
    "marginTop": ".25rem"
  },
  "mt-1.5": {
    "marginTop": "calc(.25rem * 1.5)"
  },
  "mt-12": {
    "marginTop": "calc(.25rem * 12)"
  },
  "mt-16": {
    "marginTop": "calc(.25rem * 16)"
  },
  "mt-2": {
    "marginTop": "calc(.25rem * 2)"
  },
  "mt-20": {
    "marginTop": "calc(.25rem * 20)"
  },
  "mt-24": {
    "marginTop": "calc(.25rem * 24)"
  },
  "mt-3": {
    "marginTop": "calc(.25rem * 3)"
  },
  "mt-4": {
    "marginTop": "calc(.25rem * 4)"
  },
  "mt-6": {
    "marginTop": "calc(.25rem * 6)"
  },
  "mt-8": {
    "marginTop": "calc(.25rem * 8)"
  },
  "mx-1": {
    "marginInline": ".25rem"
  },
  "mx-auto": {
    "marginInline": "auto"
  },
  "my-4": {
    "marginBlock": "calc(.25rem * 4)"
  },
  "opacity-0": {
    "opacity": "0"
  },
  "opacity-100": {
    "opacity": "1"
  },
  "opacity-20": {
    "opacity": ".2"
  },
  "opacity-40": {
    "opacity": ".4"
  },
  "opacity-50": {
    "opacity": ".5"
  },
  "opacity-60": {
    "opacity": ".6"
  },
  "opacity-80": {
    "opacity": ".8"
  },
  "origin-bottom": {
    "transformOrigin": "bottom"
  },
  "origin-top": {
    "transformOrigin": "top"
  },
  "overflow-auto": {
    "overflow": "auto"
  },
  "overflow-hidden": {
    "overflow": "hidden"
  },
  "overflow-x-auto": {
    "overflowX": "auto"
  },
  "overflow-x-hidden": {
    "overflowX": "hidden"
  },
  "overflow-y-auto": {
    "overflowY": "auto"
  },
  "p-0": {
    "padding": "0"
  },
  "p-0.5": {
    "padding": "calc(.25rem * .5)"
  },
  "p-1": {
    "padding": ".25rem"
  },
  "p-12": {
    "padding": "calc(.25rem * 12)"
  },
  "p-2": {
    "padding": "calc(.25rem * 2)"
  },
  "p-2.5": {
    "padding": "calc(.25rem * 2.5)"
  },
  "p-3": {
    "padding": "calc(.25rem * 3)"
  },
  "p-4": {
    "padding": "calc(.25rem * 4)"
  },
  "p-5": {
    "padding": "calc(.25rem * 5)"
  },
  "p-6": {
    "padding": "calc(.25rem * 6)"
  },
  "p-8": {
    "padding": "calc(.25rem * 8)"
  },
  "pb-0": {
    "paddingBottom": "0"
  },
  "pb-10": {
    "paddingBottom": "calc(.25rem * 10)"
  },
  "pb-12": {
    "paddingBottom": "calc(.25rem * 12)"
  },
  "pb-20": {
    "paddingBottom": "calc(.25rem * 20)"
  },
  "pb-6": {
    "paddingBottom": "calc(.25rem * 6)"
  },
  "pb-8": {
    "paddingBottom": "calc(.25rem * 8)"
  },
  "pl-2": {
    "paddingLeft": "calc(.25rem * 2)"
  },
  "pl-3": {
    "paddingLeft": "calc(.25rem * 3)"
  },
  "pl-4": {
    "paddingLeft": "calc(.25rem * 4)"
  },
  "pl-9": {
    "paddingLeft": "calc(.25rem * 9)"
  },
  "pl-px": {
    "paddingLeft": "1px"
  },
  "placeholder-muted-foreground": {
    "::placeholder": {
      "color": "var(--muted-foreground)"
    }
  },
  "placeholder:text-muted-foreground": {
    "::placeholder": {
      "color": "var(--muted-foreground)"
    }
  },
  "pr-2": {
    "paddingRight": "calc(.25rem * 2)"
  },
  "pr-3": {
    "paddingRight": "calc(.25rem * 3)"
  },
  "pr-4": {
    "paddingRight": "calc(.25rem * 4)"
  },
  "pt-0.5": {
    "paddingTop": "calc(.25rem * .5)"
  },
  "pt-2": {
    "paddingTop": "calc(.25rem * 2)"
  },
  "pt-3": {
    "paddingTop": "calc(.25rem * 3)"
  },
  "pt-4": {
    "paddingTop": "calc(.25rem * 4)"
  },
  "pt-6": {
    "paddingTop": "calc(.25rem * 6)"
  },
  "pt-8": {
    "paddingTop": "calc(.25rem * 8)"
  },
  "pt-px": {
    "paddingTop": "1px"
  },
  "px-1": {
    "paddingInline": ".25rem"
  },
  "px-1.5": {
    "paddingInline": "calc(.25rem * 1.5)"
  },
  "px-2": {
    "paddingInline": "calc(.25rem * 2)"
  },
  "px-2.5": {
    "paddingInline": "calc(.25rem * 2.5)"
  },
  "px-3": {
    "paddingInline": "calc(.25rem * 3)"
  },
  "px-4": {
    "paddingInline": "calc(.25rem * 4)"
  },
  "px-6": {
    "paddingInline": "calc(.25rem * 6)"
  },
  "px-8": {
    "paddingInline": "calc(.25rem * 8)"
  },
  "py-0.5": {
    "paddingBlock": "calc(.25rem * .5)"
  },
  "py-1": {
    "paddingBlock": ".25rem"
  },
  "py-1.5": {
    "paddingBlock": "calc(.25rem * 1.5)"
  },
  "py-12": {
    "paddingBlock": "calc(.25rem * 12)"
  },
  "py-2": {
    "paddingBlock": "calc(.25rem * 2)"
  },
  "py-2.5": {
    "paddingBlock": "calc(.25rem * 2.5)"
  },
  "py-3": {
    "paddingBlock": "calc(.25rem * 3)"
  },
  "py-8": {
    "paddingBlock": "calc(.25rem * 8)"
  },
  "relative": {
    "position": "relative"
  },
  "right-0": {
    "right": "0"
  },
  "right-3": {
    "right": "calc(.25rem * 3)"
  },
  "right-6": {
    "right": "calc(.25rem * 6)"
  },
  "right-8": {
    "right": "calc(.25rem * 8)"
  },
  "rotate-180": {
    "rotate": "180deg"
  },
  "rotate-20": {
    "rotate": "20deg"
  },
  "rotate-90": {
    "rotate": "90deg"
  },
  "rounded": {
    "borderRadius": "var(--radius)"
  },
  "rounded-2xl": {
    "borderRadius": "1rem"
  },
  "rounded-full": {
    "borderRadius": "2147483647px"
  },
  "rounded-l-none": {
    "borderBottomLeftRadius": "0",
    "borderTopLeftRadius": "0"
  },
  "rounded-lg": {
    "borderRadius": ".5rem"
  },
  "rounded-md": {
    "borderRadius": ".375rem"
  },
  "rounded-r-none": {
    "borderBottomRightRadius": "0",
    "borderTopRightRadius": "0"
  },
  "rounded-xl": {
    "borderRadius": ".75rem"
  },
  "row-end-1": {
    "gridRowEnd": "1"
  },
  "table": {
    "display": "table"
  },
  "text-amber-500": {
    "color": "oklch(76.9% .188 70.08)"
  },
  "text-background": {
    "color": "var(--background)"
  },
  "text-black": {
    "color": "#000"
  },
  "text-blue-500": {
    "color": "oklch(62.3% .214 259.815)"
  },
  "text-brand": {
    "color": "var(--brand)"
  },
  "text-brand-foreground": {
    "color": "var(--brand-foreground)"
  },
  "text-center": {
    "textAlign": "center"
  },
  "text-cyan-400": {
    "color": "oklch(78.9% .154 211.53)"
  },
  "text-foreground": {
    "color": "var(--foreground)"
  },
  "text-green-500": {
    "color": "oklch(72.3% .219 149.579)"
  },
  "text-left": {
    "textAlign": "left"
  },
  "text-muted-foreground": {
    "color": "var(--muted-foreground)"
  },
  "text-negative-foreground": {
    "color": "var(--negative-foreground)"
  },
  "text-neutral-foreground": {
    "color": "var(--neutral-foreground)"
  },
  "text-pink-400": {
    "color": "oklch(71.8% .202 349.761)"
  },
  "text-red-500": {
    "color": "oklch(63.7% .237 25.331)"
  },
  "text-right": {
    "textAlign": "right"
  },
  "text-white": {
    "color": "#fff"
  },
  "text-zinc-400": {
    "color": "oklch(70.5% .015 286.067)"
  },
  "text-zinc-500": {
    "color": "oklch(55.2% .016 285.938)"
  },
  "text-zinc-700": {
    "color": "oklch(37% .013 285.805)"
  },
  "text-zinc-900": {
    "color": "oklch(21% .006 285.885)"
  },
  "top-0": {
    "top": "0"
  },
  "top-1/2": {
    "top": "50%"
  },
  "top-12": {
    "top": "calc(.25rem * 12)"
  },
  "top-2.5": {
    "top": "calc(.25rem * 2.5)"
  },
  "top-3": {
    "top": "calc(.25rem * 3)"
  },
  "top-4": {
    "top": "calc(.25rem * 4)"
  },
  "top-8": {
    "top": "calc(.25rem * 8)"
  },
  "truncate": {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap"
  },
  "underline": {
    "textDecorationLine": "underline"
  },
  "w-1/2": {
    "width": "50%"
  },
  "w-1/3": {
    "width": "33.3333%"
  },
  "w-1/4": {
    "width": "25%"
  },
  "w-1/5": {
    "width": "20%"
  },
  "w-12": {
    "width": "calc(.25rem * 12)"
  },
  "w-16": {
    "width": "calc(.25rem * 16)"
  },
  "w-2/3": {
    "width": "66.6667%"
  },
  "w-20": {
    "width": "calc(.25rem * 20)"
  },
  "w-24": {
    "width": "calc(.25rem * 24)"
  },
  "w-3": {
    "width": "calc(.25rem * 3)"
  },
  "w-3.5": {
    "width": "calc(.25rem * 3.5)"
  },
  "w-3/4": {
    "width": "75%"
  },
  "w-32": {
    "width": "calc(.25rem * 32)"
  },
  "w-4/5": {
    "width": "80%"
  },
  "w-40": {
    "width": "calc(.25rem * 40)"
  },
  "w-5/6": {
    "width": "83.3333%"
  },
  "w-72": {
    "width": "calc(.25rem * 72)"
  },
  "w-fit": {
    "width": "fit-content"
  },
  "w-full": {
    "width": "100%"
  },
  "w-px": {
    "width": "1px"
  },
  "z-0": {
    "zIndex": "0"
  },
  "z-1": {
    "zIndex": "1"
  },
  "z-10": {
    "zIndex": "10"
  },
  "z-100": {
    "zIndex": "100"
  },
  "z-101": {
    "zIndex": "101"
  },
  "z-20": {
    "zIndex": "20"
  },
  "z-50": {
    "zIndex": "50"
  },
  "z-60": {
    "zIndex": "60"
  }
});
