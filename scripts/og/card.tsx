import { readFile, readdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import satori, { type Font } from "satori";
import { SLIDES } from "../../src/data/home";

const CARD_SIZE = { width: 1200, height: 630 } as const;

type Hue = `#${string}` | `var(--${string})`;

type Footer =
  | { kind: "domain" }
  | { kind: "shift"; from: string; to: string }
  | { kind: "topics"; topics: { name: string; hue: Hue }[] };

export type OgCard =
  | { kind: "home" }
  | { kind: "page"; hue: Hue; eyebrow: string; title: string; lede: string; footer: Footer };

const FONTS_DIR = new URL("./fonts/", import.meta.url);
const WEIGHTS: Font["weight"][] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

async function loadFonts(): Promise<Font[]> {
  const files = (await readdir(FONTS_DIR)).filter((file) => file.endsWith(".ttf"));
  return Promise.all(
    files.map(async (file) => {
      const [, slug, digits] = file.match(/^(.+)-(\d+)\.ttf$/)!;
      const weight = WEIGHTS.find((candidate) => candidate === Number(digits));
      if (!weight) throw new Error(`${file} names a weight Satori cannot draw.`);
      return {
        name: slug!
          .split("-")
          .map((word) => word[0]!.toUpperCase() + word.slice(1))
          .join(" "),
        weight,
        data: await readFile(new URL(file, FONTS_DIR)),
      };
    }),
  );
}

async function loadTokens() {
  const css = await readFile(new URL("../../src/arcade.css", import.meta.url), "utf8");
  const root = css.match(/:root\s*\{([^}]*)\}/)![1]!;
  return new Map(
    [...root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8});/gi)].map(([, k, v]) => [k!, v!]),
  );
}

let assets: Promise<{ fonts: Font[]; tokens: Map<string, string> }> | undefined;

export async function renderCard(card: OgCard): Promise<Buffer> {
  assets ??= Promise.all([loadFonts(), loadTokens()]).then(([fonts, tokens]) => ({
    fonts,
    tokens,
  }));
  const { fonts, tokens } = await assets;
  const hex = (hue: Hue) => {
    const token = hue.match(/^var\(--([\w-]+)\)$/)?.[1];
    if (!token) return hue;
    const value = tokens.get(token);
    if (!value) throw new Error(`src/arcade.css has no --${token} hex for the share card`);
    return value;
  };
  const ink = {
    ground: hex("var(--bg)"),
    hair: hex("var(--hair)"),
    text: hex("var(--text)"),
    dim: hex("var(--dim)"),
    go: hex("var(--go)"),
    onAccent: hex("var(--on-accent)"),
    live: hex("var(--ts)"),
    thumbnailDots: "#2a2a36",
    hex,
  };
  const svg = await satori(
    card.kind === "home" ? <HomeCard ink={ink} /> : <PageCard ink={ink} {...card} />,
    { ...CARD_SIZE, fonts },
  );
  // Satori already outlines every glyph, so resvg has no text to find fonts for.
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
}

type Ink = Record<
  "ground" | "hair" | "text" | "dim" | "go" | "onAccent" | "live" | "thumbnailDots",
  string
> & {
  hex: (hue: Hue) => string;
};

function titleSize(title: string) {
  if (title.length <= 18) return 104;
  if (title.length <= 30) return 88;
  return 76;
}

function Frame({ ink, hue, children }: { ink: Ink; hue: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        ...CARD_SIZE,
        display: "flex",
        flexDirection: "column",
        backgroundColor: ink.ground,
        backgroundImage: `radial-gradient(circle at 3px 3px, ${ink.thumbnailDots} 2px, transparent 0)`,
        backgroundSize: "28px 28px",
        color: ink.text,
        fontFamily: "Geist",
      }}
    >
      <div style={{ height: 12, backgroundColor: hue }} />
      {children}
    </div>
  );
}

function Mono({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Geist Mono",
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

function Wordmark({ ink }: { ink: Ink }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div
        style={{ fontFamily: "Unbounded", fontWeight: 900, fontSize: 26, letterSpacing: "0.02em" }}
      >
        FAQIH
      </div>
      <Mono color={ink.dim}>itsfaqih.dev</Mono>
    </div>
  );
}

function Chip({
  ink,
  hue,
  filled,
  children,
}: {
  ink: Ink;
  hue: string;
  filled: boolean;
  children: string;
}) {
  return (
    <div
      style={{
        padding: "10px 18px",
        borderRadius: 10,
        border: `2px solid ${filled ? hue : ink.hair}`,
        backgroundColor: filled ? hue : "transparent",
        color: filled ? ink.onAccent : ink.dim,
        fontFamily: "Unbounded",
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function Arrow({ color }: { color: string }) {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24">
      <path
        d="M2 12h34M26 3l10 9-10 9"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterRow({ ink, hue, footer }: { ink: Ink; hue: string; footer: Footer }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Wordmark ink={ink} />
      {footer.kind === "shift" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Chip ink={ink} hue={hue} filled={false}>
            {footer.from}
          </Chip>
          <Arrow color={hue} />
          <Chip ink={ink} hue={hue} filled>
            {footer.to}
          </Chip>
        </div>
      )}
      {footer.kind === "topics" && (
        <div style={{ display: "flex", gap: 24 }}>
          {footer.topics.map((topic) => (
            <div key={topic.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: ink.hex(topic.hue),
                }}
              />
              <Mono color={ink.text}>{topic.name}</Mono>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageCard({
  ink,
  eyebrow,
  title,
  lede,
  footer,
  ...card
}: { ink: Ink } & Extract<OgCard, { kind: "page" }>) {
  const hue = ink.hex(card.hue);
  return (
    <Frame ink={ink} hue={hue}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          padding: "52px 72px 56px",
        }}
      >
        <Mono color={hue}>{eyebrow}</Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Unbounded",
              fontWeight: 900,
              fontSize: titleSize(title),
              lineHeight: 1,
              letterSpacing: "-0.04em",
              maxWidth: 1056,
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          <div
            style={{ fontSize: 34, lineHeight: 1.3, color: ink.dim, maxWidth: 960, lineClamp: 2 }}
          >
            {lede}
          </div>
        </div>
        <FooterRow ink={ink} hue={hue} footer={footer} />
      </div>
    </Frame>
  );
}

function HomeCard({ ink }: { ink: Ink }) {
  const slide = SLIDES[0]!;
  return (
    <Frame ink={ink} hue={ink.go}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          padding: "52px 72px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ink.live }} />
            <Mono color={ink.go}>Full-stack engineer · Yogyakarta</Mono>
          </div>
          <Mono color={ink.dim}>itsfaqih.dev</Mono>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Unbounded",
            fontWeight: 900,
            fontSize: 92,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          <div>I build</div>
          <div>{slide.phrase.trim()}</div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                backgroundColor: ink.hex(slide.color),
                color: ink.onAccent,
                padding: "0 10px 6px",
                marginLeft: -10,
              }}
            >
              {slide.highlight}
            </div>
            <div>.</div>
          </div>
        </div>
        <div style={{ fontSize: 34, color: ink.dim }}>
          Faqih Muntashir, full-stack engineer with 5+ years on web products.
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 40, whiteSpace: "nowrap" }}>
        {SLIDES.map(({ ticker, color }) => (
          <div
            key={ticker}
            style={{
              padding: "0 28px",
              lineHeight: "76px",
              backgroundColor: ink.hex(color),
              color: ink.onAccent,
              fontFamily: "Unbounded",
              fontWeight: 900,
              fontSize: 30,
            }}
          >
            {ticker}
          </div>
        ))}
      </div>
    </Frame>
  );
}
