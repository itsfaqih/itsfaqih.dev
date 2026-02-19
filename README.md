# personal-web

Personal portfolio website.

## Tech Stack

- **Framework** — [React 19](https://react.dev) + [TanStack Start](https://tanstack.com/start) (SPA mode)
- **Build Tool** — [Vite 8](https://vite.dev) with [Bun](https://bun.sh) runtime
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Typography** — [Geist](https://vercel.com/font) (Sans & Mono)
- **UI Components** — [Base UI](https://base-ui.com) (Preview Cards)
- **Icons** — [Phosphor Icons](https://phosphoricons.com)
- **Linting** — [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- **Formatting** — [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- **Compiler** — [React Compiler](https://react.dev/learn/react-compiler) via Babel plugin

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or [Node.js](https://nodejs.org) >= 24

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `bun run dev`      | Start the development server        |
| `bun run build`    | Type-check and build for production |
| `bun run preview`  | Preview the production build        |
| `bun run lint`     | Lint with Oxlint                    |
| `bun run lint:fix` | Lint and auto-fix issues            |
| `bun run format`   | Format code with Oxfmt              |

## License

[MIT](LICENSE)
