import { reducedMotion } from "../hooks/media-query";
import { watchRuleOpen } from "../sections/rule-open";
import { landingView } from "./rule-landing.styles";
import { watchReveal, watchTitleFit, watchTitleSwap } from "./rule-motion";

/** Shows `copied` on a button for 1600ms through `show`. */
function flash(show: (copied: boolean) => void) {
  return () => {
    show(true);
    setTimeout(() => show(false), 1600);
  };
}

function shareCopied(button: HTMLElement) {
  const [share, check] = button.querySelectorAll('[data-part="glyph"]');
  const label = button.querySelector('[data-part="label"]')!;
  return flash((copied) => {
    share?.setAttribute("class", landingView.glyph(!copied));
    check?.setAttribute("class", landingView.glyph(copied));
    label.textContent = copied ? "Link copied" : "Share";
  });
}

/**
 * A rule page (rule-landing.astro): its blocks rise in as they scroll into view, the title fits its
 * column, the header island carries the way back, the tags and Share while the header is compact,
 * the cover leans toward the mouse, and the pager cards play their art and dive into the next rule.
 */
class RuleLanding extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends Element = HTMLElement>(name: string, root: ParentNode = this) =>
      root.querySelector<T>(`[data-part="${name}"]`)!;
    const title = part("title");
    const stops = [watchReveal(this), watchTitleFit(title)];

    const activity = document.importNode(
      part<HTMLTemplateElement>("activity").content.firstElementChild!,
      true,
    );
    document.querySelector("[data-island-activity]")?.append(activity);
    stops.push(watchTitleSwap(title, part("label", activity)));

    const shared = { title: this.dataset.title!, text: this.dataset.claim! };
    const copiedShare = new Map<Element, () => void>();
    const share = async (button: HTMLElement) => {
      const data = { ...shared, url: location.href };
      if ("share" in navigator && navigator.canShare(data)) {
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
        copiedShare.set(button, shareCopied(button));
        button.addEventListener("click", () => void share(button), { signal });
      }
    }

    const copy = part("copy");
    const copiedMarkdown = flash((copied) => {
      copy.textContent = copied ? "Copied" : "Copy as Markdown";
    });
    copy.addEventListener(
      "click",
      async () => {
        try {
          const response = await fetch(this.dataset.markdown!);
          if (!response.ok) return;
          await navigator.clipboard.writeText(await response.text());
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
        for (const name of LEAN) cover.style.removeProperty(name);
      },
      { signal },
    );

    for (const card of this.querySelectorAll<HTMLElement>('[data-part="pager"]')) {
      const thumb = card.querySelector(".thumb")!;
      const play = (on: boolean) => () => thumb.toggleAttribute("data-play", on);
      card.addEventListener("pointerenter", play(true), { signal });
      card.addEventListener("pointerleave", play(false), { signal });
      card.addEventListener("focus", play(true), { signal });
      card.addEventListener("blur", play(false), { signal });
    }
    watchRuleOpen(this, signal);

    this.#stop = () => {
      controller.abort();
      for (const stop of stops) stop();
      activity.remove();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-landing", RuleLanding);
