'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  $$('.reveal').forEach(el => observer.observe(el));
}
const header = $('.header');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) requestAnimationFrame(() => { header.classList.toggle('scrolled', scrollY > 18); ticking = false; });
  ticking = true;
}, { passive: true });
const navToggle = $('.nav-toggle');
const mobileNav = $('#mobile-nav');
function closeNav() { navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Открыть навигацию'); mobileNav.hidden = true; }
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
  mobileNav.hidden = !open;
});
$$('a', mobileNav).forEach(a => a.addEventListener('click', closeNav));
window.matchMedia('(min-width: 651px)').addEventListener('change', e => { if(e.matches) closeNav(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
const dishes = {
  pizza: {title:'Пицца для<br><em>вашей компании.</em>', label:'ПИЦЦЕРИЯ', image:'pizza.jpg', alt:'Иллюстрация пиццы с томатами и базиликом', text:'Собраться за большим столом, обсудить всё на свете и разделить пиццу. Простой рецепт хорошего вечера.', detail:'В «Сан-Ремо» есть пицца и блюда итальянской кухни. Виды пиццы, состав, размеры и стоимость уточняйте у кафе.', action:'Узнать меню пиццы'},
  dessert: {title:'Для сладкого<br><em>всегда есть место.</em>', label:'КОНДИТЕРСКАЯ', image:'dessert.jpg', alt:'Иллюстрация ягодного десерта', text:'К чашке кофе, для близкого человека или просто потому, что хочется. Маленькие радости не требуют особого повода.', detail:'В кафе представлены десерты, торты и пирожные. Ассортимент витрины, состав и наличие уточняйте в «Сан-Ремо».', action:'Узнать о десертах'},
  coffee: {title:'Побудем<br><em>ещё немного?</em>', label:'КОФЕ И НАПИТКИ', image:'coffee.jpg', alt:'Чашки кофе — атмосферная иллюстрация', text:'У хороших разговоров нет расписания. Возьмите любимый напиток и подарите себе немного времени.', detail:'Кофе, чай или молочный коктейль — выбирайте настроение. Актуальную карту напитков и цены подскажет кафе.', action:'Узнать о напитках'}
};
const filterDescriptions = {
  pizza:'Пицца для встреч за большим столом. Виды, состав, размеры и цены можно уточнить в кафе.',
  dessert:'Торты, пирожные и десерты к кофе. Наличие в витрине и состав уточняйте перед заказом.',
  coffee:'Кофе, чай и молочные коктейли для неспешной паузы. Актуальные варианты подскажут в кафе.'
};
$$('.filter').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  $$('.filter').forEach(el => { const active = el === button; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
  $$('.dish-card').forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
  $('#menu-grid').classList.toggle('filtered', category !== 'all');
  $('.menu-stage').classList.toggle('filtered', category !== 'all');
  $('#filter-title').textContent = {pizza:'Хорошо, когда все за одним столом.',dessert:'Сладкая пауза — тоже план.',coffee:'Время замедлиться.'}[category] || '';
  $('#filter-detail').hidden = category === 'all';
  $('#filter-description').textContent = filterDescriptions[category] || '';
}));
const dialog = $('#detail-dialog');
const dialogContent = $('#dialog-content');
let previousFocus;
function showDialog(html) {
  closeNav();
  if (!dialog.open) previousFocus = document.activeElement;
  dialogContent.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
  $('.dialog-close').focus();
}
function closeDialog() { dialog.close(); }
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus(); });
$('.dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) closeDialog();
});
function showDish(key) {
  const dish = dishes[key];
  if (!dish) return;
  showDialog(`<div class="dialog-dish"><div class="dialog-photo"><img src="assets/${dish.image}" alt="${dish.alt}"></div><div class="dialog-copy"><p class="eyebrow">${dish.label}</p><h2 id="dialog-title">${dish.title}</h2><p>${dish.text}</p><p>${dish.detail}</p><button class="button button-solid" data-contact="${dish.action}">${dish.action} <svg><use href="#arrow-up"/></svg></button><p class="demo-note">Изображение показывает визуальную концепцию, а не конкретное блюдо из меню.</p></div></div>`);
}
function showContact(title) {
  // Only fixed, locally defined labels enter the template.
  const safeTitle = title.replace(/[<>&"']/g, '');
  showDialog(`<div class="contact-dialog"><p class="eyebrow">САН-РЕМО · ДАВАЙТЕ ДОГОВОРИМСЯ</p><h2 id="dialog-title">${safeTitle}</h2><p>Выберите, как вам удобнее связаться с кафе.<br>Для бронирования назовите дату, время и количество гостей.</p><div class="contact-options"><a class="contact-option" href="tel:+78634367309"><svg><use href="#phone"/></svg><span>Позвонить</span><small>+7 (8634) 36-73-09</small></a><a class="contact-option" href="https://vk.ru/club211202409" target="_blank" rel="noopener noreferrer"><svg><use href="#arrow-up"/></svg><span>Открыть VK</span><small>Перейти в сообщество кафе</small></a></div><p class="contact-disclaimer">Бронирование и заказ подтверждаются только сотрудником кафе. Этот сайт не отправляет заявки автоматически.</p><button class="copy-phone">Скопировать номер телефона</button></div>`);
}
document.addEventListener('click', async e => {
  const dish = e.target.closest('[data-dish]');
  const contact = e.target.closest('[data-contact]');
  if (dish) showDish(dish.dataset.dish);
  else if (contact) showContact(contact.dataset.contact);
  else if (e.target.closest('[data-about]')) showDialog(`<div class="about-dialog"><p class="eyebrow">ПРЕДЛОЖЕНИЕ ДЛЯ «САН-РЕМО»</p><h2 id="dialog-title">Знакомый вкус.<br><em>Новый взгляд.</em></h2><p>Это независимая демонстрационная концепция сайта кафе-кондитерской и пиццерии «Сан-Ремо», подготовленная для обсуждения с владельцем. Это не официальный сайт кафе.</p><p>Изображения пиццы и десерта созданы с помощью ИИ. Фото кофе — <a href="https://unsplash.com/photos/coffee-in-cup-on-brown-wooden-table-zUNs99PGDg0" target="_blank" rel="noopener noreferrer">Nathan Dumlao / Unsplash</a>. Они передают настроение концепции и не показывают фактическую подачу блюд или интерьер.</p><p>Адрес, телефон и часы работы сверены по <a href="https://restaurantguru.ru/San-Remo-Taganrog" target="_blank" rel="noopener noreferrer">Restaurant Guru</a> и <a href="https://taganrog.xtool.ru/san-remo/" target="_blank" rel="noopener noreferrer">справочнику организаций</a>. Перед запуском официального сайта нужны подтверждение владельца, актуальное меню и фотографии кафе.</p><p>Платежей, регистрации и сбора персональных данных здесь нет. Кнопки телефона и соцсети ведут к внешним средствам связи.</p></div>`);
  else if (e.target.closest('.copy-phone')) {
    try { await navigator.clipboard.writeText('+7 (8634) 36-73-09'); showToast('Номер телефона скопирован'); }
    catch { showToast('Номер: +7 (8634) 36-73-09'); }
  }
});
let toastTimeout;
function showToast(message) { const toast = $('.toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3500); }
$$('.occasion-list details').forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) $$('.occasion-list details').forEach(other => { if (other !== detail) other.open = false; });
}));
