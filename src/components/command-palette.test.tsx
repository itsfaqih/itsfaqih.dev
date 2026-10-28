import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VISIBLE_GUIDELINES } from "../data/guidelines";
import { CommandPalette } from "./command-palette";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

let history: ReturnType<typeof createMemoryHistory>;

async function openPalette() {
  const user = userEvent.setup();
  history = createMemoryHistory({ initialEntries: ["/blog"] });
  const router = createRouter({ routeTree: createRootRoute({ component: CommandPalette }), history });
  await act(() => router.load());
  render(<RouterProvider router={router} />);
  await user.keyboard("{Meta>}k{/Meta}");
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("combobox")));
  return user;
}

const groupNames = () =>
  screen.getAllByRole("group").map((group) => group.getAttribute("aria-label"));
const optionNames = (group: string) =>
  within(screen.getByRole("group", { name: group }))
    .getAllByRole("option")
    .map((option) => option.querySelector(".cmdk-name")?.textContent);
const selectedOption = () =>
  screen
    .getAllByRole("option")
    .find((option) => option.getAttribute("aria-selected") === "true")
    ?.querySelector(".cmdk-name")?.textContent;

describe("CommandPalette", () => {
  it("groups the root commands by category", async () => {
    await openPalette();

    expect(groupNames()).toEqual(["Pages", "Links", "Actions"]);
    expect(optionNames("Pages")).toEqual(["Home", "Rule of Thumb"]);
    expect(optionNames("Links")).toEqual(["GitHub", "LinkedIn"]);
    expect(optionNames("Actions")).toEqual(["Copy Email"]);
    expect(selectedOption()).toBe("Home");
  });

  it("filters by label, description and keywords, dropping empty groups", async () => {
    const user = await openPalette();
    const input = screen.getByRole("combobox");

    await user.type(input, "repo");
    expect(groupNames()).toEqual(["Links"]);
    expect(optionNames("Links")).toEqual(["GitHub"]);

    await user.clear(input);
    await user.type(input, "zzz");
    expect(screen.queryAllByRole("option")).toEqual([]);
    expect(screen.getByText('No results for "zzz"')).toBeTruthy();
  });

  it("wraps the highlight and runs the highlighted command on Enter", async () => {
    const user = await openPalette();

    await user.keyboard("{ArrowUp}");
    expect(selectedOption()).toBe("Copy Email");
    await user.keyboard("{ArrowDown}");
    expect(selectedOption()).toBe("Home");

    await user.keyboard("{Enter}");
    await waitFor(() => expect(history.location.pathname).toBe("/"));
  });

  it("opens the Rule of Thumb submenu and returns to its parent item", async () => {
    const user = await openPalette();

    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(groupNames()).toEqual(["Rule of Thumb"]);
    expect(optionNames("Rule of Thumb")).toEqual([
      "Index",
      ...VISIBLE_GUIDELINES.map((guideline) => guideline.title),
    ]);

    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(history.location.pathname).toBe(VISIBLE_GUIDELINES[0]?.href));

    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("combobox")));
    await user.keyboard("{ArrowDown}{ArrowRight}{Backspace}");
    expect(groupNames()).toEqual(["Pages", "Links", "Actions"]);
    expect(selectedOption()).toBe("Rule of Thumb");
  });
});
