/* ============================================================
   app.js — interactions: theme, nav, reveal, filters, form, menu
   ============================================================ */
(function () {
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ============================================================
     CONTACT FORM CONFIG  — edit these two lines
     ------------------------------------------------------------
     1) FORM_ENDPOINT: paste a form endpoint to receive enquiries
        silently in your inbox (recommended for the live site).
        Free, no-backend options:
          • Formspree  → https://formspree.io   (endpoint looks like
            "https://formspree.io/f/abcdwxyz")
          • Web3Forms  → https://web3forms.com
        Leave it as "" and the form falls back to opening the
        visitor's email app with a pre-filled message to you.
     2) FALLBACK_EMAIL: your address used by the mailto fallback.
     ============================================================ */
  const FORM_ENDPOINT = "";
  const FALLBACK_EMAIL = "robnar72@gmail.com";

  /* ---------- Theme ---------- */
  const THEME_KEY = "iqt-theme";
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    $$(".theme-toggle").forEach((b) => b.setAttribute("aria-pressed", String(t === "dark")));
  }
  window.iqtTheme = {
    toggle: () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark")
  };

  document.addEventListener("DOMContentLoaded", () => {
    /* theme buttons */
    $$(".theme-toggle").forEach((b) => b.addEventListener("click", window.iqtTheme.toggle));
    /* lang buttons */
    $$(".lang-toggle").forEach((b) => b.addEventListener("click", () => window.iqtLang && window.iqtLang.toggle()));

    /* nav border on scroll */
    const nav = $(".nav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* smooth-scroll for in-page links + close mobile menu */
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top, behavior: "smooth" });
        closeMenu();
      });
    });

    /* mobile menu */
    const menu = $(".mobile-menu");
    window.__openMenu = () => menu && menu.classList.add("open");
    window.closeMenu = () => menu && menu.classList.remove("open");
    const mb = $(".menu-btn"); if (mb) mb.addEventListener("click", window.__openMenu);
    const mc = $(".mobile-menu .close"); if (mc) mc.addEventListener("click", window.closeMenu);

    /* scroll reveal — animation for real browsers, guaranteed-visible failsafe otherwise */
    const forceShow = (el) => { el.style.transition = "none"; el.style.opacity = "1"; el.style.transform = "none"; el.classList.add("in"); };
    const forceAll = () => $$(".reveal").forEach(forceShow);
    if (!("IntersectionObserver" in window)) {
      forceAll();
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          el.classList.add("in");      // nice transition for real users
          io.unobserve(el);
          // if the transition timeline never advances (frozen/embedded contexts),
          // snap to the final visible state so content can never stay hidden
          setTimeout(() => { if (parseFloat(getComputedStyle(el).opacity) < 0.9) forceShow(el); }, 900);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
      $$(".reveal").forEach((el) => io.observe(el));
      /* global safety net for anything never observed */
      window.addEventListener("load", () => setTimeout(forceAll, 2000));
      setTimeout(forceAll, 3500);
    }

    /* portfolio filters */
    const filters = $$(".filter");
    const works = $$(".work");
    filters.forEach((f) => {
      f.addEventListener("click", () => {
        filters.forEach((x) => x.classList.remove("active"));
        f.classList.add("active");
        const cat = f.getAttribute("data-cat");
        works.forEach((w) => {
          const show = cat === "all" || (w.getAttribute("data-cat") || "").split(" ").includes(cat);
          w.classList.toggle("hide", !show);
        });
      });
    });

    /* contact form */
    const form = $(".form form");
    if (form) {
      const ok = $(".form-ok");
      const submitBtn = form.querySelector('[type="submit"]');
      const setErr = (name, on) => { const fld = form.querySelector('[data-field="' + name + '"]'); if (fld) fld.classList.toggle("err", on); };
      const showOk = () => { form.style.display = "none"; if (ok) ok.classList.add("show"); };

      const openMailto = (name, email, type, msg) => {
        const en = (window.iqtLang && window.iqtLang.get() === "en");
        const subj = (en ? "New enquiry from " : "Nowe zapytanie od ") + name + (type ? " — " + type : "");
        const body =
          (en ? "Name" : "Imię") + ": " + name + "\n" +
          "Email: " + email + "\n" +
          (en ? "Project type" : "Typ projektu") + ": " + (type || "-") + "\n\n" + msg;
        window.location.href = "mailto:" + FALLBACK_EMAIL +
          "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
      };

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const typeEl = form.querySelector('[name="type"]');
        const type = typeEl ? typeEl.value : "";
        const msg = form.querySelector('[name="message"]').value.trim();
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        let bad = false;
        setErr("name", !name); bad = bad || !name;
        setErr("email", !emailOk); bad = bad || !emailOk;
        setErr("message", msg.length < 4); bad = bad || msg.length < 4;
        if (bad) return;

        if (FORM_ENDPOINT) {
          try {
            if (submitBtn) submitBtn.disabled = true;
            const res = await fetch(FORM_ENDPOINT, {
              method: "POST",
              headers: { "Accept": "application/json", "Content-Type": "application/json" },
              body: JSON.stringify({ name: name, email: email, type: type, message: msg })
            });
            if (!res.ok) throw new Error("bad status " + res.status);
            showOk();
          } catch (err) {
            if (submitBtn) submitBtn.disabled = false;
            openMailto(name, email, type, msg); /* graceful fallback */
            showOk();
          }
        } else {
          openMailto(name, email, type, msg);
          showOk();
        }
      });
      form.querySelectorAll("input,textarea").forEach((inp) =>
        inp.addEventListener("input", () => {
          const fld = inp.closest("[data-field]"); if (fld) fld.classList.remove("err");
        })
      );
    }

    /* build hero layer stack (decorative) */
    const obj = $(".hero-viz .obj");
    if (obj) {
      const N = 11;
      for (let i = 0; i < N; i++) {
        const el = document.createElement("i");
        const t = i / (N - 1);
        // width follows a rounded "vase/object" silhouette
        const w = 30 + Math.sin(t * Math.PI) * 70; // %
        el.style.width = w + "%";
        el.style.bottom = (i / N) * 100 + "%";
        el.style.animationDelay = (i * 0.06) + "s";
        obj.appendChild(el);
      }
    }
  });
})();
