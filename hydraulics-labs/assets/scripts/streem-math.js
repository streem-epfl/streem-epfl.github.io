/* Local KaTeX bridge for the STREEM laboratories.
   `data-tex` contains authored LaTeX; `data-tex-legacy` is used for the existing
   generated worked-solution equations while those strings are migrated to authored TeX. */
(function () {
  'use strict';

  const SUBS = { '₀':'0', '₁':'1', '₂':'2', '₃':'3', '₄':'4', '₅':'5', '₆':'6', '₇':'7', '₈':'8', '₉':'9' };
  const SUPS = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁺':'+', '⁻':'-' };
  const SYMBOLS = [
    [/×/g, '\\times '], [/·/g, '\\cdot '], [/÷/g, '\\div '],
    [/γ/g, '\\gamma '], [/ρ/g, '\\rho '], [/θ/g, '\\theta '], [/Δ/g, '\\Delta '],
    [/α/g, '\\alpha '], [/β/g, '\\beta '], [/ξ/g, '\\xi '], [/π/g, '\\pi '],
    [/∞/g, '\\infty '], [/→/g, '\\to '], [/−/g, '-'],
    [/꜀/g, '_c']
  ];

  function proseToTex(tex) {
    tex = tex.replace(/\bi\.e\./g, '\\text{i.e.}');
    return tex.replace(/[A-Za-z]{2,}(?:[ -]+[A-Za-z]{2,})*/g, (match, offset, source) => {
      const previous = source[offset - 1] || '';
      return previous === '\\' || /[A-Za-z]/.test(previous) ? match : `\\text{${match}}`;
    });
  }

  function legacyToTex(source) {
    const holder = document.createElement('div');
    const markup = source
      .replace(/<sub>([\s\S]*?)<\/sub>/gi, '_{$1}')
      .replace(/<sup>([\s\S]*?)<\/sup>/gi, '^{$1}')
      .replace(/<br\s*\/?>/gi, ' \\\\ ');
    holder.innerHTML = markup;
    let tex = holder.textContent.replace(/\u00a0/g, ' ').trim();
    tex = tex.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, run => `_{${[...run].map(c => SUBS[c]).join('')}}`);
    tex = tex.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, run => `^{${[...run].map(c => SUPS[c]).join('')}}`);
    tex = tex.replace(/√\s*\(([^()]*)\)/g, '\\sqrt{$1}');
    tex = tex.replace(/√/g, '\\sqrt{}');
    SYMBOLS.forEach(([find, replace]) => { tex = tex.replace(find, replace); });
    tex = tex.replace(/\b(sin|cos|tan|asin)\b/g, '\\$1');
    tex = proseToTex(tex);
    tex = tex.replace(/%/g, '\\%');
    tex = tex.replace(/°/g, '^{\\circ}');
    return tex;
  }

  function sourceFor(element) {
    if (element.dataset.texLegacy !== undefined) return legacyToTex(decodeURIComponent(element.dataset.texLegacy));
    return element.dataset.tex || '';
  }

  function render(element, tex, displayMode) {
    if (!window.katex || !element) return false;
    const expression = tex === undefined ? sourceFor(element) : tex;
    if (!expression) return false;
    katex.render(expression, element, {
      displayMode: displayMode ?? element.dataset.texDisplay === 'block',
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml'
    });
    return true;
  }

  function renderAll(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-tex], [data-tex-legacy]').forEach(element => render(element));
  }

  function label(element, text, tex) {
    if (!element) return false;
    element.replaceChildren(document.createTextNode(text));
    const math = document.createElement('span');
    math.dataset.tex = tex;
    element.append(math);
    return render(math, tex, false);
  }

  window.STREEM_MATH = { render, renderAll, legacyToTex, label };
  document.addEventListener('DOMContentLoaded', () => renderAll(document));
}());
