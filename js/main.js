const siteSettings = window.siteSettings || {};
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

function applySiteSettings() {
  const companyName = siteSettings.companyName || "A LITTLE TENDERNESS s.r.o.";
  const companyShortName = siteSettings.companyShortName || "Little Tenderness";
  const companyLegalSuffix = siteSettings.companyLegalSuffix || "s.r.o.";
  const email = siteSettings.email || "support@littletendernessads.com";
  const website = siteSettings.website || "littletendernessads.com";
  const address = siteSettings.companyAddress || "";
  const companyId = siteSettings.companyId || "";
  const footerCompanyParts = [companyName, address, companyId ? `ID: ${companyId}` : ""].filter(Boolean);

  document.querySelectorAll(".brand-text").forEach((element) => {
    element.innerHTML = `${companyShortName}${companyLegalSuffix ? ` <small>${companyLegalSuffix}</small>` : ""}`;
  });
  document.querySelectorAll("a[href^='mailto:']").forEach((link) => {
    link.href = `mailto:${email}`;
    if (link.textContent.includes("@")) link.textContent = email;
  });
  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;
    const value = {
      companyName,
      companyShortName,
      companyAddress: address,
      companyId,
      email,
      website,
      footerDescription: siteSettings.footerDescription,
      footerBottomLine: siteSettings.footerBottomLine,
    }[key];
    if (!value) return;
    element.textContent = value;
    if (element instanceof HTMLAnchorElement) {
      if (key === "email") element.href = `mailto:${email}`;
      if (key === "website") element.href = website.startsWith("http") ? website : `https://${website}`;
    }
  });
  document.querySelectorAll(".menu-footerline strong").forEach((el) => (el.textContent = email));
  document.querySelectorAll(".menu-footerline span").forEach((el) => (el.textContent = companyName));
  document.querySelectorAll(".footer-brand p").forEach((el) => {
    if (siteSettings.footerDescription) el.textContent = siteSettings.footerDescription;
  });
  document.querySelectorAll(".footer-bottom span:first-child").forEach((el) => {
    el.textContent = `Copyright ${siteSettings.copyrightYear || "2026"} ${footerCompanyParts.join(" | ")}. All rights reserved.`;
  });
  document.querySelectorAll(".footer-bottom span:last-child").forEach((el) => {
    if (siteSettings.footerBottomLine) el.textContent = siteSettings.footerBottomLine;
  });
}

applySiteSettings();

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons({ strokeWidth: 1.9 });
});

const header = document.querySelector(".site-header");
const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const menuToggle = document.querySelector(".menu-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const menuClose = document.querySelector(".menu-close");
const serviceMenuToggle = document.querySelector(".service-menu-toggle");
const serviceMenuGroup = document.querySelector(".menu-service-group");
if (!menuOverlay) menuToggle?.setAttribute("hidden", "");

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay?.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuOverlay?.setAttribute("aria-hidden", "false");
}
function closeMenu() {
  menuOverlay?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuOverlay?.setAttribute("aria-hidden", "true");
}
menuToggle?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);
window.addEventListener("keydown", (event) => event.key === "Escape" && closeMenu());
document.querySelectorAll(".overlay-nav a").forEach((link) => link.addEventListener("click", closeMenu));
serviceMenuToggle?.addEventListener("click", () => {
  const expanded = serviceMenuToggle.getAttribute("aria-expanded") === "true";
  serviceMenuToggle.setAttribute("aria-expanded", String(!expanded));
  serviceMenuGroup?.classList.toggle("is-open", !expanded);
});

const activePath = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".desktop-nav a, .footer-col a").forEach((link) => {
  if (link.getAttribute("href") === activePath) link.setAttribute("aria-current", "page");
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  if (!summary) return;
  summary.addEventListener("click", (event) => {
    if (prefersReduced) return;
    event.preventDefault();
    const start = item.offsetHeight;
    const opening = !item.open;
    item.open = true;
    const end = opening ? item.scrollHeight : summary.offsetHeight;
    item.style.height = `${start}px`;
    item.style.overflow = "hidden";
    item.animate({ height: [`${start}px`, `${end}px`] }, { duration: opening ? 320 : 240, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => {
      item.open = opening;
      item.style.height = "";
      item.style.overflow = "";
    };
  });
});

document.querySelectorAll(".contact-form").forEach((form) => {
  const note = form.querySelector(".form-note");
  const status = new URLSearchParams(window.location.search).get("form");
  if (!note || !status) return;
  note.textContent =
    status === "sent"
      ? "Thank you. Your inquiry was sent to A LITTLE TENDERNESS s.r.o."
      : "The form could not be sent. Please check the fields or email us directly.";
});

function initCookieBanner() {
  const key = "little_tenderness_cookie_consent";
  const storage = (() => {
    try {
      localStorage.setItem("__cookie_test", "1");
      localStorage.removeItem("__cookie_test");
      return localStorage;
    } catch {
      return null;
    }
  })();
  if (storage?.getItem(key)) return;
  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `<div><strong>Cookie preferences</strong><p>We use essential cookies for website operation and optional analytics or marketing cookies only with your consent.</p><a href="cookie-policy.html">Read Cookie Policy</a></div><div class="cookie-actions"><button type="button" data-cookie="reject">Reject optional</button><button type="button" data-cookie="accept">Accept all</button></div>`;
  banner.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cookie]");
    if (!button) return;
    const accepted = button.dataset.cookie === "accept";
    storage?.setItem(key, JSON.stringify({ essential: true, analytics: accepted, marketing: accepted, savedAt: new Date().toISOString() }));
    banner.classList.add("is-hiding");
    window.setTimeout(() => banner.remove(), 220);
  });
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add("is-visible"));
}
initCookieBanner();
