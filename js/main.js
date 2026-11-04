(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var dict = window.I18N;
  var cfg = window.MGAI_CONFIG || {};
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  function lang() { return root.lang === "ar" ? "ar" : "en"; }
  function t(key) { return (dict[lang()] && dict[lang()][key]) || dict.en[key] || key; }

  /* ---------------- Language ---------------- */
  function applyLang(l) {
    root.lang = l;
    root.dir = l === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = dict[l][el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });
    document.title = t("metaTitle");
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = l === "ar" ? "https://mgai.ae/?lang=ar" : "https://mgai.ae/";
    var md = document.getElementById("metaDesc");
    if (md) md.setAttribute("content", t("metaDesc"));
    // keep the address bar shareable: ?lang=ar for Arabic, clean URL for English
    try {
      var u = new URL(location.href);
      if (l === "ar") u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
    document.getElementById("langToggle").setAttribute("aria-label", t("langAria"));
    updateThemeUI();
    updateMenuUI();
    // re-translate any visible validation errors
    document.querySelectorAll(".error[data-key]").forEach(function (el) { el.textContent = t(el.dataset.key); });
    var st = document.getElementById("formStatus");
    if (st.dataset.key) st.textContent = t(st.dataset.key);
  }

  document.getElementById("langToggle").addEventListener("click", function () {
    var next = lang() === "en" ? "ar" : "en";
    document.body.classList.add("lang-swap");
    setTimeout(function () {
      applyLang(next);
      store.set("mgai-lang", next);
      requestAnimationFrame(function () { document.body.classList.remove("lang-swap"); });
    }, 180);
  });

  /* ---------------- Theme ---------------- */
  var themeBtn = document.getElementById("themeToggle");
  function updateThemeUI() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", t(dark ? "theme.ariaToLight" : "theme.ariaToDark"));
    var lbl = themeBtn.querySelector(".theme-label");
    lbl.setAttribute("data-i18n", dark ? "theme.toLight" : "theme.toDark");
    lbl.textContent = t(dark ? "theme.toLight" : "theme.toDark");
    // favicon follows the site theme: light lettering on dark, gray lettering on light
    var fs = document.getElementById("faviconSvg"), fp = document.getElementById("faviconPng");
    if (fs) fs.href = dark ? "assets/favicon-dark.svg" : "assets/favicon.svg";
    if (fp) fp.href = dark ? "assets/favicon-dark-32.png" : "assets/favicon-32.png";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#121414" : "#f7f8f7";
  }
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("mgai-theme", next);
    updateThemeUI();
  });
  // follow OS changes only if the visitor never picked a theme
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
      if (!store.get("mgai-theme")) { root.setAttribute("data-theme", e.matches ? "light" : "dark"); updateThemeUI(); }
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  var header = document.querySelector(".site-header");
  function updateMenuUI() {
    var open = nav.classList.contains("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
    header.classList.toggle("menu-open", open);
  }
  function setMenu(open) { nav.classList.toggle("open", open); updateMenuUI(); }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 920) setMenu(false); });

  /* ---------------- Header on scroll + active link ---------------- */
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["about", "capabilities", "solutions", "why", "contact"].forEach(function (id) {
      var s = document.getElementById(id); if (s) secObs.observe(s);
    });

    /* reveal on scroll */
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { revObs.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(name, key) {
    var input = form.elements[name];
    var field = input.closest(".field");
    var err = document.getElementById("e-" + name);
    if (key) {
      field.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", "e-" + name);
      err.dataset.key = key;
      err.textContent = t(key);
    } else {
      field.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      delete err.dataset.key;
      err.textContent = "";
    }
  }

  function validateField(name) {
    var v = form.elements[name].value.trim();
    var key = null;
    if (name === "name") { if (!v) key = "err.nameRequired"; }
    else if (name === "email") { if (!v) key = "err.emailRequired"; else if (!EMAIL_RE.test(v)) key = "err.emailInvalid"; }
    else if (name === "phone") {
      var digits = v.replace(/\D/g, "");
      if (!v) key = "err.phoneRequired";
      else if (!/^[+\d\s().-]+$/.test(v) || digits.length < 7 || digits.length > 15) key = "err.phoneInvalid";
    }
    else if (name === "message") { if (!v) key = "err.messageRequired"; else if (v.length < 10) key = "err.messageShort"; }
    setError(name, key);
    return !key;
  }

  var FIELDS = ["name", "email", "phone", "message"];
  FIELDS.forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener("blur", function () { if (el.value.trim()) validateField(n); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("invalid")) validateField(n); });
  });

  function setStatus(key) {
    if (key) { statusEl.dataset.key = key; statusEl.textContent = t(key); }
    else { delete statusEl.dataset.key; statusEl.textContent = ""; }
  }

  function buildRequest(data) {
    var p = cfg.provider || "formsubmit";
    var json = { "Content-Type": "application/json", "Accept": "application/json" };
    if (p === "web3forms") {
      return { url: "https://api.web3forms.com/submit", headers: json, body: JSON.stringify({
        access_key: cfg.web3formsKey, subject: cfg.subject, from_name: "mgai.ae",
        name: data.name, email: data.email, phone: data.phone, message: data.message, language: data.lang }) };
    }
    if (p === "formspree") {
      return { url: "https://formspree.io/f/" + cfg.formspreeId, headers: json, body: JSON.stringify({
        name: data.name, email: data.email, phone: data.phone, message: data.message, language: data.lang, _subject: cfg.subject }) };
    }
    if (p === "endpoint") {
      return { url: cfg.endpoint, headers: json, body: JSON.stringify(data) };
    }
    // formsubmit (default)
    return { url: "https://formsubmit.co/ajax/" + encodeURIComponent(cfg.email || "info@mgai.ae"), headers: json, body: JSON.stringify({
      name: data.name, email: data.email, phone: data.phone, message: data.message, language: data.lang,
      _subject: cfg.subject, _template: "table", _captcha: "false", _replyto: data.email }) };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus(null);
    var ok = FIELDS.map(validateField).every(Boolean);
    if (!ok) {
      setStatus("err.fixFields");
      var firstBad = form.querySelector(".invalid input, .invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }
    // honeypot: pretend success for bots
    if (form.elements._honey.value) { showSuccess(); return; }

    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      message: form.elements.message.value.trim(),
      lang: lang()
    };
    var req = buildRequest(data);
    var label = submitBtn.querySelector(".btn-text");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    label.textContent = t("form.sending");

    fetch(req.url, { method: "POST", headers: req.headers, body: req.body })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          var failed = !res.ok || body.success === false || body.success === "false" || body.ok === false;
          if (failed) throw new Error(body.message || ("HTTP " + res.status));
        });
      })
      .then(showSuccess)
      .catch(function (err) {
        console.error("Contact form error:", err);
        setStatus("err.submit");
      })
      .finally(function () {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        label.textContent = t("form.submit");
      });
  });

  function showSuccess() {
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  document.getElementById("sendAnother").addEventListener("click", function () {
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  /* ---------------- Init ---------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang(lang());
})();
