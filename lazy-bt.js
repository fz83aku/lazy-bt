class GenericInteractiveArchiveBehavior {
  // Anzeigename des Behaviors in den Browsertrix-Logs
  static id = "Generic Interactive Archive Behavior";

  // Dieses Behavior soll auf jeder Seite ausgeführt werden
  // Wenn du es nur auf bestimmten Domains nutzen willst,
  // könntest du hier später auf window.location prüfen.
  static isMatch() {
    return true;
  }

  // Browsertrix erwartet eine init()-Methode, die ein Objekt zurückgibt.
  // Hier könnten später Optionen oder ein Initialzustand übergeben werden.
  static init() {
    return {};
  }

  // Wenn true, darf Browsertrix das Behavior auch innerhalb von iframes ausführen.
  // Das ist nützlich, wenn Inhalte in eingebetteten Frames nachgeladen werden.
  static runInIframe = true;

  // Diese Methode läuft vor dem eigentlichen Behavior.
  // Sie dient dazu, nicht sofort loszulegen, sondern erst auf einen sinnvollen
  // Ladezustand der Seite zu warten.
  async awaitPageLoad(ctx) {
    const { sleep } = ctx.Lib;

    // Wenn die Seite noch nicht komplett geladen ist, warten wir entweder
    // auf das "load"-Event oder auf einen Timeout nach 8 Sekunden.
    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        const done = () => resolve();
        window.addEventListener("load", done, { once: true });
        setTimeout(done, 8000);
      });
    }

    // Kurze Nachlaufzeit, damit dynamische Inhalte noch eine Chance haben,
    // nach dem eigentlichen Load-Event zu erscheinen.
    await sleep(1500);
  }

  // Das ist der Hauptablauf des Behaviors.
  // Browsertrix erwartet hier einen async iterator, also eine Funktion,
  // die zwischendurch "yield" verwendet, um Statusmeldungen an den Crawler zu geben.
  async* run(ctx) {
    const { Lib } = ctx;

    // Kleine Hilfsfunktion, damit der Code lesbarer wird.
    const sleep = (ms) => Lib.sleep(ms);

    // Prüft, ob ein DOM-Element tatsächlich sichtbar ist.
    // Wir filtern damit versteckte oder layoutlose Elemente heraus.
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

    // Prüft, ob ein Element "relativ sicher" anklickbar ist.
    // Ziel: möglichst allgemeingültig sein, aber riskante Klicks vermeiden.
    const isLikelySafeToClick = (el) => {
      if (!el || !(el instanceof Element)) return false;
      if (!isVisible(el)) return false;

      // Keine Formulare bedienen, damit keine unbeabsichtigten Aktionen passieren.
      if (el.closest("form")) return false;

      // Keine klassischen Formularelemente direkt anfassen.
      if (el.matches("input, textarea, select")) return false;

      // Keine Submit- oder Reset-Buttons klicken.
      if (el.matches("[type='submit'], [type='reset']")) return false;

      // Keine Download-Elemente anklicken.
      if (el.matches("[download]")) return false;

      // Aus dem sichtbaren Text oder aria-label lesen wir grob die Funktion heraus.
      const text = (el.innerText || el.getAttribute("aria-label") || "").trim().toLowerCase();
      const href = el.getAttribute("href") || "";

      // Wörter, die auf riskante oder unerwünschte Aktionen hindeuten.
      const dangerWords = [
        "delete", "remove", "logout", "sign out", "unsubscribe", "buy", "purchase",
        "checkout", "pay", "submit", "senden", "löschen", "entfernen", "abmelden",
        "kaufen", "bezahlen", "bestellen"
      ];

      // Wenn der Text auf eine solche Aktion hinweist, lassen wir das Element aus.
      if (dangerWords.some((w) => text.includes(w))) return false;

      // Auch keine Mail- oder Telefonlinks anklicken.
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

      return true;
    };

    // Sammelt potenziell interessante klickbare Elemente.
    // Das sind bewusst allgemeine Selektoren, die auf vielen Seiten vorkommen:
    // Buttons, Pseudo-Buttons, Accordion-Header, Tabs usw.
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
        .filter(isLikelySafeToClick)   // riskante oder unsichtbare Elemente entfernen
        .filter((el, i, arr) => arr.indexOf(el) === i) // Doppelte entfernen
        .slice(0, 12);                 // Begrenzung, damit das Behavior nicht zu aggressiv wird
    };

    // Misst die ungefähre Größe des DOM.
    // Das ist kein perfekter Indikator, aber hilfreich, um grob zu erkennen,
    // ob Interaktionen neue Inhalte ausgelöst haben.
    const getDomSize = () => document.documentElement.outerHTML.length;

    // Wartet darauf, dass sich das DOM nicht mehr stark verändert.
    // So bekommt nachgeladener Content etwas Zeit, vollständig zu erscheinen.
    const waitForStability = async (maxRounds = 8, delay = 1000) => {
      let prev = getDomSize();
      let stableRounds = 0;

      for (let i = 0; i < maxRounds; i++) {
        await sleep(delay);
        const curr = getDomSize();

        // Wenn sich das DOM nur minimal verändert hat, zählen wir das als "stabil".
        if (Math.abs(curr - prev) < 200) {
          stableRounds++;
        } else {
          stableRounds = 0;
        }

        prev = curr;

        // Nach zwei stabilen Runden hintereinander brechen wir ab.
        if (stableRounds >= 2) break;
      }
    };

    // Statusmeldung an Browsertrix: Start
    yield Lib.getState(ctx, "Behavior gestartet");

    await sleep(1000);

    // Sehr allgemeine, harmlose Initialinteraktion:
    // Fokus setzen, einfache Events auslösen.
    // Das soll nur typische Interaktionsketten anstoßen,
    // ohne konkrete Seitenelemente zu kennen.
    try {
      window.focus();
      document.body?.focus?.();
      window.dispatchEvent(new Event("mousemove"));
      window.dispatchEvent(new Event("scroll"));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keyup", { key: "Tab", bubbles: true }));
    } catch (_) {
      // Fehler bewusst ignorieren, damit das Behavior robust bleibt
    }

    yield Lib.getState(ctx, "Initiale Interaktion ausgelöst");

    // Wir scrollen schrittweise durch die Seite.
    // Ziel: Lazy Loading und sichtbarkeitsabhängige Inhalte anstoßen.
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

    // Danach wieder nach oben, weil manche Seiten oben weitere Inhalte oder Header-Bereiche nachladen.
    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(1200);

    // Sammeln von potenziell lazy geladenen Medien oder Elementen mit data-src/data-srcset.
    // Diese scrollen wir kurz ins Sichtfeld, damit Browser und Seite sie eher laden.
    const lazyTargets = [
      ...document.querySelectorAll("img, iframe, video, source, [data-src], [data-srcset], [loading='lazy']")
    ].filter(isVisible).slice(0, 30);

    for (const el of lazyTargets) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(250);
      } catch (_) {
        // Einzelne Fehler ignorieren, damit das Gesamtskript weiterläuft
      }
    }

    yield Lib.getState(ctx, "Lazy-Content angestoßen");

    // Jetzt sammeln wir einige allgemein anklickbare Kandidaten.
    const candidates = collectCandidates();

    for (const el of candidates) {
      try {
        // Das Element erst in den sichtbaren Bereich bringen
        await Lib.scrollIntoView(el);
        await sleep(600);

        // DOM-Größe vor dem Klick merken
        const before = getDomSize();

        // Browsertrix-Hilfsfunktion: scrollen + klicken
        await Lib.scrollAndClick(el);
        await sleep(1500);

        // DOM-Größe nach dem Klick erneut messen
        const after = getDomSize();

        // Eine lesbare Bezeichnung für die Logausgabe erzeugen
        const label =
          (el.innerText || el.getAttribute("aria-label") || el.tagName || "element")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 80);

        // Wenn sich die DOM-Größe merklich verändert hat,
        // werten wir das als Hinweis auf nachgeladenen oder aufgeklappten Content.
        if (Math.abs(after - before) > 100) {
          yield Lib.getState(ctx, `Interaktion mit "${label}" hat DOM verändert`, "click");
        } else {
          yield Lib.getState(ctx, `Interaktion mit "${label}" ohne erkennbare DOM-Änderung`, "click");
        }
      } catch (_) {
        // Auch hier: Fehler bei einzelnen Elementen nicht eskalieren
      }
    }

    // Nach den Interaktionen warten wir auf einen halbwegs stabilen Zustand.
    await waitForStability();

    // Interne Links einsammeln und dem Crawl hinzufügen.
    // Das ist nützlich, wenn neue Links erst durch Interaktionen sichtbar wurden.
    const links = [...document.querySelectorAll("a[href]")].slice(0, 20);
    for (const a of links) {
      try {
        const href = a.href;

        // Nur Links auf derselben Origin hinzufügen,
        // damit das Behavior nicht unkontrolliert nach extern verzweigt.
        if (href && href.startsWith(window.location.origin)) {
          Lib.addLink?.(href);
        }
      } catch (_) {
        // Fehler ignorieren
      }
    }

    yield Lib.getState(ctx, "Interne Links gesammelt");

    // Zum Schluss noch einmal ans Ende und zurück scrollen.
    // Damit lassen sich gelegentlich Inhalte erfassen, die erst sehr spät erscheinen.
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    await sleep(1500);

    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(1000);

    yield Lib.getState(ctx, "Behavior abgeschlossen");
  }
}
