import { reducedMotion } from "../hooks/media-query";
import { play } from "../hooks/sound";
import { glowDots } from "../sections/backdrop-dots";
import { isTransitioning, watchRuleOpen } from "../sections/rule-open";
import { landingView } from "./rule-landing.view";
import { watchReveal, watchTitleSwap } from "./rule-motion";

// Each lesson card lights one corner, so the whole column stays mostly grey.
const LESSON_GLOW = 0.8;
const TOP_RIGHT = [1, 0, 1, 0] as const;
const BOTTOM_LEFT = [0, 1, 0, 1] as const;

/** Shows `copied` on a button for 1600ms after its last press through `show`, until `signal` aborts. */
function flash(show: (copied: boolean) => void, signal: AbortSignal) {
  let timer: number | undefined;
  signal.addEventListener("abort", () => clearTimeout(timer));
  return () => {
    show(true);
    clearTimeout(timer);
    timer = window.setTimeout(() => show(false), 1600);
  };
}

function shareCopied(button: HTMLElement, signal: AbortSignal) {
  const [share, check] = button.querySelectorAll('[data-part="glyph"]');
  const label = button.querySelector('[data-part="label"]')!;
  return flash((copied) => {
    share?.setAttribute("class", landingView.glyph(!copied));
    check?.setAttribute("class", landingView.glyph(copied));
    label.textContent = copied ? "Link copied" : "Share";
  }, signal);
}

/**
 * A rule page (rule-landing.astro): its blocks rise in as they scroll into view, the title fits its
 * column, the header island carries the way back, the tags and Share while the header is compact,
 * the cover leans toward the mouse, the lesson cards light the dots behind a corner, and the pager
 * cards play their art and dive into the next rule.
 */
class RuleLanding extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends Element = HTMLElement>(name: string, root: ParentNode = this) =>
      root.querySelector<T>(`[data-part="${name}"]`)!;
    const title = part("title");
    const stops = [watchReveal(this)];

    // The dive into this rule plays on this page, so this page voices it: the one clicked from is
    // gone by then. The head script types it on pagereveal, which can come before or after this.
    const voiceDive = () => {
      if (isTransitioning("rule-open")) play("dive");
    };
    if (document.documentElement.dataset.vt) voiceDive();
    else addEventListener("pagereveal", voiceDive, { once: true, signal });

    const activity = document.importNode(
      part<HTMLTemplateElement>("activity").content.firstElementChild!,
      true,
    );
    document.querySelector("[data-island-activity]")?.append(activity);
    stops.push(watchTitleSwap(title, part("label", activity)));
    if (document.documentElement.classList.contains("from-home")) {
      for (const root of [this, activity]) {
        for (const back of root.querySelectorAll<HTMLAnchorElement>("[data-back]"))
          back.href = "/#rules";
      }
    }

    const shared = { title: this.dataset.title!, text: this.dataset.claim! };
    const copiedShare = new Map<Element, () => void>();
    const share = async (button: HTMLElement) => {
      const data = { ...shared, url: location.href };
      // Safari before 14 and Chrome before 89 have share but no canShare.
      if ("share" in navigator && (navigator.canShare?.(data) ?? true)) {
        try {
          await navigator.share(data);
        } catch (e) {
          if (!(e instanceof DOMException && e.name === "AbortError")) console.error(e);
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(data.url);
        copiedShare.get(button)?.();
      } catch (e) {
        console.error(e);
      }
    };
    for (const root of [this, activity]) {
      for (const button of root.querySelectorAll<HTMLElement>('[data-part="share"]')) {
        copiedShare.set(button, shareCopied(button, signal));
        button.addEventListener("click", () => void share(button), { signal });
      }
    }

    const copy = part("copy");
    const copiedMarkdown = flash((copied) => {
      copy.textContent = copied ? "Copied" : "Copy SKILL.md";
    }, signal);
    copy.addEventListener(
      "click",
      async () => {
        const markdown = fetch(this.dataset.markdown!).then(async (response) => {
          if (!response.ok) throw new Error(`${response.status} for ${response.url}`);
          return new Blob([await response.text()], { type: "text/plain" });
        });
        try {
          // Safari lets the clipboard write only inside the press, and an awaited fetch ends it, so
          // the write starts now and takes the markdown as a promise.
          try {
            await navigator.clipboard.write([new ClipboardItem({ "text/plain": markdown })]);
          } catch {
            await navigator.clipboard.writeText(await (await markdown).text());
          }
          copiedMarkdown();
        } catch (e) {
          console.error(e);
        }
      },
      { signal },
    );

    const cover = part("cover");
    const LEAN = ["--ry", "--rx", "--px", "--py"];
    cover.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" || reducedMotion()) return;
        const box = cover.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        cover.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
        cover.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
        // The art's layers read these to slide against the lean.
        cover.style.setProperty("--px", x.toFixed(3));
        cover.style.setProperty("--py", y.toFixed(3));
      },
      { signal },
    );
    cover.addEventListener(
      "pointerleave",
      () => {
        if (isTransitioning()) return;
        for (const name of LEAN) cover.style.removeProperty(name);
      },
      { signal },
    );

    for (const card of this.querySelectorAll<HTMLElement>('[data-part="pager"]')) {
      const thumb = card.querySelector(".thumb")!;
      // Chromium fires pointerleave between pageswap and the snapshot, which would stop the art
      // a dive morphs from.
      const playThumb = (on: boolean) => () => {
        if (!isTransitioning()) thumb.toggleAttribute("data-play", on);
      };
      card.addEventListener("pointerenter", playThumb(true), { signal });
      card.addEventListener("pointerleave", playThumb(false), { signal });
      card.addEventListener("focus", playThumb(true), { signal });
      card.addEventListener("blur", playThumb(false), { signal });
    }
    watchRuleOpen(this, signal);

    // The page's hue blips on behind each lesson card's corner as it scrolls in, alternating sides.
    const lessons = [...this.querySelectorAll("rule-lesson")].map((lesson) =>
      lesson.querySelector("article")!,
    );
    const light = () =>
      lessons.forEach((card, i) =>
        glowDots(`lesson-${i}`, card, "var(--hue)", i % 2 ? BOTTOM_LEFT : TOP_RIGHT, LESSON_GLOW),
      );
    light();
    const reflow = new ResizeObserver(light);
    reflow.observe(this);

    this.#stop = () => {
      controller.abort();
      for (const stop of stops) stop();
      activity.remove();
      reflow.disconnect();
      lessons.forEach((_, i) => glowDots(`lesson-${i}`, null));
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-landing", RuleLanding);
