const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const topbar = document.querySelector('.topbar');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((filter) => filter.classList.remove('active'));
    button.classList.add('active');
    const selected = button.dataset.filter;

    projects.forEach((project) => {
      const categories = project.dataset.category?.split(' ') || [];
      project.classList.toggle('hidden', selected !== 'all' && !categories.includes(selected));
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
