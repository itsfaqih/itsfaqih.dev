import { CV_PDF } from "../data/cv";

/**
 * The CV page (cv-page.astro). The switch swaps the page to its ATS-friendly version and points the
 * download at that version's PDF.
 */
class CvPage extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const download = this.querySelector<HTMLAnchorElement>("a[download]")!;
    const ats = this.querySelector<HTMLInputElement>('input[role="switch"]')!;
    const controller = new AbortController();
    this.#stop = () => controller.abort();
    ats.addEventListener(
      "change",
      () => {
        const pdf = ats.checked ? CV_PDF.ats : CV_PDF.design;
        this.toggleAttribute("data-ats", ats.checked);
        download.href = pdf.href;
        download.download = pdf.fileName;
      },
      { signal: controller.signal },
    );
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("cv-page", CvPage);
