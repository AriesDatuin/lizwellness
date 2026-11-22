const header = document.querySelector(".header");
const menu = document.querySelector(".nav-menu");
const progress = document.querySelector(".scroll-progress");
const prompts = document.querySelector(".prompts");
const sectionLinks = [...document.querySelectorAll(".nav-panel a, .nav-practice, .header a[href=\"#contact\"]")];
const sections = ["top", "wellness", "practice", "contact"].map(id => document.getElementById(id));

menu.addEventListener("click", event => {
  if (event.target.closest("a")) menu.open = false;
});

document.addEventListener("pointerdown", event => {
  if (!menu.contains(event.target)) menu.open = false;
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu.open) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});

function openLinkedPrompt() {
  const prompt = document.getElementById(location.hash.slice(1));
  if (prompt?.matches(".prompt")) prompt.open = true;
}

window.addEventListener("hashchange", openLinkedPrompt);
document.querySelectorAll('a[href="#physical"], a[href="#mental"], a[href="#personal"]').forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById(link.hash.slice(1)).open = true;
  });
});
openLinkedPrompt();

let pendingScroll = false;
function updateNavigation() {
  pendingScroll = false;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  progress.style.transform = "scaleX(" + fraction + ")";
  header.classList.toggle("is-floating", scrollY > 36);

  const current = sections.findLast(section => section.getBoundingClientRect().top < innerHeight * .38);
  header.dataset.section = current?.id ?? "";
  for (const link of sectionLinks) {
    const active = link.hash === "#" + current?.id;
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

window.addEventListener("scroll", () => {
  if (pendingScroll) return;
  pendingScroll = true;
  requestAnimationFrame(updateNavigation);
}, { passive: true });
window.addEventListener("resize", updateNavigation);
prompts.addEventListener("toggle", () => {
  updateNavigation();
  window.ScrollTrigger?.refresh();
}, true);
updateNavigation();

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
    hero.from(".hero-image img", { scale: 1.22, duration: 1.8 })
      .from(".hero .reveal-line > *", { yPercent: 110, duration: 1.1, stagger: .14 }, .12)
      .from(".hero .eyebrow, .hero .intro, .hero .button", {
        y: 22, opacity: 0, duration: .65, stagger: .11
      }, .55);

    for (const heading of document.querySelectorAll("main section:not(.hero) h2")) {
      gsap.from(heading.querySelectorAll(".reveal-line > *"), {
        yPercent: 108,
        duration: 1,
        stagger: .15,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 89%", once: true }
      });
    }

    for (const card of document.querySelectorAll(".pillar")) {
      const entrance = gsap.timeline({
        scrollTrigger: { trigger: card, start: "top 91%", once: true }
      });
      entrance.from(card.querySelector(".pillar-photo"), {
        clipPath: "inset(100% 0 0)", duration: .95, ease: "power3.out"
      }).from(card.querySelector(".pillar-copy"), {
        y: 28, opacity: 0, duration: .65, ease: "power2.out"
      }, .18);
    }

    gsap.from(".interlude p", {
      y: 24, opacity: 0, duration: .7,
      scrollTrigger: { trigger: ".interlude p", start: "top 93%", once: true }
    });

  });

  motion.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".hero-image", {
      yPercent: 22, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero-copy", {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.fromTo(".interlude h2", { scale: .91 }, {
      scale: 1.06, ease: "none",
      scrollTrigger: { trigger: ".interlude", start: "top bottom", end: "bottom top", scrub: true }
    });
  });
}

prompts.addEventListener("transitionend", event => {
  if (event.propertyName === "block-size") {
    updateNavigation();
    window.ScrollTrigger?.refresh();
  }
});

const contactForm = document.querySelector(".contact-form");
contactForm.addEventListener("submit", event => {
  event.preventDefault();
  contactForm.querySelector(".form-status").textContent = "The form passed validation. No message was sent.";
});
