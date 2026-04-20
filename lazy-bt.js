class GenericInteractiveArchiveBehavior {
  static id = "Generic Interactive Archive Behavior";

  static isMatch() {
    return true;
  }

  static init() {
    return {};
  }

  static runInIframe = true;

  async awaitPageLoad(ctx) {
    const { sleep } = ctx.Lib;

    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        const done = () => resolve();
        window.addEventListener("load", done, { once: true });
        setTimeout(done, 8000);
      });
    }

    await sleep(1500);
  }

  async* run(ctx) {
    const { Lib } = ctx;

    const sleep = (ms) => Lib.sleep(ms);

    const isVisible = (el) => {
      if (!el || !(el instanceof Element)) return false;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const isLikelySafeToClick = (el) => {
      if (!el || !(el instanceof Element)) return false;
      if (!isVisible(el)) return false;
      if (el.closest("form")) return false;
      if (el.matches("input, textarea, select")) return false;
      if (el.matches("[type='submit'], [type='reset']")) return false;
      if (el.matches("[download]")) return false;

      const text = (el.innerText || el.getAttribute("aria-label") || "").trim().toLowerCase();
      const href = el.getAttribute("href") || "";

      const dangerWords = [
        "delete", "remove", "logout", "sign out", "unsubscribe", "buy", "purchase",
        "checkout", "pay", "submit", "senden", "löschen", "entfernen", "abmelden",
        "kaufen", "bezahlen", "bestellen"
      ];

      if (dangerWords.some((w) => text.includes(w))) return false;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

      return true;
    };

    const collectCandidates = () => {
      const selectors = [
        "button",
        "[role='button']",
        "summary",
        "[aria-expanded='false']",
        "[aria-haspopup]",
        ".accordion button",
        ".faq button",
        ".tabs button",
        "[data-action]",
        "[onclick]"
      ];

      const all = [...document.querySelectorAll(selectors.join(","))];

      return all
        .filter(isLikelySafeToClick)
        .filter((el, i, arr) => arr.indexOf(el) === i)
        .slice(0, 12);
    };

    const getDomSize = () => document.documentElement.outerHTML.length;

    const waitForStability = async (maxRounds = 8, delay = 1000) => {
      let prev = getDomSize();
      let stableRounds = 0;

      for (let i = 0; i < maxRounds; i++) {
        await sleep(delay);
        const curr = getDomSize();

        if (Math.abs(curr - prev) < 200) {
          stableRounds++;
        } else {
          stableRounds = 0;
        }

        prev = curr;

        if (stableRounds >= 2) break;
      }
    };

    yield Lib.getState(ctx, "Behavior gestartet");

    await sleep(1000);

    try {
      window.focus();
      document.body?.focus?.();
      window.dispatchEvent(new Event("mousemove"));
      window.dispatchEvent(new Event("scroll"));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keyup", { key: "Tab", bubbles: true }));
    } catch (_) {}

    yield Lib.getState(ctx, "Initiale Interaktion ausgelöst");

    const scrollSteps = [0.2, 0.45, 0.7, 0.95];
    const maxY = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      0
    );

    for (const ratio of scrollSteps) {
      const y = Math.floor(maxY * ratio);
      window.scrollTo({ top: y, behavior: "smooth" });
      await sleep(1400);
      yield Lib.getState(ctx, `Ges scrollt bis ${y}px`, "scroll");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(1200);

    const lazyTargets = [
      ...document.querySelectorAll("img, iframe, video, source, [data-src], [data-srcset], [loading='lazy']")
    ].filter(isVisible).slice(0, 30);

    for (const el of lazyTargets) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(250);
      } catch (_) {}
    }

    yield Lib.getState(ctx, "Lazy-Content angestoßen");

    const candidates = collectCandidates();

    for (const el of candidates) {
      try {
        await Lib.scrollIntoView(el);
        await sleep(600);

        const before = getDomSize();
        await Lib.scrollAndClick(el);
        await sleep(1500);
        const after = getDomSize();

        const label =
          (el.innerText || el.getAttribute("aria-label") || el.tagName || "element")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 80);

        if (Math.abs(after - before) > 100) {
          yield Lib.getState(ctx, `Interaktion mit "${label}" hat DOM verändert`, "click");
        } else {
          yield Lib.getState(ctx, `Interaktion mit "${label}" ohne erkennbare DOM-Änderung`, "click");
        }
      } catch (_) {}
    }

    await waitForStability();

    const links = [...document.querySelectorAll("a[href]")].slice(0, 20);
    for (const a of links) {
      try {
        const href = a.href;
        if (href && href.startsWith(window.location.origin)) {
          Lib.addLink?.(href);
        }
      } catch (_) {}
    }

    yield Lib.getState(ctx, "Interne Links gesammelt");

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    await sleep(1500);
    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(1000);

    yield Lib.getState(ctx, "Behavior abgeschlossen");
  }
}
