// Harness for the rule landing prototypes: theme, header, reveals, and the variant picker
// (behaviour contract from the prototype skill's PICKER.md).

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function initTheme() {
  const html = document.documentElement;
  const button = document.querySelector(".theme-btn");
  button?.addEventListener("click", () => {
    const light = !html.classList.contains("light");
    html.classList.toggle("light", light);
    try {
      localStorage.setItem("rl-theme", light ? "light" : "dark");
    } catch {}
  });
}

function observeReveals(root) {
  const items = [...root.querySelectorAll(".rv")];
  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((e) => e.isIntersecting);
      entering.forEach((e, i) => {
        e.target.style.setProperty("--d", String(Math.min(i, 4)));
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

// Copy buttons: [data-copy] holds the text, or [data-copy-from] names an element whose text is copied.
function wireCopy(root) {
  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy], [data-copy-from]");
    if (!btn) return;
    const text = btn.dataset.copy ?? document.querySelector(btn.dataset.copyFrom)?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text.trim());
    } catch {}
    const label = btn.querySelector(".lbl") ?? btn;
    const was = label.textContent;
    label.textContent = btn.dataset.done ?? "Copied";
    btn.setAttribute("data-done", "");
    setTimeout(() => {
      label.textContent = was;
      btn.removeAttribute("data-done");
    }, 1600);
  });
}

function start(variants) {
  initTheme();
  const stage = document.getElementById("stage");
  const picker = document.createElement("nav");
  picker.className = "proto-picker";
  picker.setAttribute("aria-label", "Prototype variants");
  picker.innerHTML =
    '<span class="proto-picker-highlight" aria-hidden="true"></span>' +
    variants.map((v) => `<button class="proto-picker-item">${v.name}</button>`).join("") +
    '<span class="proto-picker-divider" aria-hidden="true"></span>' +
    '<button class="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)">↻</button>';
  document.body.append(picker);

  const highlight = picker.querySelector(".proto-picker-highlight");
  const items = [...picker.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")];
  const replay = picker.querySelector(".proto-picker-replay");
  let current = 0;
  let cleanup = [];

  function moveHighlight() {
    const el = items[current];
    highlight.style.width = el.offsetWidth + "px";
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  function mount(i) {
    cleanup.forEach((fn) => fn?.());
    cleanup = [];
    stage.innerHTML = "";
    requestAnimationFrame(() => {
      const v = variants[i];
      const node = document.getElementById(v.tpl).content.cloneNode(true);
      stage.append(node);
      stage.dataset.variant = v.tpl;
      window.scrollTo(0, 0);
      cleanup.push(observeReveals(stage));
      cleanup.push(v.init?.(stage, { reduced }));
    });
  }

  function setActive(i) {
    if (i < 0 || i >= variants.length) return;
    current = i;
    items.forEach((el, j) => {
      el.toggleAttribute("data-active", j === i);
      if (j === i) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    moveHighlight();
    const url = new URL(location);
    url.searchParams.set("v", i + 1);
    history.replaceState(null, "", url);
    mount(i);
  }

  items.forEach((el, i) => el.addEventListener("click", () => setActive(i)));
  replay.addEventListener("click", () => mount(current));
  addEventListener("resize", moveHighlight);
  document.addEventListener("keydown", (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= variants.length) setActive(num - 1);
    else if (e.key === "ArrowRight") setActive((current + 1) % variants.length);
    else if (e.key === "ArrowLeft") setActive((current - 1 + variants.length) % variants.length);
    else if (e.key === "r" || e.key === "R") mount(current);
  });
  wireCopy(stage);

  setActive((parseInt(new URLSearchParams(location.search).get("v"), 10) || 1) - 1);
  requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute("data-ready", "")));
}

// Pointer drag that tracks 1:1 and reports the position relative to `area`.
function drag(handle, area, { onMove, onEnd, onStart }) {
  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const box = area.getBoundingClientRect();
    const hb = handle.getBoundingClientRect();
    const dx = e.clientX - hb.left;
    const dy = e.clientY - hb.top;
    onStart?.();
    const move = (ev) => onMove(ev.clientX - box.left - dx, ev.clientY - box.top - dy, ev);
    const up = (ev) => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      onEnd(ev.clientX - box.left - dx, ev.clientY - box.top - dy, ev);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });
}

window.Proto = { start, drag, reduced };
