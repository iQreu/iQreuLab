/* lemako-core.js — wspólny rdzeń dla wszystkich kierunków + panelu CMS.
   Jedno źródło treści (localStorage), i18n PL/EN, tryb jasny/ciemny, hydracja DOM.
   Ładowany jako zwykły <script src> (bez modułów). */
(function () {
  "use strict";

  var CONTENT_KEY = "lemako_v2_content";
  var LANG_KEY = "lemako_v2_lang";
  var MODE_KEY = "lemako_v2_mode";

  var CATEGORIES = [
    { id: "szafy", pl: "Szafy", en: "Wardrobes" },
    { id: "garderoby", pl: "Garderoby", en: "Walk-in closets" },
    { id: "kuchnie", pl: "Kuchnie", en: "Kitchens" },
    { id: "przedpokoj", pl: "Przedpokój", en: "Hallway" },
    { id: "lazienka", pl: "Łazienka", en: "Bathroom" },
    { id: "pokoj", pl: "Pokój", en: "Living" },
    { id: "komercyjne", pl: "Komercyjne", en: "Commercial" }
  ];

  // Statyczne etykiety interfejsu (PL/EN)
  var UI = {
    "nav.collections": { pl: "Zakres", en: "Scope" },
    "nav.work": { pl: "Realizacje", en: "Projects" },
    "nav.journal": { pl: "Blog", en: "Journal" },
    "nav.contact": { pl: "Kontakt", en: "Contact" },
    "cta.quote": { pl: "Bezpłatna wycena", en: "Free quote" },
    "cta.project": { pl: "Zamów projekt", en: "Start a project" },
    "cta.work": { pl: "Zobacz realizacje", en: "View projects" },
    "cta.send": { pl: "Wyślij zapytanie", en: "Send enquiry" },
    "head.scope": { pl: "Co tworzymy", en: "What we make" },
    "head.scopeTitle": { pl: "Zakres na wymiar", en: "Made-to-measure scope" },
    "head.work": { pl: "Z naszej pracowni", en: "From the workshop" },
    "head.workTitle": { pl: "Wybrane realizacje", en: "Selected projects" },
    "head.journal": { pl: "Blog", en: "Journal" },
    "head.journalTitle": { pl: "Z bloga pracowni", en: "From the journal" },
    "head.readMore": { pl: "Czytaj wpis", en: "Read the post" },
    "head.contact": { pl: "Porozmawiajmy", en: "Let's talk" },
    "label.phone": { pl: "Telefon", en: "Phone" },
    "label.email": { pl: "E-mail", en: "E-mail" },
    "label.city": { pl: "Region", en: "Region" },
    "label.hours": { pl: "Godziny", en: "Hours" },
    "blog.back": { pl: "← Wszystkie wpisy", en: "← All posts" },
    "blog.share": { pl: "Udostępnij", en: "Share" }
  };

  var DEFAULT_CONTENT = {
    brand: { name: "LEMAKO", sub: { pl: "Meble Design", en: "Furniture Design" } },
    hero: {
      eyebrow: { pl: "Stolarnia mebli na wymiar", en: "Bespoke furniture workshop" },
      title: { pl: "Meble dopasowane do Twojej przestrzeni co do milimetra", en: "Furniture fitted to your space to the millimetre" },
      subtitle: { pl: "Projektujemy i wykonujemy szafy, garderoby, kuchnie i zabudowy na wymiar — od pierwszego szkicu po montaż.", en: "We design and build wardrobes, closets, kitchens and built-ins to measure — from the first sketch to installation." }
    },
    about: {
      title: { pl: "Pracownia, w której liczy się detal", en: "A workshop where detail matters" },
      body: {
        pl: "Lemako MEBLE Design to rodzinna pracownia stolarska. Łączymy rzemiosło z nowoczesnym projektowaniem, tworząc meble piękne, trwałe i idealnie dopasowane do wnętrza.\nKażde zlecenie zaczynamy od rozmowy i pomiaru, a kończymy montażem dopracowanym w detalu.",
        en: "Lemako MEBLE Design is a family-run joinery studio. We blend craftsmanship with modern design to create furniture that is beautiful, durable and perfectly fitted.\nEvery commission starts with a conversation and a measurement, and ends with an installation refined to the last detail."
      },
      signature: { pl: "Zespół Lemako", en: "The Lemako team" }
    },
    stats: [
      { v: "12", l: { pl: "lat doświadczenia", en: "years of craft" } },
      { v: "450+", l: { pl: "realizacji", en: "projects" } },
      { v: "100%", l: { pl: "na wymiar", en: "made to measure" } }
    ],
    services: [
      { id: "s1", title: { pl: "Szafy na wymiar", en: "Bespoke wardrobes" }, desc: { pl: "Przesuwne i otwierane, od ściany do ściany.", en: "Sliding or hinged, fitted wall to wall." } },
      { id: "s2", title: { pl: "Garderoby", en: "Walk-in closets" }, desc: { pl: "Systemy przechowywania z oświetleniem.", en: "Storage systems with integrated lighting." } },
      { id: "s3", title: { pl: "Kuchnie na wymiar", en: "Bespoke kitchens" }, desc: { pl: "Fronty, blaty i zabudowa AGD.", en: "Fronts, worktops and appliance housing." } },
      { id: "s4", title: { pl: "Meble do przedpokoju", en: "Hallway furniture" }, desc: { pl: "Szafy, panele i siedziska.", en: "Wardrobes, panels and benches." } },
      { id: "s5", title: { pl: "Meble łazienkowe", en: "Bathroom furniture" }, desc: { pl: "Wodoodporne zabudowy.", en: "Water-resistant units." } },
      { id: "s6", title: { pl: "Zabudowy pokojowe", en: "Living-room built-ins" }, desc: { pl: "RTV, biurka i regały.", en: "Media walls, desks and shelving." } }
    ],
    projects: [
      { id: "p1", category: "garderoby", title: { pl: "Garderoba w sypialni", en: "Bedroom walk-in closet" }, desc: { pl: "Otwarta garderoba z podświetleniem LED.", en: "Open closet with LED lighting." } },
      { id: "p2", category: "kuchnie", title: { pl: "Kuchnia w grafitowym macie", en: "Matte graphite kitchen" }, desc: { pl: "Fronty bezuchwytowe i wysoka zabudowa.", en: "Handleless fronts and tall units." } },
      { id: "p3", category: "przedpokoj", title: { pl: "Szafa w przedpokoju", en: "Hallway wardrobe" }, desc: { pl: "Zabudowa z lustrem i miejscem na obuwie.", en: "Built-in with mirror and shoe storage." } },
      { id: "p4", category: "szafy", title: { pl: "Szafa przesuwna lacobel", en: "Sliding wardrobe in lacobel" }, desc: { pl: "Drzwi ze szkłem lakierowanym.", en: "Doors in lacquered glass." } },
      { id: "p5", category: "pokoj", title: { pl: "Zabudowa RTV z biblioteczką", en: "Media wall with library" }, desc: { pl: "Ścianka z półkami i oświetleniem.", en: "TV wall with shelving and lighting." } },
      { id: "p6", category: "lazienka", title: { pl: "Szafka pod umywalkę", en: "Vanity unit" }, desc: { pl: "Wodoodporne fronty w forniorze.", en: "Water-resistant veneer fronts." } }
    ],
    blog: [
      {
        id: "b1", date: "2026-05-18",
        category: { pl: "Poradnik", en: "Guide" },
        title: { pl: "Jak zaplanować garderobę idealną", en: "How to plan the perfect walk-in closet" },
        excerpt: { pl: "Od pomiaru po oświetlenie — praktyczny przewodnik po projektowaniu garderoby na wymiar.", en: "From measuring to lighting — a practical guide to designing a bespoke closet." },
        body: {
          pl: "Dobra garderoba zaczyna się od listy rzeczy, które ma pomieścić. Zanim zaczniemy rysować, prosimy klientów o podział ubrań na wieszane, składane i sezonowe — to wyznacza proporcje drążków, półek i szuflad.\nKolejny krok to światło. Taśmy LED z czujnikiem ruchu montowane pod półkami sprawiają, że nawet głęboka zabudowa jest czytelna o poranku.\nNa końcu zostają detale: cichy domyk, organizery na dodatki i lustro, które domyka całość. To one decydują, czy garderoba jest tylko ładna, czy naprawdę wygodna.",
          en: "A good closet starts with a list of what it must hold. Before we draw anything, we ask clients to split garments into hanging, folded and seasonal — that sets the proportions of rails, shelves and drawers.\nThe next step is light. Motion-sensor LED strips under the shelves keep even a deep build-in readable in the morning.\nFinally come the details: soft-close, accessory organisers and a mirror to finish it off. They decide whether a closet is merely pretty or genuinely comfortable."
        }
      },
      {
        id: "b2", date: "2026-04-02",
        category: { pl: "Materiały", en: "Materials" },
        title: { pl: "Fornir czy lakier? Dobieramy fronty", en: "Veneer or lacquer? Choosing fronts" },
        excerpt: { pl: "Porównujemy najpopularniejsze wykończenia frontów i podpowiadamy, gdzie się sprawdzą.", en: "We compare the most popular front finishes and where each works best." },
        body: {
          pl: "Fornir to naturalne drewno — ciepły rysunek słojów i charakter, który z czasem nabiera patyny. Sprawdza się w salonach i sypialniach, gdzie liczy się przytulność.\nLakier daje gładką, jednolitą taflę koloru. W wersji matowej maskuje odciski palców, w połysku optycznie powiększa wnętrze. To wybór do kuchni i nowoczesnych zabudów.\nW praktyce często łączymy oba: korpusy w forniorze, fronty w lakierze. Najlepsze projekty rzadko są monomateriałowe.",
          en: "Veneer is real wood — a warm grain and character that gains patina over time. It shines in living rooms and bedrooms where cosiness matters.\nLacquer gives a smooth, uniform plane of colour. Matte hides fingerprints; gloss visually enlarges a room. It's the choice for kitchens and modern built-ins.\nIn practice we often combine both: veneer carcasses, lacquer fronts. The best projects are rarely single-material."
        }
      },
      {
        id: "b3", date: "2026-02-20",
        category: { pl: "Za kulisami", en: "Behind the scenes" },
        title: { pl: "Jeden dzień w naszej stolarni", en: "A day in our workshop" },
        excerpt: { pl: "Od arkusza płyty po gotowy mebel — pokazujemy, jak powstaje zabudowa.", en: "From a raw board to a finished piece — how a built-in comes to life." },
        body: {
          pl: "Dzień zaczyna się od cięcia formatowego: surowe płyty zamieniają się w elementy o tolerancji poniżej milimetra. Każdy fragment trafia na okleiniarkę, która wykańcza krawędzie.\nPotem przychodzi czas na okucia — prowadnice, zawiasy, systemy przesuwne. To moment, w którym mebel zaczyna „działać”.\nNa końcu pakowanie i logistyka. Zanim zabudowa pojedzie do klienta, składamy ją w pracowni, by montaż na miejscu trwał godziny, a nie dni.",
          en: "The day starts at the panel saw: raw boards become parts with sub-millimetre tolerance. Each piece goes to the edge-bander that finishes the edges.\nThen come the fittings — runners, hinges, sliding systems. This is when the furniture starts to 'work'.\nFinally packing and logistics. Before a build-in heads to the client we assemble it in the workshop, so on-site installation takes hours, not days."
        }
      }
    ],
    contact: {
      phone: "+48 600 000 000",
      email: "kontakt@lemako.pl",
      city: { pl: "Województwo / region działania", en: "Service region" },
      hours: { pl: "Pon–Pt 8:00–17:00", en: "Mon–Fri 8:00–17:00" },
      instagram: "lemako_meble_design",
      facebook: "lemakomebledesign",
      tiktok: "lemako_meble_design"
    }
  };

  // ---------- store ----------
  function deepMerge(base, over) {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === "object") {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = base[k]; });
      if (over && typeof over === "object") {
        Object.keys(over).forEach(function (k) {
          out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
        });
      }
      return out;
    }
    return over === undefined ? base : over;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function getContent() {
    try {
      var raw = localStorage.getItem(CONTENT_KEY);
      if (raw) return deepMerge(DEFAULT_CONTENT, JSON.parse(raw));
    } catch (e) {}
    return clone(DEFAULT_CONTENT);
  }
  function saveContent(c) { localStorage.setItem(CONTENT_KEY, JSON.stringify(c)); }
  function resetContent() { localStorage.removeItem(CONTENT_KEY); }

  // ---------- lang & mode ----------
  function getLang() { return localStorage.getItem(LANG_KEY) || "pl"; }
  function setLang(l) { localStorage.setItem(LANG_KEY, l); }
  function getMode(def) { return localStorage.getItem(MODE_KEY) || def || document.documentElement.getAttribute("data-default-mode") || "dark"; }
  function setMode(m) { localStorage.setItem(MODE_KEY, m); }

  function catLabel(id, lang) {
    var c = CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c[lang] : id;
  }

  // ---------- path resolver + localize ----------
  function getPath(obj, path) {
    var segs = path.split("."), cur = obj;
    for (var i = 0; i < segs.length; i++) {
      if (cur == null) return undefined;
      cur = cur[segs[i]];
    }
    return cur;
  }
  function localize(v, lang) {
    if (v == null) return "";
    if (typeof v === "object" && !Array.isArray(v) && ("pl" in v || "en" in v)) return v[lang] != null ? v[lang] : (v.pl || "");
    return v;
  }

  function fmtDate(iso, lang) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return iso; }
  }

  // ---------- hydration ----------
  // Atrybuty:
  //  data-bind="path"          -> textContent (lokalizowane)
  //  data-bind-html="path"     -> akapity z \n
  //  data-i18n="ui.key"        -> etykieta UI
  //  data-list="projects|services|blog" z <template> w środku
  //  wewnątrz szablonu: data-bind="title", data-cat="category", data-bind="#num", data-date="date"
  //  data-limit="N" na elemencie data-list
  //  data-href-tel / data-href-mail -> ustawia href z kontaktu
  function hydrate(root) {
    root = root || document;
    var lang = getLang();
    var c = getContent();

    // UI labels
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (UI[key]) el.textContent = UI[key][lang];
    });

    // proste pola
    root.querySelectorAll("[data-bind]").forEach(function (el) {
      if (el.closest("template")) return;
      if (el.hasAttribute("data-list-item")) return; // hydratowane w pętli listy
      var p = el.getAttribute("data-bind");
      var val = localize(getPath(c, p), lang);
      if (val !== undefined) el.textContent = val;
    });

    // html (akapity)
    root.querySelectorAll("[data-bind-html]").forEach(function (el) {
      var p = el.getAttribute("data-bind-html");
      var val = localize(getPath(c, p), lang);
      if (typeof val === "string") {
        el.innerHTML = "";
        val.split("\n").forEach(function (line) {
          if (!line.trim()) return;
          var pEl = document.createElement("p");
          pEl.textContent = line;
          el.appendChild(pEl);
        });
      }
    });

    // pojedyncza data
    root.querySelectorAll("[data-bind-date]").forEach(function (el) {
      if (el.closest("template")) return;
      var iso = getPath(c, el.getAttribute("data-bind-date"));
      if (iso) el.textContent = fmtDate(iso, lang);
    });

    // listy
    root.querySelectorAll("[data-list]").forEach(function (host) {
      var name = host.getAttribute("data-list");
      var tpl = host.querySelector("template");
      if (!tpl) return;
      var arr = (c[name] || []).slice();
      var limit = parseInt(host.getAttribute("data-limit") || "0", 10);
      if (limit > 0) arr = arr.slice(0, limit);
      // usuń wcześniej wyrenderowane
      Array.prototype.slice.call(host.children).forEach(function (ch) {
        if (ch.tagName !== "TEMPLATE") host.removeChild(ch);
      });
      arr.forEach(function (item, i) {
        var node = tpl.content.cloneNode(true);
        node.querySelectorAll("[data-bind]").forEach(function (el) {
          var key = el.getAttribute("data-bind");
          if (key === "#num") { el.textContent = String(i + 1).padStart(2, "0"); return; }
          var val = localize(getPath(item, key), lang);
          if (val !== undefined) el.textContent = val;
        });
        node.querySelectorAll("[data-cat]").forEach(function (el) {
          el.textContent = catLabel(item[el.getAttribute("data-cat")], lang);
        });
        node.querySelectorAll("[data-date]").forEach(function (el) {
          el.textContent = fmtDate(item[el.getAttribute("data-date")], lang);
        });
        node.querySelectorAll("[data-ph]").forEach(function (el) {
          var key = el.getAttribute("data-ph");
          el.textContent = key === "cat" ? catLabel(item.category, lang) : localize(getPath(item, key), lang);
        });
        node.querySelectorAll("[data-link]").forEach(function (el) {
          el.setAttribute("href", el.getAttribute("data-link").replace("{id}", item.id));
        });
        host.appendChild(node);
      });
    });

    // kontakt: linki tel/mail
    root.querySelectorAll("[data-href-tel]").forEach(function (el) {
      el.setAttribute("href", "tel:" + (c.contact.phone || "").replace(/\s/g, ""));
    });
    root.querySelectorAll("[data-href-mail]").forEach(function (el) {
      el.setAttribute("href", "mailto:" + (c.contact.email || ""));
    });
    root.querySelectorAll("[data-social]").forEach(function (el) {
      var net = el.getAttribute("data-social");
      var handle = c.contact[net];
      if (!handle) { el.style.display = "none"; return; }
      var base = net === "instagram" ? "https://instagram.com/" : net === "tiktok" ? "https://tiktok.com/@" : "https://facebook.com/";
      el.setAttribute("href", base + handle);
    });

    document.documentElement.setAttribute("lang", lang);
  }

  // ---------- chrome: language + mode toggles, logo swap ----------
  function applyMode(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    document.querySelectorAll("[data-logo]").forEach(function (img) {
      var dark = img.getAttribute("data-src-dark") || "assets/logo-white.png";
      var light = img.getAttribute("data-src-light") || "assets/logo-ink.png";
      img.src = mode === "light" ? light : dark;
    });
    document.querySelectorAll("[data-mode-label]").forEach(function (el) {
      el.textContent = mode === "light" ? (getLang() === "pl" ? "Ciemny" : "Dark") : (getLang() === "pl" ? "Jasny" : "Light");
    });
    // ikona słońce/księżyc w przełączniku (pokazuje tryb docelowy)
    var sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    document.querySelectorAll("[data-toggle-mode]").forEach(function (btn) {
      var toLight = (mode !== "light"); // w trybie ciemnym pokazujemy słońce (klik → jasny)
      btn.innerHTML = toLight ? sun : moon;
      var lbl = toLight ? (getLang() === "pl" ? "Tryb jasny" : "Light mode") : (getLang() === "pl" ? "Tryb ciemny" : "Dark mode");
      btn.setAttribute("aria-label", lbl);
      btn.setAttribute("title", lbl);
    });
  }

  function wireChrome() {
    var mode = getMode();
    applyMode(mode);

    document.querySelectorAll("[data-toggle-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = (document.documentElement.getAttribute("data-theme") === "light") ? "dark" : "light";
        setMode(mode); applyMode(mode);
      });
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var l = btn.getAttribute("data-set-lang");
        setLang(l);
        document.querySelectorAll("[data-set-lang]").forEach(function (b) {
          b.classList.toggle("on", b.getAttribute("data-set-lang") === l);
        });
        hydrate(document);
        applyMode(document.documentElement.getAttribute("data-theme"));
      });
    });
    var lang = getLang();
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-set-lang") === lang);
    });
  }

  function init() {
    wireChrome();
    hydrate(document);
    // reaguj na zmiany z panelu (inny tab/okno)
    window.addEventListener("storage", function (e) {
      if (e.key === CONTENT_KEY || e.key === LANG_KEY) hydrate(document);
      if (e.key === MODE_KEY) applyMode(getMode());
    });
  }

  window.Lemako = {
    CONTENT_KEY: CONTENT_KEY, LANG_KEY: LANG_KEY, MODE_KEY: MODE_KEY,
    CATEGORIES: CATEGORIES, UI: UI, DEFAULT_CONTENT: DEFAULT_CONTENT,
    getContent: getContent, saveContent: saveContent, resetContent: resetContent,
    getLang: getLang, setLang: setLang, getMode: getMode, setMode: setMode,
    catLabel: catLabel, localize: localize, getPath: getPath, fmtDate: fmtDate,
    hydrate: hydrate, applyMode: applyMode, init: init, clone: clone
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
