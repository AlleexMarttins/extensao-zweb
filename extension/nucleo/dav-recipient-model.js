(function(root) {
  'use strict';
  function identity(value) { return String(value && (value.uuid || value.remotePersonUuid) || '').toLowerCase(); }
  function picker(input) {
    const seen = new Set();
    for (let element = input; element; element = element.parentElement) {
      for (let component = element.__vueParentComponent; component && !seen.has(component); component = component.parent) {
        seen.add(component);
        const model = component.proxy;
        if (model && typeof model.select === 'function' && Array.isArray(model.options) && Array.isArray(model.internalValue)) return model;
      }
    }
    return null;
  }
  async function selectRecipient(input, recipient) {
    if (!input || !input.isConnected || !identity(recipient)) return 'invalid';
    const model = picker(input);
    if (!model) return selectNativeOption(input, recipient);
    if (model.internalValue.length) return model.internalValue.some(value => identity(value) === identity(recipient)) ? 'selected' : 'occupied';
    if (recipient.name && input.value !== recipient.name) return 'occupied';
    const options = model.options.filter(value => identity(value) === identity(recipient) && value.active !== false && !value.$isDisabled);
    if (options.length !== 1) return 'waiting';
    model.select(options[0]);
    if (typeof model.$nextTick === 'function') await model.$nextTick();
    const confirmed = model.internalValue.some(value => identity(value) === identity(recipient));
    if (confirmed && typeof model.deactivate === 'function') model.deactivate();
    return confirmed ? 'selected' : 'unconfirmed';
  }
  async function selectCached(input, target) {
    if (!input || !input.isConnected) return 'unavailable';
    const model = picker(input);
    if (!model) return 'unavailable';
    const matches = value => target.code != null
      ? String(value.sequence || '').replace(/^#/, '') === String(target.code).replace(/^#/, '')
      : identity(value) && identity(value) === identity(target);
    if (model.internalValue.length) return model.internalValue.some(matches) ? 'selected' : 'occupied';
    if (input.value && input.value !== target.name) return 'occupied';
    const options = model.options.filter(value => matches(value) && value.active !== false && !value.$isDisabled);
    if (options.length !== 1) return 'unavailable';
    model.select(options[0]);
    if (typeof model.$nextTick === 'function') await model.$nextTick();
    const confirmed = model.internalValue.some(matches);
    if (confirmed && typeof model.deactivate === 'function') model.deactivate();
    return confirmed ? 'selected' : 'unconfirmed';
  }
  async function selectNativeOption(input, recipient) {
    const wrapper = input.closest('.multiselect');
    if (!wrapper) return 'waiting';
    const normalize = value => String(value || '').trim().normalize('NFC').toLocaleUpperCase('pt-BR');
    const selected = wrapper.querySelector('.multiselect__single');
    if (selected && selected.textContent.trim()) return normalize(selected.textContent) === normalize(recipient.name) ? 'selected' : 'occupied';
    if (!recipient.name || input.value !== recipient.name) return 'occupied';
    const matches = Array.from(wrapper.querySelectorAll('.multiselect__option')).filter(option =>
      normalize(option.textContent) === normalize(recipient.name) &&
      !option.classList.contains('multiselect__option--disabled') &&
      option.getAttribute('aria-disabled') !== 'true');
    if (matches.length !== 1) return 'waiting';
    // O listener de selecao fica no span, nao no li que tem role=option.
    matches[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    matches[0].click();
    await new Promise(resolve => setTimeout(resolve, 0));
    const value = wrapper.querySelector('.multiselect__single');
    return value && normalize(value.textContent) === normalize(recipient.name) && wrapper.getAttribute('aria-expanded') === 'false' ? 'selected' : 'unconfirmed';
  }
  function formatQuantity(quantity, options = {}) {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new Error('Quantidade invalida.');
    const precision = Number.isInteger(options.precision) && options.precision >= 0 && options.precision <= 6 ? options.precision : 2;
    const decimal = options.decimal === '.' ? '.' : ',';
    return String(quantity) + (precision ? decimal + '0'.repeat(precision) : '');
  }
  function setQuantity(input, quantity) {
    if (!input || !input.isConnected) return false;
    // O campo inteiro atual nao expoe a antiga configuracao da mascara.
    // Nao acrescentar zeros: uma mascara inteira transformaria 1,00 em 100.
    const options = input.options && Number.isInteger(input.options.precision)
      ? input.options : { precision: 0 };
    const value = formatQuantity(quantity, options);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const decimal = options.decimal || ',';
    const separator = options.separator || (decimal === '.' ? ',' : '.');
    const actual = input.unmasked == null ? Number(String(input.value).split(separator).join('').replace(decimal, '.')) : Number(input.unmasked);
    input.setAttribute('data-zweb-dav-quantity-confirmed', actual === quantity ? String(quantity) : '');
    return true;
  }
  const api = { selectRecipient, selectCached, formatQuantity, setQuantity };
  root.ZWEB_DAV_RECIPIENT_MODEL = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
