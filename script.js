const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const year = document.getElementById("year");
const canvas = document.getElementById("dataCanvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

year.textContent = new Date().getFullYear();

const closeMenu = () => {
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  header.classList.remove("is-open");
  document.body.classList.remove("nav-open");
};

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navMenu.classList.toggle("is-open", !isOpen);
  header.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

const pointer = {
  x: 0,
  y: 0,
  active: false
};

let width = 0;
let height = 0;
let pixelRatio = 1;
let particles = [];
let animationFrame = 0;

function particleCount() {
  const area = width * height;
  return Math.min(105, Math.max(42, Math.floor(area / 19000)));
}

function createParticle() {
  const cyanTint = Math.random() > 0.78;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: Math.random() * 1.4 + 0.45,
    alpha: Math.random() * 0.44 + 0.18,
    color: cyanTint ? "142, 238, 255" : "255, 255, 255"
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const nextCount = particleCount();
  particles = Array.from({ length: nextCount }, (_, index) => particles[index] || createParticle());
}

function drawBackground() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#030405";
  ctx.fillRect(0, 0, width, height);
}

function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;

  if (particle.x < -20) particle.x = width + 20;
  if (particle.x > width + 20) particle.x = -20;
  if (particle.y < -20) particle.y = height + 20;
  if (particle.y > height + 20) particle.y = -20;

  if (pointer.active && !reduceMotion.matches) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 160 && distance > 1) {
      particle.x -= (dx / distance) * 0.12;
      particle.y -= (dy / distance) * 0.12;
    }
  }
}

function drawConnections() {
  const maxDistance = width < 700 ? 92 : 128;

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.16;
        ctx.strokeStyle = `rgba(142, 238, 255, ${opacity})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  particles.forEach((particle) => {
    if (!reduceMotion.matches) updateParticle(particle);

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
    ctx.fill();
  });
}

function render() {
  drawBackground();
  drawConnections();
  drawParticles();

  if (!reduceMotion.matches) {
    animationFrame = requestAnimationFrame(render);
  }
}

function restartCanvas() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  render();
}

window.addEventListener("resize", restartCanvas);
window.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  pointer.active = true;
}, { passive: true });
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});
reduceMotion.addEventListener("change", restartCanvas);

restartCanvas();
