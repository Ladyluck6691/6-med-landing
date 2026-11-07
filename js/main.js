/* =========================================================
   МедСмена — логика лендинга
   Разделы:
   1. Мобильное меню
   2. Тень у шапки при прокрутке
   3. Липкая кнопка на телефоне
   4. Подбор размера
   5. Вкладки форм
   6. Проверка и «отправка» формы
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 1. МОБИЛЬНОЕ МЕНЮ ---------- */

  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    const toggleMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      // Для скринридеров: сообщаем, открыто меню или нет
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    burger.addEventListener('click', () => {
      toggleMenu(!nav.classList.contains('is-open'));
    });

    // Клик по ссылке в меню — закрываем, иначе меню висит поверх страницы
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') toggleMenu(false);
    });

    // Esc закрывает меню
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }

  /* ---------- 2. ТЕНЬ У ШАПКИ ПРИ ПРОКРУТКЕ ---------- */

  const header = document.getElementById('header');

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  /* ---------- 3. ЛИПКАЯ КНОПКА ----------
     Полоска внизу экрана видна на телефоне всегда,
     без привязки к прокрутке — так её точно заметят. */

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // состояние применяется сразу при загрузке

  /* ---------- 4. ПОДБОР РАЗМЕРА ----------
     Таблица мерок. Держим данными, а не в if-else —
     так проще править: поменяли цифру здесь, поменялось везде. */

  const SIZE_TABLE = [
    { size: '40 / XS',  chest: 88,  hips: 94,  len: 68, hMin: 158, hMax: 166 },
    { size: '42 / S',   chest: 92,  hips: 98,  len: 70, hMin: 160, hMax: 170 },
    { size: '44 / M',   chest: 96,  hips: 102, len: 72, hMin: 164, hMax: 174 },
    { size: '46 / L',   chest: 100, hips: 106, len: 74, hMin: 168, hMax: 178 },
    { size: '48 / XL',  chest: 104, hips: 110, len: 76, hMin: 172, hMax: 182 },
    { size: '50 / XXL', chest: 108, hips: 114, len: 78, hMin: 176, hMax: 186 },
    { size: '52 / 3XL', chest: 112, hips: 118, len: 80, hMin: 180, hMax: 190 }
  ];

  const sizeForm = document.getElementById('sizeForm');
  const sizeResult = document.getElementById('sizeResult');

  if (sizeForm && sizeResult) {
    sizeForm.addEventListener('submit', (e) => {
      e.preventDefault(); // отменяем перезагрузку страницы

      const height = Number(document.getElementById('height').value);
      const chest = Number(document.getElementById('chest').value);

      // Проверка: числа вообще введены и в разумных пределах
      if (!height || !chest) {
        sizeResult.innerHTML = 'Введите рост и обхват груди — без них не посчитать';
        return;
      }

      if (chest < 70 || chest > 140 || height < 150 || height > 200) {
        sizeResult.innerHTML = 'Проверьте мерки: грудь 70–140 см, рост 150–200 см';
        return;
      }

      // Ищем первый размер, у которого обхват изделия не меньше вашего
      let match = SIZE_TABLE.find((row) => row.chest >= chest);

      // Если грудь больше самого большого размера — берём последний
      if (!match) match = SIZE_TABLE[SIZE_TABLE.length - 1];

      // Подсказка по росту
      let heightNote = '';
      if (height < match.hMin) {
        heightNote = `рост ${height} см ниже диапазона ${match.hMin}–${match.hMax} — длина может оказаться великовата, уточните у менеджера`;
      } else if (height > match.hMax) {
        heightNote = `рост ${height} см выше диапазона ${match.hMin}–${match.hMax} — проверьте длину рукава, возможно, нужен соседний размер`;
      } else {
        heightNote = `рост ${height} см попадает в диапазон ${match.hMin}–${match.hMax} — длина в порядке`;
      }

      sizeResult.innerHTML = `
        <strong>Ваш размер: ${match.size}</strong>
        Обхват груди по изделию — ${match.chest} см, бёдра — ${match.hips} см, длина — ${match.len} см.<br>
        ${heightNote}.
      `;
    });
  }

  /* ---------- 5. ВКЛАДКИ ФОРМ ---------- */

  const tabs = document.querySelectorAll('.tab');
  const formRetail = document.getElementById('formRetail');
  const formB2B = document.getElementById('formB2B');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const isRetail = tab.dataset.tab === 'retail';

      // Подсветка активной вкладки
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));

      // Показываем нужную форму, прячем другую
      if (formRetail) formRetail.classList.toggle('is-hidden', !isRetail);
      if (formB2B) formB2B.classList.toggle('is-hidden', isRetail);
    });
  });

  /* ---------- 6. ПРОВЕРКА ФОРМ ----------
     Заявка НЕ отправляется: GitHub Pages не умеет принимать данные.
     Здесь только проверка полей и сообщение об успехе. */

  const PHONE_RE = /^[\d\s()+-]{10,}$/;

  // Показывает ошибку под конкретным полем
  const setError = (input, message) => {
    const field = input.closest('.field');
    if (!field) return;

    const errorEl = field.querySelector('.field__error');
    field.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  const validateForm = (form) => {
    let valid = true;

    form.querySelectorAll('input[required]').forEach((input) => {
      const value = input.value.trim();
      let message = '';

      if (!value) {
        message = 'Заполните это поле';
      } else if (input.type === 'text' && value.length < 2) {
        message = 'Слишком коротко';
      } else if (input.type === 'tel' && !PHONE_RE.test(value)) {
        message = 'Введите телефон: минимум 10 цифр';
      }

      setError(input, message);
      if (message) valid = false;
    });

    return valid;
  };

  // Убираем ошибку, как только человек начал исправлять поле
  document.querySelectorAll('.form input').forEach((input) => {
    input.addEventListener('input', () => setError(input, ''));
  });

  const handleSubmit = (form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm(form)) return;

      const success = form.querySelector('.form__success');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      form.reset();
    });
  };

  if (formRetail) handleSubmit(formRetail);
  if (formB2B) handleSubmit(formB2B);

  /* ---------- 7. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ----------
     Нужен для Safari, который не понимает scroll-behavior из CSS.
     Заодно учитывает высоту шапки. */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
