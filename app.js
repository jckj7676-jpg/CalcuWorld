/* ============================================================
   CalcuWorld — Application Logic
   Vanilla JS, no dependencies. All calculations client-side.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmt = {
    currency: (n) => '$' + (isFinite(n) ? n : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    number: (n, d = 2) => (isFinite(n) ? n : 0).toFixed(d),
    percent: (n, d = 2) => (isFinite(n) ? n : 0).toFixed(d) + '%',
  };

  const num = (v, fallback = 0) => {
    const n = parseFloat(v);
    return isFinite(n) ? n : fallback;
  };

  const onInput = (el, handler) => {
    if (!el) return;
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  };

  const inputField = (id, label, value = '', attrs = '') => `
    <div class="input-group">
      <label for="${id}">${label}</label>
      <input type="number" id="${id}" value="${value}" ${attrs} inputmode="decimal" />
      <span class="input-error" id="${id}-error" aria-live="polite"></span>
    </div>
  `;

  const selectField = (id, label, options, value = '') => `
    <div class="input-group">
      <label for="${id}">${label}</label>
      <select id="${id}">
        ${options.map(o => `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>
    </div>
  `;

  /**
   * Validates a numeric input. Returns parsed number, or null if invalid.
   * Sets `aria-invalid` + inline error message automatically.
   */
  const validatePositive = (el, { allowZero = false, allowNegative = false } = {}) => {
    const raw = el.value;
    const v = num(raw, NaN);
    const errEl = document.getElementById(el.id + '-error');
    let msg = '';

    if (raw.trim() === '') msg = 'Required field.';
    else if (!isFinite(v)) msg = 'Please enter a valid number.';
    else if (!allowNegative && !allowZero && v <= 0) msg = 'Must be greater than zero.';
    else if (!allowNegative && allowZero && v < 0) msg = 'Cannot be negative.';

    if (msg) {
      el.classList.add('invalid');
      el.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = msg;
      return null;
    }
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
    if (errEl) errEl.textContent = '';
    return v;
  };

  const safeDiv = (a, b) => (b === 0 ? 0 : a / b);

  /* ============================================================
     THEME
     ============================================================ */
  const themeToggle = $('#themeToggle');
  const applyTheme = (theme) => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
      const ic = themeToggle.querySelector('.theme-icon');
      if (ic) ic.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  };
  applyTheme(localStorage.getItem('calchub-theme') || 'light');
  themeToggle?.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('calchub-theme', next);
  });

  /* ============================================================
     LANGUAGE
     ============================================================ */
  const i18n = {
    en: {
      'hero.title': 'Free Online Calculators for Every Need',
      'hero.subtitle': 'Fast, accurate and privacy-friendly calculators for finance, health, math and everyday life — everything runs instantly in your browser.',
      'section.categories': 'Browse by Category',
    },
    ar: {
      'hero.title': 'آلات حاسبة مجانية عبر الإنترنت لكل احتياجاتك',
      'hero.subtitle': 'آلات حاسبة سريعة ودقيقة وخصوصية للتمويل والصحة والرياضيات والحياة اليومية — كل شيء يعمل فورًا في متصفحك.',
      'section.categories': 'تصفح حسب الفئة',
    },
    es: {
      'hero.title': 'Calculadoras en línea gratuitas para cada necesidad',
      'hero.subtitle': 'Calculadoras rápidas, precisas y respetuosas con la privacidad para finanzas, salud, matemáticas y vida diaria — todo funciona al instante en tu navegador.',
      'section.categories': 'Explorar por categoría',
    },
    fr: {
      'hero.title': 'Calculatrices en ligne gratuites pour tous vos besoins',
      'hero.subtitle': 'Calculatrices rapides, précises et respectueuses de la vie privée pour la finance, la santé, les mathématiques et la vie quotidienne — tout fonctionne instantanément dans votre navigateur.',
      'section.categories': 'Parcourir par catégorie',
    },
    de: {
      'hero.title': 'Kostenlose Online-Rechner für jeden Bedarf',
      'hero.subtitle': 'Schnelle, genaue und datenschutzfreundliche Rechner für Finanzen, Gesundheit, Mathematik und Alltag — alles sofort im Browser.',
      'section.categories': 'Nach Kategorie durchsuchen',
    },
  };

  const langSelect = $('#langSelect');
  const applyLang = (lang) => {
    const dict = i18n[lang] || i18n.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
  };
  langSelect?.addEventListener('change', (e) => {
    applyLang(e.target.value);
    localStorage.setItem('calchub-lang', e.target.value);
  });
  applyLang(localStorage.getItem('calchub-lang') || 'en');

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const mobileBtn = $('#mobileMenuBtn');
  const mainNav = $('#main-nav');
  mobileBtn?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      mainNav.style.display = 'block';
      mainNav.style.position = 'absolute';
      mainNav.style.top = '100%';
      mainNav.style.left = '0';
      mainNav.style.right = '0';
      mainNav.style.background = 'var(--bg-card)';
      mainNav.style.padding = '1rem';
      mainNav.style.borderBottom = '1px solid var(--border-light)';
      mainNav.style.zIndex = '99';
      $$('.nav-list', mainNav).forEach(ul => {
        ul.style.flexDirection = 'column';
        ul.style.alignItems = 'flex-start';
      });
    } else {
      ['display','position','top','left','right','background','padding','borderBottom','zIndex'].forEach(p => {
        mainNav.style[p] = '';
      });
      $$('.nav-list', mainNav).forEach(ul => {
        ul.style.flexDirection = '';
        ul.style.alignItems = '';
      });
    }
  });

  /* ============================================================
     SEARCH
     ============================================================ */
  const filterCards = (query) => {
    const q = (query || '').trim().toLowerCase();
    $$('.category-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = !q || text.includes(q) ? '' : 'none';
    });
  };
  const heroSearch = $('#heroSearch');
  const heroSearchBtn = $('#heroSearchBtn');
  const globalSearch = $('#globalSearch');
  heroSearchBtn?.addEventListener('click', () => filterCards(heroSearch.value));
  heroSearch?.addEventListener('keydown', (e) => { if (e.key === 'Enter') filterCards(heroSearch.value); });
  globalSearch?.addEventListener('input', (e) => filterCards(e.target.value));

  /* ============================================================
     PANEL
     ============================================================ */
  const panel = $('#calculatorPanel');
  const panelTitle = $('#panelTitle');
  const panelContent = $('#panelContent');

  const openPanel = (title, html, initFn) => {
    panelTitle.textContent = title;
    panelContent.innerHTML = html;
    panel.hidden = false;
    if (typeof initFn === 'function') initFn();
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const closePanel = () => {
    panel.hidden = true;
    panelContent.innerHTML = '';
  };
  $('#closePanelBtn')?.addEventListener('click', closePanel);

  $('#shareBtn')?.addEventListener('click', async () => {
    const data = { title: panelTitle.textContent, text: 'Check out this calculator on CalcuWorld!', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }
    } catch { /* user cancelled */ }
  });
  $('#printBtn')?.addEventListener('click', () => window.print());

  /* ============================================================
     CALCULATORS
     ============================================================ */
  const calculators = {};

  /* ---------- MORTGAGE ---------- */
  calculators.mortgage = {
    title: 'Mortgage Loan Calculator',
    html: () => `
      ${inputField('mortgageAmount', 'Loan Amount ($)', 250000, 'min="0" step="1000"')}
      ${inputField('mortgageRate', 'Annual Interest Rate (%)', 5.5, 'min="0" step="0.01"')}
      ${inputField('mortgageTerm', 'Loan Term (years)', 30, 'min="1" max="50" step="1"')}
      <div class="result-box">
        <span>Monthly Payment</span>
        <span class="result-value" id="mortgageResult">—</span>
      </div>
      <div class="steps-note">
        <strong>Formula:</strong> M = P·[r(1+r)ⁿ] / [(1+r)ⁿ − 1],
        where <code>P</code> is principal, <code>r</code> is monthly rate, <code>n</code> is number of payments.
        <br><em>Estimates only — taxes, insurance and fees not included.</em>
      </div>
    `,
    init: () => {
      const amount = $('#mortgageAmount');
      const rate = $('#mortgageRate');
      const term = $('#mortgageTerm');
      const result = $('#mortgageResult');

      const calc = () => {
        const P = validatePositive(amount, { allowZero: true });
        const annualRate = validatePositive(rate, { allowZero: true });
        const years = validatePositive(term);
        if (P === null || annualRate === null || years === null) { result.textContent = '—'; return; }

        const r = annualRate / 100 / 12;
        const n = years * 12;
        let monthly;
        if (r === 0) monthly = safeDiv(P, n);
        else monthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        result.textContent = fmt.currency(monthly);
      };
      [amount, rate, term].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- PERSONAL LOAN ---------- */
  calculators['personal-loan'] = {
    title: 'Personal Loan Calculator',
    html: () => `
      ${inputField('plAmount', 'Loan Amount ($)', 10000, 'min="0" step="100"')}
      ${inputField('plRate', 'Annual Interest Rate (%)', 8, 'min="0" step="0.01"')}
      ${inputField('plTerm', 'Term (months)', 36, 'min="1" max="600" step="1"')}
      <div class="result-box">
        <span>Monthly Payment</span>
        <span class="result-value" id="plResult">—</span>
      </div>
      <div class="steps-note"><strong>Formula:</strong> EMI = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1)</div>
    `,
    init: () => {
      const P = $('#plAmount'), r = $('#plRate'), n = $('#plTerm'), out = $('#plResult');
      const calc = () => {
        const p = validatePositive(P, { allowZero: true });
        const ar = validatePositive(r, { allowZero: true });
        const months = validatePositive(n);
        if (p === null || ar === null || months === null) { out.textContent = '—'; return; }
        const mr = ar / 100 / 12;
        const emi = mr === 0 ? safeDiv(p, months) : p * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1);
        out.textContent = fmt.currency(emi);
      };
      [P, r, n].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- COMPOUND INTEREST ---------- */
  calculators['compound-interest'] = {
    title: 'Compound Interest Calculator',
    html: () => `
      ${inputField('ciPrincipal', 'Principal ($)', 5000, 'min="0" step="100"')}
      ${inputField('ciRate', 'Annual Interest Rate (%)', 7, 'min="0" step="0.01"')}
      ${inputField('ciYears', 'Time (years)', 10, 'min="1" max="100" step="1"')}
      ${selectField('ciFreq', 'Compounding Frequency', [
        { value: '1', label: 'Annually' },
        { value: '4', label: 'Quarterly' },
        { value: '12', label: 'Monthly' },
        { value: '365', label: 'Daily' },
      ], '12')}
      <div class="result-box">
        <span>Future Value</span>
        <span class="result-value" id="ciResult">—</span>
      </div>
      <div class="steps-note"><strong>Formula:</strong> A = P·(1 + r/n)<sup>n·t</sup></div>
    `,
    init: () => {
      const P = $('#ciPrincipal'), r = $('#ciRate'), t = $('#ciYears'), f = $('#ciFreq'), out = $('#ciResult');
      const calc = () => {
        const p = validatePositive(P, { allowZero: true });
        const ar = validatePositive(r, { allowZero: true });
        const years = validatePositive(t);
        if (p === null || ar === null || years === null) { out.textContent = '—'; return; }
        const n = num(f.value, 1);
        const A = p * Math.pow(1 + ar / 100 / n, n * years);
        out.textContent = fmt.currency(A);
      };
      [P, r, t, f].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- SALES TAX ---------- */
  calculators['sales-tax'] = {
    title: 'Sales Tax Calculator',
    html: () => `
      ${inputField('stAmount', 'Amount ($)', 100, 'min="0" step="0.01"')}
      ${inputField('stRate', 'Sales Tax Rate (%)', 8.5, 'min="0" step="0.01"')}
      <div class="result-box">
        <span>Total with Tax</span>
        <span class="result-value" id="stResult">—</span>
      </div>
      <div class="steps-note"><strong>Formula:</strong> Total = Amount × (1 + Rate/100)</div>
    `,
    init: () => {
      const a = $('#stAmount'), r = $('#stRate'), out = $('#stResult');
      const calc = () => {
        const amt = validatePositive(a, { allowZero: true });
        const rate = validatePositive(r, { allowZero: true });
        if (amt === null || rate === null) { out.textContent = '—'; return; }
        out.textContent = fmt.currency(amt * (1 + rate / 100));
      };
      [a, r].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- BMI ---------- */
  calculators.bmi = {
    title: 'BMI (Body Mass Index) Calculator',
    html: () => `
      ${inputField('bmiWeight', 'Weight (kg)', 70, 'min="0" step="0.1"')}
      ${inputField('bmiHeight', 'Height (cm)', 175, 'min="1" step="0.1"')}
      <div class="result-box">
        <span>BMI</span>
        <span class="result-value" id="bmiResult">—</span>
      </div>
      <div class="steps-note">
        <strong>Formula:</strong> BMI = weight (kg) / height² (m²).
        Adult categories: &lt;18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, ≥30 obese.
      </div>
    `,
    init: () => {
      const w = $('#bmiWeight'), h = $('#bmiHeight'), out = $('#bmiResult');
      const calc = () => {
        const weight = validatePositive(w);
        const heightCm = validatePositive(h);
        if (weight === null || heightCm === null) { out.textContent = '—'; return; }
        const m = heightCm / 100;
        const bmi = safeDiv(weight, m * m);
        out.textContent = fmt.number(bmi, 1);
      };
      [w, h].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- TDEE ---------- */
  calculators.tdee = {
    title: 'Calorie / TDEE Calculator',
    html: () => `
      ${inputField('tdeeWeight', 'Weight (kg)', 70, 'min="0" step="0.1"')}
      ${inputField('tdeeHeight', 'Height (cm)', 175, 'min="1" step="0.1"')}
      ${inputField('tdeeAge', 'Age (years)', 30, 'min="1" max="120" step="1"')}
      ${selectField('tdeeGender', 'Gender', [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ], 'male')}
      ${selectField('tdeeActivity', 'Activity Level', [
        { value: '1.2', label: 'Sedentary (little/no exercise)' },
        { value: '1.375', label: 'Light (1–3 days/week)' },
        { value: '1.55', label: 'Moderate (3–5 days/week)' },
        { value: '1.725', label: 'Very active (6–7 days/week)' },
        { value: '1.9', label: 'Extra active (physical job)' },
      ], '1.375')}
      <div class="result-box">
        <span>TDEE (calories/day)</span>
        <span class="result-value" id="tdeeResult">—</span>
      </div>
      <div class="steps-note">
        <strong>Method:</strong> Mifflin–St Jeor equation × activity factor.
        BMR = 10·weight + 6.25·height − 5·age + (male ? +5 : −161).
      </div>
    `,
    init: () => {
      const w = $('#tdeeWeight'), h = $('#tdeeHeight'), age = $('#tdeeAge'),
            g = $('#tdeeGender'), act = $('#tdeeActivity'), out = $('#tdeeResult');
      const calc = () => {
        const weight = validatePositive(w);
        const height = validatePositive(h);
        const a = validatePositive(age);
        if (weight === null || height === null || a === null) { out.textContent = '—'; return; }
        const isMale = g.value === 'male';
        const bmr = 10 * weight + 6.25 * height - 5 * a + (isMale ? 5 : -161);
        const tdee = bmr * num(act.value, 1.2);
        out.textContent = Math.round(tdee).toLocaleString('en-US');
      };
      [w, h, age, g, act].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- BODY FAT ---------- */
  calculators['body-fat'] = {
    title: 'Body Fat Percentage Calculator',
    html: () => `
      ${selectField('bfGender', 'Gender', [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ], 'male')}
      ${inputField('bfAge', 'Age (years)', 30, 'min="1" max="120" step="1"')}
      ${inputField('bfWeight', 'Weight (kg)', 70, 'min="0" step="0.1"')}
      ${inputField('bfHeight', 'Height (cm)', 175, 'min="1" step="0.1"')}
      ${inputField('bfNeck', 'Neck circumference (cm)', 38, 'min="1" step="0.1"')}
      ${inputField('bfWaist', 'Waist circumference (cm)', 85, 'min="1" step="0.1"')}
      ${inputField('bfHip', 'Hip circumference (cm, female only)', 95, 'min="0" step="0.1"')}
      <div class="result-box">
        <span>Body Fat</span>
        <span class="result-value" id="bfResult">—</span>
      </div>
      <div class="steps-note">
        <strong>Method:</strong> U.S. Navy circumference formula. <em>Estimate only, not a medical diagnosis.</em>
      </div>
    `,
    init: () => {
      const g = $('#bfGender'), a = $('#bfAge'), w = $('#bfWeight'), h = $('#bfHeight'),
            neck = $('#bfNeck'), waist = $('#bfWaist'), hip = $('#bfHip'), out = $('#bfResult');
      const calc = () => {
        const age = validatePositive(a), weight = validatePositive(w),
              height = validatePositive(h), n = validatePositive(neck), wa = validatePositive(waist);
        if (age === null || weight === null || height === null || n === null || wa === null) {
          out.textContent = '—'; return;
        }
        let bf;
        try {
          if (g.value === 'male') {
            if (wa - n <= 0) { out.textContent = '—'; return; }
            bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(height)) - 450;
          } else {
            const hp = validatePositive(hip);
            if (hp === null) { out.textContent = '—'; return; }
            if (wa + hp - n <= 0) { out.textContent = '—'; return; }
            bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + hp - n) + 0.22100 * Math.log10(height)) - 450;
          }
        } catch { out.textContent = '—'; return; }
        if (!isFinite(bf) || bf < 0) { out.textContent = '—'; return; }
        out.textContent = fmt.percent(bf, 1);
      };
      [g, a, w, h, neck, waist, hip].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- SCIENTIFIC ---------- */
  calculators.scientific = {
    title: 'Scientific Calculator',
    html: () => `
      <div class="input-group">
        <label for="sciExpr">Expression</label>
        <input type="text" id="sciExpr" value="2 + 2 * 3" placeholder="e.g. sin(30) + log(100)" />
        <span class="input-error" id="sciExpr-error" aria-live="polite"></span>
      </div>
      <div class="result-box">
        <span>Result</span>
        <span class="result-value" id="sciResult">—</span>
      </div>
      <div class="steps-note">
        <strong>Supported:</strong> + − × ÷, parentheses, <code>sin</code>, <code>cos</code>, <code>tan</code>,
        <code>log</code> (base 10), <code>ln</code>, <code>sqrt</code>, <code>^</code>, <code>PI</code>, <code>E</code>.
        Trig functions use radians.
      </div>
    `,
    init: () => {
      const expr = $('#sciExpr'), out = $('#sciResult'), err = $('#sciExpr-error');
      const calc = () => {
        const raw = expr.value.trim();
        if (!raw) { out.textContent = '—'; err.textContent = ''; expr.classList.remove('invalid'); return; }
        try {
          const safe = raw
            .replace(/\b(sin|cos|tan)\s*\(/gi, (_, fn) => `Math.${fn.toLowerCase()}(`)
            .replace(/\blog\s*\(/gi, 'Math.log10(')
            .replace(/\bln\s*\(/gi, 'Math.log(')
            .replace(/\bsqrt\s*\(/gi, 'Math.sqrt(')
            .replace(/\bPI\b/g, 'Math.PI')
            .replace(/\bE\b/g, 'Math.E')
            .replace(/\^/g, '**');
          if (/[a-zA-Z]/.test(safe.replace(/Math\.[a-zA-Z]+/g, ''))) throw new Error('Invalid chars');
          const result = Function('"use strict"; return (' + safe + ')')();
          if (typeof result !== 'number' || !isFinite(result)) throw new Error('Invalid result');
          out.textContent = result.toLocaleString('en-US', { maximumFractionDigits: 10 });
          err.textContent = '';
          expr.classList.remove('invalid');
        } catch {
          out.textContent = '—';
          err.textContent = 'Invalid expression.';
          expr.classList.add('invalid');
        }
      };
      onInput(expr, calc);
      calc();
    },
  };

  /* ---------- UNIT CONVERTER ---------- */
  calculators['unit-converter'] = {
    title: 'Unit Converter',
    html: () => {
      const lengthUnits = { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.344, yd: 0.9144 };
      const massUnits = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.0283495 };
      const tempUnits = { c: 'C', f: 'F', k: 'K' };
      const opts = [
        ...Object.keys(lengthUnits).map(u => ({ v: 'len:' + u, l: u.toUpperCase() + ' (length)' })),
        ...Object.keys(massUnits).map(u => ({ v: 'mass:' + u, l: u.toUpperCase() + ' (mass)' })),
        ...Object.keys(tempUnits).map(u => ({ v: 'temp:' + u, l: u.toUpperCase() + ' (temperature)' })),
      ];
      return `
        ${inputField('ucValue', 'Value', 1, 'step="any"')}
        <div class="input-group">
          <label for="ucFrom">From</label>
          <select id="ucFrom">${opts.map(o => `<option value="${o.v}" ${o.v === 'len:m' ? 'selected' : ''}>${o.l}</option>`).join('')}</select>
        </div>
        <div class="input-group">
          <label for="ucTo">To</label>
          <select id="ucTo">${opts.map(o => `<option value="${o.v}" ${o.v === 'len:km' ? 'selected' : ''}>${o.l}</option>`).join('')}</select>
        </div>
        <div class="result-box">
          <span>Result</span>
          <span class="result-value" id="ucResult">—</span>
        </div>
        <div class="steps-note">Conversions are performed via base SI units. Temperature uses exact formulas.</div>
      `;
    },
    init: () => {
      const val = $('#ucValue'), from = $('#ucFrom'), to = $('#ucTo'), out = $('#ucResult');
      const lengthUnits = { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.344, yd: 0.9144 };
      const massUnits = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.0283495 };

      const parse = (v) => {
        const [kind, unit] = v.split(':');
        return { kind, unit };
      };

      const calc = () => {
        const v = num(val.value, NaN);
        if (!isFinite(v)) { out.textContent = '—'; return; }
        const f = parse(from.value);
        const t = parse(to.value);

        if (f.kind !== t.kind) { out.textContent = '—'; out.title = 'Cannot convert between different categories.'; return; }
        out.title = '';

        let result;
        if (f.kind === 'temp') {
          let c;
          if (f.unit === 'c') c = v;
          else if (f.unit === 'f') c = (v - 32) * 5 / 9;
          else c = v - 273.15;
          if (t.unit === 'c') result = c;
          else if (t.unit === 'f') result = c * 9 / 5 + 32;
          else result = c + 273.15;
        } else {
          const units = f.kind === 'len' ? lengthUnits : massUnits;
          const base = v * units[f.unit];
          result = base / units[t.unit];
        }
        out.textContent = isFinite(result) ? result.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '—';
      };
      [val, from, to].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- PERCENTAGE ---------- */
  calculators.percentage = {
    title: 'Percentage Calculator',
    html: () => `
      <div class="input-row">
        ${inputField('pX', 'Percentage (X%)', 20, 'step="any"')}
        ${inputField('pY', 'Of value (Y)', 150, 'step="any"')}
      </div>
      <div class="result-box">
        <span>X% of Y</span>
        <span class="result-value" id="pResult">—</span>
      </div>
      <div class="steps-note"><strong>Formula:</strong> X% of Y = (X / 100) × Y</div>
    `,
    init: () => {
      const x = $('#pX'), y = $('#pY'), out = $('#pResult');
      const calc = () => {
        const X = num(x.value, NaN);
        const Y = num(y.value, NaN);
        if (!isFinite(X) || !isFinite(Y)) { out.textContent = '—'; return; }
        out.textContent = ((X / 100) * Y).toLocaleString('en-US', { maximumFractionDigits: 6 });
      };
      [x, y].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- AGE ---------- */
  calculators.age = {
    title: 'Age Calculator',
    html: () => `
      <div class="input-group">
        <label for="ageDob">Date of Birth</label>
        <input type="date" id="ageDob" value="1990-01-01" />
        <span class="input-error" id="ageDob-error" aria-live="polite"></span>
      </div>
      <div class="result-box">
        <span>Your age</span>
        <span class="result-value" id="ageResult">—</span>
      </div>
      <div class="steps-note">Age is calculated relative to today's date in your local timezone.</div>
    `,
    init: () => {
      const dob = $('#ageDob'), out = $('#ageResult'), err = $('#ageDob-error');
      const calc = () => {
        if (!dob.value) { out.textContent = '—'; err.textContent = 'Please choose a date.'; return; }
        const birth = new Date(dob.value);
        const now = new Date();
        if (isNaN(birth.getTime()) || birth > now) {
          out.textContent = '—';
          err.textContent = 'Date must be in the past.';
          dob.classList.add('invalid');
          return;
        }
        err.textContent = '';
        dob.classList.remove('invalid');
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        out.textContent = `${years}y ${months}m ${days}d`;
      };
      onInput(dob, calc);
      calc();
    },
  };

  /* ---------- DATE DIFF ---------- */
  calculators['date-diff'] = {
    title: 'Date Difference Calculator',
    html: () => `
      <div class="input-group">
        <label for="diffStart">Start Date</label>
        <input type="date" id="diffStart" value="2025-01-01" />
      </div>
      <div class="input-group">
        <label for="diffEnd">End Date</label>
        <input type="date" id="diffEnd" value="2025-12-31" />
      </div>
      <div class="result-box">
        <span>Difference</span>
        <span class="result-value" id="diffResult">—</span>
      </div>
    `,
    init: () => {
      const s = $('#diffStart'), e = $('#diffEnd'), out = $('#diffResult');
      const calc = () => {
        if (!s.value || !e.value) { out.textContent = '—'; return; }
        const start = new Date(s.value), end = new Date(e.value);
        if (isNaN(start) || isNaN(end)) { out.textContent = '—'; return; }
        const diffMs = Math.abs(end - start);
        const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
        out.textContent = days + ' day' + (days === 1 ? '' : 's');
      };
      [s, e].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ---------- TIP ---------- */
  calculators.tip = {
    title: 'Tip Calculator',
    html: () => `
      ${inputField('tipBill', 'Bill Amount ($)', 50, 'min="0" step="0.01"')}
      ${inputField('tipPercent', 'Tip (%)', 15, 'min="0" step="0.5"')}
      ${inputField('tipPeople', 'Split between (people)', 1, 'min="1" step="1"')}
      <div class="result-box">
        <span>Total / Per person</span>
        <span class="result-value" id="tipResult">—</span>
      </div>
    `,
    init: () => {
      const bill = $('#tipBill'), pct = $('#tipPercent'), ppl = $('#tipPeople'), out = $('#tipResult');
      const calc = () => {
        const b = validatePositive(bill, { allowZero: true });
        const p = validatePositive(pct, { allowZero: true });
        const n = validatePositive(ppl);
        if (b === null || p === null || n === null) { out.textContent = '—'; return; }
        const total = b * (1 + p / 100);
        const per = safeDiv(total, n);
        out.textContent = `${fmt.currency(total)} (${fmt.currency(per)}/person)`;
      };
      [bill, pct, ppl].forEach(el => onInput(el, calc));
      calc();
    },
  };

  /* ============================================================
     OPEN / CLOSE
     ============================================================ */
  const openCalculator = (key) => {
    const calc = calculators[key];
    if (!calc) return;
    // Return to home view if we're on a static page
    showHome();
    openPanel(calc.title, calc.html(), calc.init);
    history.replaceState(null, '', '#' + key);
  };

  $$('.category-card').forEach(card => {
    card.addEventListener('click', () => openCalculator(card.dataset.calc));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCalculator(card.dataset.calc); }
    });
  });

  $$('[data-calc]').forEach(el => {
    el.addEventListener('click', (e) => {
      const key = el.getAttribute('data-calc');
      if (key && calculators[key]) { e.preventDefault(); openCalculator(key); }
    });
  });

  /* ============================================================
     ROUTER — static compliance pages
     ============================================================ */
  const viewHome = $('#view-home');
  const viewStatic = $('#view-static');

  const pages = {
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: January 2025',
      body: `
        <p>CalcuWorld ("we", "us") respects your privacy. This policy explains what data is (and isn't) collected when you use our calculators.</p>

        <h2>1. Information We Collect</h2>
        <p>All calculator computations run entirely in your browser. We do not transmit, store, or process the numbers you enter into any calculator. Your inputs never leave your device.</p>

        <h2>2. Cookies &amp; Local Storage</h2>
        <p>We use <code>localStorage</code> to remember your theme (light/dark) and language preferences. You can clear these at any time from your browser settings.</p>

        <h2>3. Advertising</h2>
        <p>We may display advertising via Google AdSense. Google and its partners may use cookies to serve ads based on your prior visits to this website or other websites. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">google.com/settings/ads</a>.</p>

        <h2>4. Analytics</h2>
        <p>If enabled, aggregate, anonymized analytics (e.g., page views) may be collected to improve the site. No calculator inputs are ever included.</p>

        <h2>5. Your Rights</h2>
        <p>You may request details about any personal data we hold by contacting us via the <a href="#/contact">Contact page</a>. Under GDPR/CCPA you have rights to access, correct, and delete personal data.</p>

        <h2>6. Contact</h2>
        <p>Questions? Reach out through our <a href="#/contact">Contact page</a>.</p>
      `,
    },
    terms: {
      title: 'Terms of Service',
      updated: 'Last updated: January 2025',
      body: `
        <p>By accessing CalcuWorld you agree to these terms. If you do not agree, please discontinue use.</p>

        <h2>1. Use of Service</h2>
        <p>CalcuWorld provides free online calculators for personal, non-commercial use. You agree not to misuse the site, attempt unauthorized access, or scrape content without permission.</p>

        <h2>2. No Professional Advice</h2>
        <p>Calculator results are provided for informational and educational purposes only. They are <strong>not</strong> financial, medical, legal or tax advice. Consult a qualified professional before making important decisions.</p>

        <h2>3. Accuracy</h2>
        <p>We strive for accuracy using standard published formulas but make no warranty that results are error-free. Always verify critical calculations independently.</p>

        <h2>4. Intellectual Property</h2>
        <p>Content, design and code are the property of CalcuWorld unless otherwise noted. You may not republish materials without written permission.</p>

        <h2>5. Limitation of Liability</h2>
        <p>CalcuWorld is not liable for any damages arising from use of or reliance on the calculators.</p>

        <h2>6. Changes</h2>
        <p>We may update these terms from time to time. Continued use after changes constitutes acceptance.</p>

        <h2>7. Governing Law</h2>
        <p>These terms are governed by the laws of your jurisdiction of residence, to the extent permitted by law.</p>
      `,
    },
    cookies: {
      title: 'Cookie Policy',
      updated: 'Last updated: January 2025',
      body: `
        <p>This Cookie Policy explains how CalcuWorld uses cookies and similar technologies.</p>

        <h2>1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device by your browser. They help websites remember preferences and serve relevant advertising.</p>

        <h2>2. Cookies We Use</h2>
        <ul>
          <li><strong>Essential:</strong> We use <code>localStorage</code> (not a cookie, technically) to remember your theme and language choice.</li>
          <li><strong>Advertising:</strong> Third-party partners such as Google AdSense may set cookies to serve personalized or non-personalized ads.</li>
        </ul>

        <h2>3. Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Disabling cookies may affect some site features but calculator functionality is unaffected.</p>

        <h2>4. Third-Party Opt-Out</h2>
        <p>To opt out of personalized Google advertising, visit <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">google.com/settings/ads</a>. For EU users, visit <a href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">youronlinechoices.eu</a>.</p>
      `,
    },
    about: {
      title: 'About CalcuWorld',
      updated: '',
      body: `
        <p>CalcuWorld is a free, privacy-first collection of online calculators for finance, health, math and everyday life. Every calculator is built to be fast, accurate and fully functional in your browser — no sign-up, no tracking, no data sent to a server.</p>

        <h2>Our Mission</h2>
        <p>We believe useful tools should be free, fast, and respectful of privacy. CalcuWorld exists to give you instant answers without cluttering your screen with pop-ups or forcing you to create an account.</p>

        <h2>What We Offer</h2>
        <ul>
          <li>Financial calculators — mortgage, personal loans, compound interest, sales tax.</li>
          <li>Health &amp; fitness — BMI, TDEE, body fat.</li>
          <li>Math &amp; conversion — scientific, unit converter, percentage.</li>
          <li>Everyday utilities — age, date difference, tip splitting.</li>
        </ul>

        <h2>How It Works</h2>
        <p>All calculators are built in vanilla JavaScript. When you type in a value, the result updates instantly in your browser. The numbers you enter never leave your device — there's no backend, no database, and no logging.</p>

        <h2>Contact</h2>
        <p>Questions, suggestions or feedback? Use our <a href="#/contact">Contact page</a> — we read every message.</p>
      `,
    },
    contact: {
      title: 'Contact Us',
      updated: '',
      body: `
        <p>We'd love to hear from you. Whether it's a bug report, a feature request, or a question about our calculators — reach out anytime.</p>

        <h2>Email</h2>
        <p>General inquiries: <a href="mailto:mobilemazzaya448@gmail.com">hello@calcworld.example.com</a><br>
        Advertising: <a href="mailto:jckj7676@gmail.com">ads@calcworld.example.com</a><br>
        Privacy &amp; legal: <a href="mailto:nngnngf@gmail.com">legal@calcworld.example.com</a></p>

        <h2>Response Time</h2>
        <p>We aim to respond to all messages within 2 business days.</p>
 <h2>Mailing Address</h2>
<p>CalcuWorld<br>
2 Malak Hefni, An Nasereyah<br>
Third Al Montazah, Alexandria<br>
Governorate 5523113, Egypt</p>


        <h2>Report an Issue</h2>
        <p>If a calculator returns an incorrect result, please include the calculator name, inputs you used, and the result you expected. This helps us fix issues quickly.</p>
      `,
    },
  };

  const renderStatic = (key) => {
    const page = pages[key];
    if (!page) return false;
    viewHome.hidden = true;
    viewStatic.hidden = false;
    viewStatic.innerHTML = `
      <h1>${page.title}</h1>
      ${page.updated ? `<p class="updated">${page.updated}</p>` : ''}
      ${page.body}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  const showHome = () => {
    viewStatic.hidden = true;
    viewHome.hidden = false;
  };

  const router = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && pages[hash]) {
      renderStatic(hash);
    } else if (hash && calculators[hash]) {
      showHome();
      openCalculator(hash);
    } else if (!hash || hash === '' || hash === '/') {
      showHome();
      closePanel();
    }
  };

  window.addEventListener('hashchange', router);
  router();

  /* ============================================================
     MISC
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  $$('form').forEach(f => f.addEventListener('submit', e => e.preventDefault()));

})();
