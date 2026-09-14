const themeToggle = document.querySelector('#theme-toggle');
const printButton = document.querySelector('#print-button');
const updatedDate = document.querySelector('#updated-date');
const currentYear = document.querySelector('#current-year');

const savedTheme = localStorage.getItem('cv-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

function updateThemeButton() {
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '○' : '◐';
  themeToggle.setAttribute('aria-label', isDark ? '切换浅色模式' : '切换深色模式');
  themeToggle.setAttribute('title', isDark ? '切换浅色模式' : '切换深色模式');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('cv-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});

printButton.addEventListener('click', () => window.print());

const now = new Date();
updatedDate.textContent = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
currentYear.textContent = now.getFullYear();
updateThemeButton();

const observer = new IntersectionObserver((entries, sectionObserver) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));