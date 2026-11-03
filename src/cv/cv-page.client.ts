import { CV_PDF } from "../data/cv";

/**
 * The CV page (cv-page.astro). The switch swaps the page to its ATS-friendly version and points the
 * download at that version's PDF. Arriving with ?download=1 downloads the PDF once, and the
 * parameter comes off the URL so a reload or a shared link only shows the page.
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

    const url = new URL(location.href);
    if (url.searchParams.get("download") !== "1") return;
    download.click();
    url.searchParams.delete("download");
    history.replaceState(history.state, "", url);
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("cv-page", CvPage);
