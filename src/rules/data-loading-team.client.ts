import { Demo, spinner } from "./data-loading-demo";

type TeamLoad = "ok" | "loading" | "failed";

/**
 * A team card (data-loading-team.astro) whose next request fails after 500ms. Without
 * `data-inline` a toast says so over an empty card; with it the card shows the error and a Retry
 * that loads the team again in 600ms.
 */
class DataLoadingTeam extends Demo {
  #team: TeamLoad = "ok";

  protected setup(signal: AbortSignal) {
    const inline = this.hasAttribute("data-inline");
    const card = this.query("card");
    const body = this.query("body");
    const fail = this.query<HTMLButtonElement>("fail");
    const clone = (name: string) =>
      this.query<HTMLTemplateElement>(name).content.firstElementChild!.cloneNode(true);
    const people = body.firstElementChild!.cloneNode(true);

    const show = (team: TeamLoad) => {
      if (team === this.#team) return;
      this.#team = team;
      // Each state mounts afresh, so its entrance plays every time it comes back.
      body.replaceChildren(
        team === "loading"
          ? spinner(false)
          : team === "ok"
            ? people.cloneNode(true)
            : clone("failed"),
      );
      fail.disabled = team === "loading";
    };

    fail.addEventListener(
      "click",
      () => {
        show("loading");
        this.play([
          [
            500,
            () => {
              show("failed");
              if (inline) return;
              card.querySelector('[role="status"]')?.remove();
              card.append(clone("toast"));
            },
          ],
        ]);
      },
      { signal },
    );
    body.addEventListener(
      "click",
      (event) => {
        if (!(event.target instanceof Element) || !event.target.closest('[data-part="retry"]'))
          return;
        show("loading");
        this.play([[600, () => show("ok")]]);
      },
      { signal },
    );
  }
}

customElements.define("data-loading-team", DataLoadingTeam);
