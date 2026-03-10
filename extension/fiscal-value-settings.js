(function() {
  'use strict';

  const TARGET_ROUTE = '/fiscal/configurations/fiscal-configuration';
  const FEATURE_KEY = 'purchaseValueSettingsEnabled';
  const STORAGE_KEY = 'fiscalValueCalculationProfiles';
  const ROOT_ID = 'zweb-fiscal-value-settings';
  const STYLE_ID = 'zweb-fiscal-value-settings-style';
  const HEADER_ID = 'zweb-fiscal-value-settings-heading';
  const PANEL_ID = 'zweb-fiscal-value-settings-panel';
  const STATUS_ID = 'zweb-fiscal-value-settings-status';
  const SECTION_TITLE = 'C\u00e1lculo de Valores';
  const STATUS_CLASS_MAP = {
    muted: 'text-muted',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-danger'
  };
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
    : { purchaseValueSettingsEnabled: true };
  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);

  let storedProfiles = [];
  let draftProfiles = [];
  let sectionExpanded = false;
  let dirty = false;
  let pendingFocusProfileId = '';
  let profileIdCounter = 0;
  let ensureUiScheduled = false;
  let statusState = {
    tone: 'muted',
    text: 'Nenhum par\u00e2metro salvo ainda.'
  };

  function isFeatureEnabled(key) {
    return FEATURE_STATE[key] !== false;
  }

  function applyFeatureState(nextState) {
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(Object.assign({}, FEATURE_STATE, nextState || {}))
      : Object.assign({}, FEATURE_DEFAULTS, nextState || {});

    Object.keys(FEATURE_DEFAULTS).forEach((key) => {
      FEATURE_STATE[key] = normalized[key] !== false;
    });
  }

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function isTargetRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_ROUTE) !== -1;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseLocaleNumber(value) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return 0;

    let normalized = raw.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1 && normalized.indexOf('.') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(',', '.');
    }

    normalized = normalized.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatEditableNumber(value) {
    const parsed = parseLocaleNumber(value);
    if (!Number.isFinite(parsed)) return String(value == null ? '' : value).trim();

    return parsed.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
  }

  function formatFixedNumber(value, digits) {
    return Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function createProfileId() {
    profileIdCounter += 1;
    return 'zweb-fiscal-value-profile-' + Date.now() + '-' + profileIdCounter;
  }

  function createEmptyProfile() {
    return {
      id: createProfileId(),
      name: '',
      basePercent: '',
      extraPercent: '',
      notes: ''
    };
  }

  function normalizeProfiles(rawProfiles) {
    if (!Array.isArray(rawProfiles)) return [];

    return rawProfiles.reduce((acc, profile) => {
      if (!profile || typeof profile !== 'object') return acc;

      acc.push({
        id: typeof profile.id === 'string' && profile.id ? profile.id : createProfileId(),
        name: String(profile.name == null ? '' : profile.name).trim(),
        basePercent: profile.basePercent == null || profile.basePercent === ''
          ? ''
          : formatEditableNumber(profile.basePercent),
        extraPercent: profile.extraPercent == null || profile.extraPercent === ''
          ? ''
          : formatEditableNumber(profile.extraPercent),
        notes: String(profile.notes == null ? '' : profile.notes).trim()
      });

      return acc;
    }, []);
  }

  function cloneProfiles(profiles) {
    return normalizeProfiles(profiles).map((profile) => Object.assign({}, profile));
  }

  function getConfigForm() {
    if (!isTargetRoute()) return null;
    return document.getElementById('FiscalConfigurations');
  }

  function findComprasAccordion(form) {
    if (!form) return null;

    return Array.from(form.children).find((child) => {
      const button = child.querySelector && child.querySelector('.accordion-button');
      const text = button ? normalizeText(button.textContent || '') : '';
      return text.indexOf('compras') === 0;
    }) || null;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        display: block;
        margin: 10px 0;
      }

      #${ROOT_ID} .accordion-item {
        border: 0;
        overflow: hidden;
        background: transparent;
      }

      #${ROOT_ID} .accordion-button {
        min-height: 0;
        padding: 13px;
        gap: 8px;
      }

      #${ROOT_ID} .zweb-fiscal-value-heading {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      #${ROOT_ID} .zweb-fiscal-value-title {
        color: #181c32;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      }

      #${ROOT_ID} .zweb-fiscal-value-count {
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 700;
        line-height: 1;
        padding: 0.38rem 0.58rem;
        white-space: nowrap;
      }

      #${ROOT_ID} .accordion-collapse.collapse {
        display: block;
        margin-top: 0 !important;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        pointer-events: none;
        transition: max-height 280ms ease, opacity 180ms ease, margin-top 280ms ease;
      }

      #${ROOT_ID} .accordion-collapse.collapse.show {
        margin-top: 8px !important;
        max-height: 2600px;
        opacity: 1;
        pointer-events: auto;
      }

      #${ROOT_ID} .zweb-fiscal-value-panel-body {
        background: #ffffff;
        border-top: 1px solid rgba(24, 28, 50, 0.06);
        border-radius: 0 0 0.75rem 0.75rem;
        opacity: 0;
        padding: 18px 22px 20px;
        transform: translateY(-4px);
        transition: opacity 180ms ease, transform 280ms ease;
      }

      #${ROOT_ID} .accordion-collapse.show .zweb-fiscal-value-panel-body {
        opacity: 1;
        transform: translateY(0);
      }

      #${ROOT_ID} .zweb-fiscal-value-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      #${ROOT_ID} .zweb-fiscal-value-toolbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      #${ROOT_ID} .zweb-fiscal-value-status {
        min-height: 20px;
        font-size: 0.95rem;
      }

      #${ROOT_ID} .zweb-fiscal-value-note {
        border: 1px solid rgba(255, 193, 7, 0.35);
        background: rgba(255, 248, 220, 0.65);
        border-radius: 0.85rem;
        padding: 10px 14px;
      }

      #${ROOT_ID} .zweb-fiscal-value-list {
        display: grid;
        gap: 14px;
      }

      #${ROOT_ID} .zweb-fiscal-value-card {
        border: 1px dashed rgba(24, 28, 50, 0.18);
        border-radius: 1rem;
        background: #ffffff;
      }

      #${ROOT_ID} .zweb-fiscal-value-card-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      #${ROOT_ID} .zweb-fiscal-value-card-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 16px;
      }

      #${ROOT_ID} .zweb-fiscal-value-col-name {
        grid-column: span 4;
      }

      #${ROOT_ID} .zweb-fiscal-value-col-base,
      #${ROOT_ID} .zweb-fiscal-value-col-extra {
        grid-column: span 2;
      }

      #${ROOT_ID} .zweb-fiscal-value-col-preview {
        grid-column: span 4;
      }

      #${ROOT_ID} .zweb-fiscal-value-col-notes {
        grid-column: 1 / -1;
      }

      #${ROOT_ID} .zweb-fiscal-value-preview {
        min-height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        border: 1px solid rgba(24, 28, 50, 0.08);
        border-radius: 0.75rem;
        background: #f8f9fb;
        padding: 10px 12px;
      }

      #${ROOT_ID} .zweb-fiscal-value-preview-main {
        color: #181c32;
        font-size: 0.95rem;
        font-weight: 600;
      }

      #${ROOT_ID} .zweb-fiscal-value-preview-sub {
        color: #7e8299;
        font-size: 0.82rem;
      }

      #${ROOT_ID} .zweb-fiscal-value-empty {
        border: 1px dashed rgba(24, 28, 50, 0.18);
        border-radius: 1rem;
        background: rgba(248, 249, 251, 0.8);
        padding: 24px;
        text-align: center;
      }

      #${ROOT_ID} .zweb-fiscal-value-empty strong {
        display: block;
        margin-bottom: 6px;
        color: #181c32;
      }

      @media (max-width: 991px) {
        #${ROOT_ID} .accordion-button {
          padding: 13px;
        }

        #${ROOT_ID} .zweb-fiscal-value-heading {
          flex-wrap: wrap;
          row-gap: 6px;
        }

        #${ROOT_ID} .zweb-fiscal-value-panel-body {
          padding: 16px 18px 18px;
        }

        #${ROOT_ID} .zweb-fiscal-value-col-name,
        #${ROOT_ID} .zweb-fiscal-value-col-base,
        #${ROOT_ID} .zweb-fiscal-value-col-extra,
        #${ROOT_ID} .zweb-fiscal-value-col-preview {
          grid-column: 1 / -1;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function getPluralizedCountLabel(count) {
    return count === 1 ? '1 par\u00e2metro' : count + ' par\u00e2metros';
  }

  function setStatus(text, tone) {
    statusState = {
      text: text,
      tone: STATUS_CLASS_MAP[tone] ? tone : 'muted'
    };

    updateStatusUi();
  }

  function setCleanStatus() {
    if (storedProfiles.length) {
      setStatus(
        getPluralizedCountLabel(storedProfiles.length) + ' salvo' + (storedProfiles.length === 1 ? '' : 's') + '.',
        'muted'
      );
      return;
    }

    setStatus('Nenhum par\u00e2metro salvo ainda.', 'muted');
  }

  function getStatusClassName() {
    return STATUS_CLASS_MAP[statusState.tone] || STATUS_CLASS_MAP.muted;
  }

  function updateStatusUi(root) {
    const scope = root || document.getElementById(ROOT_ID);
    if (!scope) return;

    const statusEl = scope.querySelector('#' + STATUS_ID);
    if (!statusEl) return;

    const nextClassName = 'zweb-fiscal-value-status ' + getStatusClassName();
    if (statusEl.className !== nextClassName) {
      statusEl.className = nextClassName;
    }

    if (statusEl.textContent !== statusState.text) {
      statusEl.textContent = statusState.text;
    }
  }

  function getProfilePreview(profile) {
    const base = parseLocaleNumber(profile && profile.basePercent);
    const extra = parseLocaleNumber(profile && profile.extraPercent);

    if (!Number.isFinite(base) || !Number.isFinite(extra)) {
      return {
        main: 'Revise os percentuais informados.',
        sub: 'Use valores como 60, 15 ou 12,5.'
      };
    }

    if (!base && !extra) {
      return {
        main: 'Sem acr\u00e9scimo configurado.',
        sub: 'O custo permanece sem ajuste adicional.'
      };
    }

    const multiplier = (1 + (base / 100)) * (1 + (extra / 100));
    const totalPercent = (multiplier - 1) * 100;

    return {
      main: 'Custo x ' + formatFixedNumber(multiplier, 4),
      sub: 'Total estimado: +' + formatFixedNumber(totalPercent, 2) + '%'
    };
  }

  function buildProfileCardMarkup(profile, index) {
    const preview = getProfilePreview(profile);

    return `
      <article class="card shadow-none zweb-fiscal-value-card" data-profile-id="${escapeHtml(profile.id)}">
        <div class="card-body p-4">
          <div class="zweb-fiscal-value-card-head mb-4">
            <div>
              <div class="fs-6 fw-semibold text-gray-900">Par\u00e2metro ${index + 1}</div>
              <div class="text-muted fs-7">Cadastre combina\u00e7\u00f5es como 60 + 15 ou 70 + 15.</div>
            </div>
            <button type="button" class="btn btn-light-danger btn-sm" data-zweb-action="remove-profile" data-profile-id="${escapeHtml(profile.id)}">
              Remover
            </button>
          </div>

          <div class="zweb-fiscal-value-card-grid">
            <div class="zweb-fiscal-value-col-name">
              <label class="form-label fw-semibold">Nome do par\u00e2metro</label>
              <input
                type="text"
                class="form-control"
                data-field="name"
                value="${escapeHtml(profile.name)}"
                placeholder="Ex.: Varejo 60 + 15"
              />
            </div>

            <div class="zweb-fiscal-value-col-base">
              <label class="form-label fw-semibold">Margem base (%)</label>
              <input
                type="text"
                inputmode="decimal"
                class="form-control"
                data-field="basePercent"
                value="${escapeHtml(profile.basePercent)}"
                placeholder="60"
              />
            </div>

            <div class="zweb-fiscal-value-col-extra">
              <label class="form-label fw-semibold">Acr\u00e9scimo final (%)</label>
              <input
                type="text"
                inputmode="decimal"
                class="form-control"
                data-field="extraPercent"
                value="${escapeHtml(profile.extraPercent)}"
                placeholder="15"
              />
            </div>

            <div class="zweb-fiscal-value-col-preview">
              <label class="form-label fw-semibold">Pr\u00e9via</label>
              <div class="zweb-fiscal-value-preview" data-zweb-role="preview">
                <div class="zweb-fiscal-value-preview-main">${escapeHtml(preview.main)}</div>
                <div class="zweb-fiscal-value-preview-sub">${escapeHtml(preview.sub)}</div>
              </div>
            </div>

            <div class="zweb-fiscal-value-col-notes">
              <label class="form-label fw-semibold">Observa\u00e7\u00f5es</label>
              <textarea
                rows="2"
                class="form-control"
                data-field="notes"
                placeholder="Ex.: usar em produtos de alto giro."
              >${escapeHtml(profile.notes)}</textarea>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function buildEmptyStateMarkup() {
    return `
      <div class="zweb-fiscal-value-empty">
        <strong>Nenhum par\u00e2metro cadastrado.</strong>
        <div class="text-muted mb-4">Use esta se\u00e7\u00e3o para guardar regras como 60% + 15% antes de aplic\u00e1-las no fiscal.</div>
        <button type="button" class="btn btn-light-primary btn-sm" data-zweb-action="add-profile">Adicionar primeiro par\u00e2metro</button>
      </div>
    `;
  }

  function buildSectionMarkup() {
    const buttonClass = sectionExpanded
      ? 'accordion-button shadow-none fw-semibold fs-4 fw-light'
      : 'accordion-button shadow-none fw-semibold fs-4 fw-light collapsed';
    const collapseClass = sectionExpanded
      ? 'accordion-collapse collapse show'
      : 'accordion-collapse collapse';
    const subtitle = getPluralizedCountLabel(draftProfiles.length);
    const profilesMarkup = draftProfiles.length
      ? draftProfiles.map(buildProfileCardMarkup).join('')
      : buildEmptyStateMarkup();

    return `
      <div class="accordion-item">
        <div class="accordion-header" id="${HEADER_ID}">
          <button
            type="button"
            class="${buttonClass}"
            data-zweb-action="toggle-section"
            aria-expanded="${sectionExpanded ? 'true' : 'false'}"
            aria-controls="${PANEL_ID}"
          >
            <span class="zweb-fiscal-value-heading">
              <span class="zweb-fiscal-value-title">${SECTION_TITLE}</span>
              <span class="badge badge-light-primary zweb-fiscal-value-count">${escapeHtml(subtitle)}</span>
            </span>
          </button>
          <div class="accordion-header-content"></div>
        </div>

        <div id="${PANEL_ID}" class="${collapseClass}" aria-labelledby="${HEADER_ID}" aria-hidden="${sectionExpanded ? 'false' : 'true'}">
          <div class="zweb-fiscal-value-panel-body">
            <div class="zweb-fiscal-value-toolbar mb-4">
              <div>
                <div class="fs-5 fw-semibold text-gray-900 mb-1">Perfis de margem para o fiscal</div>
                <div class="text-muted">Cadastre combina\u00e7\u00f5es para reaproveitar depois na compra fiscal.</div>
              </div>

              <div class="zweb-fiscal-value-toolbar-actions">
                <button type="button" class="btn btn-light-primary btn-sm" data-zweb-action="add-profile">Adicionar par\u00e2metro</button>
                <button type="button" class="btn btn-primary btn-sm" data-zweb-action="save-profiles">Salvar par\u00e2metros</button>
              </div>
            </div>

            <div class="zweb-fiscal-value-note text-gray-700 mb-4">
              Esta etapa somente cadastra os par\u00e2metros. A aplica\u00e7\u00e3o autom\u00e1tica na importa\u00e7\u00e3o de compra fica para a pr\u00f3xima integra\u00e7\u00e3o.
            </div>

            <div id="${STATUS_ID}" class="zweb-fiscal-value-status ${getStatusClassName()}">${escapeHtml(statusState.text)}</div>

            <div class="zweb-fiscal-value-list mt-4">
              ${profilesMarkup}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSection(root) {
    if (!root) return;

    root.innerHTML = buildSectionMarkup();
    updateStatusUi(root);

    if (pendingFocusProfileId) {
      const selector = '[data-profile-id="' + pendingFocusProfileId.replace(/"/g, '\\"') + '"] input[data-field="name"]';
      const nameInput = root.querySelector(selector);
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
      pendingFocusProfileId = '';
    }
  }

  function insertRoot(form, root) {
    const comprasAccordion = findComprasAccordion(form);
    if (comprasAccordion && comprasAccordion.nextElementSibling) {
      form.insertBefore(root, comprasAccordion.nextElementSibling);
      return;
    }

    form.appendChild(root);
  }

  function ensureRootPlacement(form, root) {
    const comprasAccordion = findComprasAccordion(form);
    if (!comprasAccordion) {
      if (root.parentElement !== form) form.appendChild(root);
      return;
    }

    if (root.parentElement !== form) {
      insertRoot(form, root);
      return;
    }

    if (root.previousElementSibling === comprasAccordion) return;

    insertRoot(form, root);
  }

  function bindRoot(root) {
    if (!root || root.dataset.bound === 'true') return;

    root.addEventListener('click', handleRootClick);
    root.addEventListener('input', handleRootInput);
    root.addEventListener('keydown', handleRootKeydown);
    root.dataset.bound = 'true';
  }

  function ensureUi() {
    if (!isTargetRoute() || !isFeatureEnabled(FEATURE_KEY)) {
      removeUi();
      return null;
    }

    const form = getConfigForm();
    if (!form) {
      removeUi();
      return null;
    }

    ensureStyle();

    let root = document.getElementById(ROOT_ID);
    if (root && root.parentElement !== form) {
      root.remove();
      root = null;
    }

    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      root.className = 'accordion';
      bindRoot(root);
      insertRoot(form, root);
      renderSection(root);
      return root;
    }

    bindRoot(root);
    ensureRootPlacement(form, root);
    if (!root.firstElementChild) renderSection(root);
    updateStatusUi(root);
    syncExpandedState(root);

    return root;
  }

  function removeUi() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.remove();
  }

  function scheduleEnsureUi() {
    if (ensureUiScheduled) return;
    ensureUiScheduled = true;

    const run = () => {
      ensureUiScheduled = false;
      ensureUi();
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(run);
      return;
    }

    setTimeout(run, 16);
  }

  function syncExpandedState(root) {
    const scope = root || document.getElementById(ROOT_ID);
    if (!scope) return;

    const button = scope.querySelector('[data-zweb-action="toggle-section"]');
    const panel = scope.querySelector('#' + PANEL_ID);
    if (!button || !panel) return;

    button.classList.toggle('collapsed', !sectionExpanded);
    button.setAttribute('aria-expanded', sectionExpanded ? 'true' : 'false');
    panel.classList.toggle('show', sectionExpanded);
    panel.setAttribute('aria-hidden', sectionExpanded ? 'false' : 'true');
  }

  function markDirty() {
    dirty = true;
    setStatus('Altera\u00e7\u00f5es n\u00e3o salvas.', 'warning');
  }

  function readProfileFromCard(card) {
    if (!card) return null;

    const profileId = card.getAttribute('data-profile-id') || createProfileId();
    const readField = (field) => {
      const input = card.querySelector('[data-field="' + field + '"]');
      return input ? input.value : '';
    };

    return {
      id: profileId,
      name: readField('name'),
      basePercent: readField('basePercent'),
      extraPercent: readField('extraPercent'),
      notes: readField('notes')
    };
  }

  function findDraftIndex(profileId) {
    return draftProfiles.findIndex((profile) => profile.id === profileId);
  }

  function updateDraftProfileFromCard(card) {
    const profile = readProfileFromCard(card);
    if (!profile) return null;

    const index = findDraftIndex(profile.id);
    if (index === -1) return null;

    draftProfiles[index] = profile;
    return profile;
  }

  function updatePreviewForCard(card, profile) {
    if (!card || !profile) return;

    const previewEl = card.querySelector('[data-zweb-role="preview"]');
    if (!previewEl) return;

    const preview = getProfilePreview(profile);
    previewEl.innerHTML =
      '<div class="zweb-fiscal-value-preview-main">' + escapeHtml(preview.main) + '</div>' +
      '<div class="zweb-fiscal-value-preview-sub">' + escapeHtml(preview.sub) + '</div>';
  }

  function handleRootInput(event) {
    const input = event.target;
    if (!input || !input.dataset || !input.dataset.field) return;

    const card = input.closest('[data-profile-id]');
    if (!card) return;

    const profile = updateDraftProfileFromCard(card);
    if (!profile) return;

    markDirty();
    updatePreviewForCard(card, profile);
  }

  function handleRootKeydown(event) {
    const target = event.target;
    if (!target || !target.dataset || !target.dataset.field) return;
    if (event.key !== 'Enter') return;
    if ((target.tagName || '').toUpperCase() === 'TEXTAREA') return;

    event.preventDefault();
  }

  function toggleSection(root) {
    sectionExpanded = !sectionExpanded;
    syncExpandedState(root);
  }

  function handleAddProfile(root) {
    const profile = createEmptyProfile();
    draftProfiles.push(profile);
    pendingFocusProfileId = profile.id;
    sectionExpanded = true;
    markDirty();
    renderSection(root);
  }

  function handleRemoveProfile(root, profileId) {
    const index = findDraftIndex(profileId);
    if (index === -1) return;

    draftProfiles.splice(index, 1);
    sectionExpanded = true;
    markDirty();
    renderSection(root);
  }

  function serializeProfiles() {
    const cleanedProfiles = [];

    for (const draftProfile of draftProfiles) {
      const normalizedProfile = {
        id: draftProfile.id || createProfileId(),
        name: String(draftProfile.name == null ? '' : draftProfile.name).trim(),
        basePercent: String(draftProfile.basePercent == null ? '' : draftProfile.basePercent).trim(),
        extraPercent: String(draftProfile.extraPercent == null ? '' : draftProfile.extraPercent).trim(),
        notes: String(draftProfile.notes == null ? '' : draftProfile.notes).trim()
      };

      const hasAnyContent = normalizedProfile.name || normalizedProfile.basePercent || normalizedProfile.extraPercent || normalizedProfile.notes;
      if (!hasAnyContent) continue;

      if (!normalizedProfile.name) {
        return {
          error: 'Preencha um nome para todos os par\u00e2metros antes de salvar.'
        };
      }

      if (normalizedProfile.basePercent && !Number.isFinite(parseLocaleNumber(normalizedProfile.basePercent))) {
        return {
          error: 'Revise a margem base antes de salvar.'
        };
      }

      if (normalizedProfile.extraPercent && !Number.isFinite(parseLocaleNumber(normalizedProfile.extraPercent))) {
        return {
          error: 'Revise o acr\u00e9scimo final antes de salvar.'
        };
      }

      if (normalizedProfile.basePercent) normalizedProfile.basePercent = formatEditableNumber(normalizedProfile.basePercent);
      if (normalizedProfile.extraPercent) normalizedProfile.extraPercent = formatEditableNumber(normalizedProfile.extraPercent);

      cleanedProfiles.push(normalizedProfile);
    }

    return { profiles: cleanedProfiles };
  }

  function saveProfiles(root) {
    const serialization = serializeProfiles();
    if (serialization.error) {
      setStatus(serialization.error, 'error');
      updateStatusUi(root);
      return;
    }

    const nextProfiles = serialization.profiles;
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: nextProfiles }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          setStatus('N\u00e3o foi poss\u00edvel salvar os par\u00e2metros.', 'error');
          updateStatusUi(root);
          return;
        }

        storedProfiles = cloneProfiles(nextProfiles);
        draftProfiles = cloneProfiles(nextProfiles);
        dirty = false;
        sectionExpanded = true;
        setStatus(
          nextProfiles.length
            ? getPluralizedCountLabel(nextProfiles.length) + ' salvo' + (nextProfiles.length === 1 ? '' : 's') + ' com sucesso.'
            : 'Nenhum par\u00e2metro salvo.',
          'success'
        );
        renderSection(root);
      });
    } catch (error) {
      setStatus('N\u00e3o foi poss\u00edvel salvar os par\u00e2metros.', 'error');
      updateStatusUi(root);
    }
  }

  function handleRootClick(event) {
    const actionTarget = event.target && event.target.closest ? event.target.closest('[data-zweb-action]') : null;
    if (!actionTarget) return;

    const root = event.currentTarget;
    const action = actionTarget.getAttribute('data-zweb-action');

    if (action === 'toggle-section') {
      toggleSection(root);
      return;
    }

    if (action === 'add-profile') {
      handleAddProfile(root);
      return;
    }

    if (action === 'remove-profile') {
      handleRemoveProfile(root, actionTarget.getAttribute('data-profile-id') || '');
      return;
    }

    if (action === 'save-profiles') {
      saveProfiles(root);
    }
  }

  function loadFeatureState() {
    try {
      chrome.storage.local.get(FEATURE_DEFAULTS, (stored) => {
        applyFeatureState(stored);
        scheduleEnsureUi();
      });
    } catch (error) {
      scheduleEnsureUi();
    }
  }

  function loadProfiles() {
    try {
      chrome.storage.local.get({ [STORAGE_KEY]: [] }, (stored) => {
        storedProfiles = cloneProfiles(stored[STORAGE_KEY]);
        if (!dirty) {
          draftProfiles = cloneProfiles(storedProfiles);
          setCleanStatus();
          renderSection(ensureUi());
          return;
        }

        setStatus('Existem altera\u00e7\u00f5es locais n\u00e3o salvas nesta tela.', 'warning');
        updateStatusUi();
      });
    } catch (error) {
      draftProfiles = [];
      storedProfiles = [];
      setCleanStatus();
      renderSection(ensureUi());
    }
  }

  function initStorageListener() {
    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;

        if (changes[FEATURE_KEY]) {
          applyFeatureState({ [FEATURE_KEY]: changes[FEATURE_KEY].newValue });
          scheduleEnsureUi();
        }

        if (!changes[STORAGE_KEY]) return;

        storedProfiles = cloneProfiles(changes[STORAGE_KEY].newValue);
        if (!dirty) {
          draftProfiles = cloneProfiles(storedProfiles);
          setCleanStatus();
          renderSection(ensureUi());
          return;
        }

        setStatus('Existem altera\u00e7\u00f5es locais n\u00e3o salvas nesta tela.', 'warning');
        updateStatusUi();
      });
    } catch (error) {}
  }

  function init() {
    loadFeatureState();
    loadProfiles();

    window.addEventListener('hashchange', scheduleEnsureUi);

    const observer = new MutationObserver(() => {
      scheduleEnsureUi();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(scheduleEnsureUi, 800);
    setTimeout(scheduleEnsureUi, 2200);
    initStorageListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
