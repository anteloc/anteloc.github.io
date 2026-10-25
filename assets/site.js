// Landing page for LDraw Nova and LDraw Mecha: two showcases, one switch.
//
// Both gallery indexes (made by scripts/refresh-indexes.sh) are fetched once on
// load and kept in memory; galleries, cards and viewer links all come from them.
// Cards and viewer dialogs follow the Docker apps' Gallery pages
// (ldraw-nova-docker and ldraw-mecha-docker, web/frontend/src/components).
(function () {
  'use strict';

  const PROJECTS = {
    nova: {
      name: 'LDraw Nova',
      index: 'models-gallery-nova.json',
      viewer: 'viewer/nova/',
      xr: 'xr/nova/',
      modes: [
        { mode: 'viewer', label: '3D view', title: 'Inspect the model (three.js viewer)' },
        { mode: 'player', label: '3D player', title: 'Watch it being built, step by step' },
        { mode: 'instructions', label: 'Build instructions', title: 'Follow the build steps with illustrated parts lists' },
      ],
    },
    mecha: {
      name: 'LDraw Mecha',
      index: 'models-gallery-mecha.json',
      viewer: 'viewer/mecha/',
      xr: 'xr/mecha/',
      modes: [{ mode: 'viewer', label: '3D view', title: 'Inspect the model (three.js viewer)' }],
    },
  };
  const XR_TITLE = 'Mixed reality on a Meta Quest 3 (WebXR)';
  const ORDER = ['nova', 'mecha'];

  // --- the indexes: fetched once, kept in memory -------------------------------
  const indexes = {};
  for (const id of ORDER) {
    indexes[id] = fetch(PROJECTS[id].index, { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`${PROJECTS[id].index}: HTTP ${r.status}`))))
      .then(index => index.models.map(entry => toModel(id, entry)));
  }

  const abs = url => new URL(url, document.baseURI).href;
  const fileUrl = (entry, kind) => (entry.files[kind] ? abs(entry.files[kind].url) : null);

  /** An index entry as the apps' cards see a model (their ModelFile). */
  function toModel(project, entry) {
    const source = ['mpd', 'ldr', 'dat'].map(kind => fileUrl(entry, kind)).find(Boolean) || null;
    const glb = fileUrl(entry, 'glb');
    return {
      project,
      name: entry.name,
      file: entry.file,
      description: entry.description || '',
      info_heading: entry.info_heading,
      parts: entry.parts,
      image_url: fileUrl(entry, 'png'),
      bom_url: fileUrl(entry, 'csv'),
      info_url: fileUrl(entry, 'md'),
      mpd_url: source,
      glb_url: glb,
      glb_size: entry.files.glb ? entry.files.glb.size : null,
      blend_url: fileUrl(entry, 'blend'),
      // Nova views the LDraw source (preferring its .glb); Mecha the source, or its animation.
      model_url: source || (project === 'mecha' ? glb : null),
    };
  }

  // --- viewer URLs ---------------------------------------------------------------
  function query(model, extra) {
    const params = new URLSearchParams({ model: model.model_url });
    if (model.glb_url) params.set('glb', model.glb_url);
    if (model.parts != null) params.set('parts', String(model.parts));
    for (const [key, value] of Object.entries(extra || {})) if (value) params.set(key, value);
    return params.toString();
  }
  function viewerUrl(model, mode) {
    const extra = model.project === 'mecha' ? { mpd: model.mpd_url, blend: model.blend_url } : {};
    return abs(`${PROJECTS[model.project].viewer}${mode || 'viewer'}.html?${query(model, { ...extra, theme: 'dark' })}`);
  }
  const xrUrl = model => abs(`${PROJECTS[model.project].xr}?${query(model)}`);

  // --- small DOM helpers ---------------------------------------------------------
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
      else if (key === 'class') el.className = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'innerHTML') el.innerHTML = value;
      else if (key in el && typeof value !== 'string') el[key] = value;
      else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) if (child != null && child !== false) el.append(child);
    return el;
  }
  const svg = markup => { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.firstChild; };
  const downloadIcon = () => svg('<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2v8m-3-3 3 3 3-3M3 11v3h10v-3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const infoIcon = () => svg('<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 4.5v1" stroke-linecap="round"/></svg>');
  const partsLabel = n => `${n.toLocaleString()} part${n === 1 ? '' : 's'}`;
  const formatSize = bytes => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);
  const titleOf = model => model.description || model.file;

  // --- downloads -----------------------------------------------------------------
  // `download` works for files GitHub Pages serves; Git LFS files come from
  // another origin, where browsers ignore it, so those are saved as a blob.
  function downloadLink(url, label, title, size) {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop());
    const link = h('a', { class: 'button', href: url, download: name, title: title + (size ? ` (${formatSize(size)})` : '') }, downloadIcon(), label);
    if (new URL(url).origin === location.origin) return link;
    link.addEventListener('click', async event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (link.getAttribute('aria-busy') === 'true') return;
      link.setAttribute('aria-busy', 'true');
      link.firstChild.replaceWith(h('span', { class: 'spinner', 'aria-hidden': 'true' }));
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
        const save = h('a', { href: URL.createObjectURL(await response.blob()), download: name });
        document.body.append(save);
        save.click();
        save.remove();
        setTimeout(() => URL.revokeObjectURL(save.href), 30000);
        link.classList.remove('danger-text');
      } catch (e) {
        link.classList.add('danger-text');
        link.title = `Download failed: ${e.message}`;
      } finally {
        link.firstChild.replaceWith(downloadIcon());
        link.removeAttribute('aria-busy');
      }
    });
    return link;
  }
  const disabledDownload = (label, title) => h('button', { disabled: true, title }, downloadIcon(), label);

  // --- dialogs -------------------------------------------------------------------
  const stack = [];
  function openDialog(dialog, { label, onClose } = {}) {
    const opener = document.activeElement;
    const backdrop = h('div', { class: 'modal-backdrop', dataset: { project: dialog.dataset.project || '' } }, dialog);
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (label) dialog.setAttribute('aria-label', label);
    const entry = {
      close() {
        const i = stack.indexOf(entry);
        if (i < 0) return;
        stack.splice(i, 1);
        backdrop.remove();
        if (!stack.length) document.documentElement.classList.remove('modal-open');
        if (onClose) onClose();
        if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      },
    };
    backdrop.addEventListener('mousedown', event => { if (event.target === backdrop) entry.close(); });
    stack.push(entry);
    document.documentElement.classList.add('modal-open');
    document.body.append(backdrop);
    (dialog.querySelector('[data-autofocus]') || dialog.querySelector('button, a[href], iframe') || dialog).focus({ preventScroll: true });
    return entry;
  }
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && stack.length) { event.preventDefault(); stack[stack.length - 1].close(); }
  });
  const closeButton = close => h('button', { type: 'button', class: 'icon-button', 'aria-label': 'Close', onclick: close }, '✕');

  /** ViewerModal: the viewers are separate pages in an iframe. */
  function openViewer(model, mode) {
    const project = PROJECTS[model.project];
    const dialog = h('div', { class: 'modal viewer-modal', dataset: { project: model.project } });
    let current = mode || 'viewer';
    let dialogEntry;
    const render = () => {
      const url = viewerUrl(model, current);
      const label = `${project.modes.find(m => m.mode === current).label} of ${titleOf(model)}`;
      dialog.setAttribute('aria-label', label);
      dialog.replaceChildren(
        h('header', { class: 'modal-head' },
          h('strong', { class: 'ellipsis', title: titleOf(model) }, titleOf(model)),
          h('span', { class: 'segmented', role: 'group', 'aria-label': 'Show in' },
            project.modes.map(m => h('button', {
              type: 'button', title: m.title, 'aria-pressed': String(m.mode === current),
              onclick: () => { if (m.mode !== current) { current = m.mode; render(); } },
            }, m.label))),
          h('a', { class: 'button', href: xrUrl(model), title: XR_TITLE }, 'VR'),
          h('a', { class: 'new-tab', href: url, target: '_blank', rel: 'noopener' }, 'Open in new tab'),
          closeButton(() => dialogEntry.close())),
        // A fresh page per mode, so the iframe's history doesn't pile up.
        h('iframe', { src: url, title: label, allow: 'fullscreen; xr-spatial-tracking' }));
    };
    render();
    dialogEntry = openDialog(dialog, { label: dialog.getAttribute('aria-label') });
  }

  /** InfoModal: a model's notes, its sibling .md, fetched when opened. */
  function openInfo(model) {
    const body = h('div', { class: 'info-body' }, h('p', { class: 'muted' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), ' Loading…'));
    let dialogEntry;
    const dialog = h('div', { class: 'modal info-modal', dataset: { project: model.project } },
      h('header', { class: 'modal-head' },
        h('strong', { class: 'ellipsis' }, titleOf(model)),
        closeButton(() => dialogEntry.close())),
      body);
    dialogEntry = openDialog(dialog, { label: `About ${titleOf(model)}` });
    fetch(model.info_url, { cache: 'no-cache' })
      .then(r => (r.ok ? r.text() : Promise.reject(new Error(r.statusText || `HTTP ${r.status}`))))
      .then(text => body.replaceChildren(h('div', { class: 'markdown', innerHTML: markdown(text) })),
        e => body.replaceChildren(h('p', { class: 'danger-text' }, `Couldn't load the notes: ${e.message}`)));
  }

  // Markdown with GitHub's extensions, like the apps' react-markdown + remark-gfm.
  // Raw HTML is shown as text, never run; links only to web and mail addresses.
  const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeHref = href => {
    try { return ['http:', 'https:', 'mailto:'].includes(new URL(href, location.href).protocol) ? href : null; } catch { return null; }
  };
  if (window.marked) {
    marked.use({
      gfm: true,
      renderer: {
        html: html => escapeHtml(typeof html === 'string' ? html : html.text),
        link(href, title, text) {
          const safe = safeHref(href);
          if (!safe) return text;
          return `<a href="${escapeHtml(safe)}"${title ? ` title="${escapeHtml(title)}"` : ''} target="_blank" rel="noopener noreferrer">${text}</a>`;
        },
        image(href, title, text) {
          const safe = safeHref(href);
          return safe ? `<img src="${escapeHtml(safe)}" alt="${escapeHtml(text || '')}"${title ? ` title="${escapeHtml(title)}"` : ''}>` : escapeHtml(text || '');
        },
      },
    });
  }
  const markdown = text => (window.marked ? marked.parse(text) : `<pre>${escapeHtml(text)}</pre>`);

  /** ModelCard: the apps' Gallery card, for one model. */
  function modelCard(model, { onViewer } = {}) {
    const isMecha = model.project === 'mecha';
    const open = mode => model.model_url && (onViewer ? onViewer(mode) : openViewer(model, mode));
    const thumb = model.image_url
      ? h('img', { src: model.image_url, alt: titleOf(model), loading: 'lazy' })
      : h('span', { class: 'thumb-missing' }, 'No snapshot');
    const ext = url => '.' + (decodeURIComponent(new URL(url).pathname).split('.').pop() || 'mpd').toLowerCase();

    const viewerActions = isMecha
      ? [
          h('button', { type: 'button', onclick: () => open('viewer'), disabled: !model.model_url }, '3D View'),
          model.model_url && h('a', { class: 'button', href: xrUrl(model), title: XR_TITLE }, 'VR'),
        ]
      : [
          h('button', { type: 'button', onclick: () => open('viewer'), disabled: !model.model_url }, '3D View'),
          h('button', { type: 'button', onclick: () => open('player'), disabled: !model.model_url, title: 'Watch the model being built, step by step' }, '3D Player'),
          h('button', { type: 'button', onclick: () => open('instructions'), disabled: !model.model_url, title: 'Follow the build steps and see the parts needed for each step' }, 'Build instructions'),
          model.model_url && h('a', { class: 'button', href: xrUrl(model), title: XR_TITLE }, 'VR'),
        ];

    const downloads = isMecha
      ? [
          model.mpd_url ? downloadLink(model.mpd_url, ext(model.mpd_url), 'Download the original model') : disabledDownload('.mpd', 'No MPD source included'),
          model.bom_url ? downloadLink(model.bom_url, 'BOM', 'Download the bill of materials (CSV)') : disabledDownload('BOM', 'No bill of materials'),
          model.glb_url ? downloadLink(model.glb_url, 'Animated .glb', 'Download the animated .glb', model.glb_size) : disabledDownload('Animated .glb', 'No animated GLB available'),
          model.blend_url ? downloadLink(model.blend_url, 'Animated .blend', 'Download the Blender scene') : disabledDownload('Animated .blend', 'No animated Blender file available'),
        ]
      : [
          model.mpd_url && downloadLink(model.mpd_url, ext(model.mpd_url), `Download ${model.file}`),
          model.glb_url ? downloadLink(model.glb_url, '.glb', 'Download .glb', model.glb_size) : disabledDownload('.glb', 'No .glb available'),
          model.bom_url ? downloadLink(model.bom_url, 'BOM', 'Download the bill of materials (CSV)') : disabledDownload('BOM', 'No bill of materials'),
        ];

    return h('div', { class: 'model-card', dataset: { project: model.project } },
      h('button', { type: 'button', class: 'model-thumb', onclick: () => open('viewer'), disabled: !model.model_url, title: 'Open in the 3D viewer' },
        thumb,
        isMecha && model.glb_url && h('span', { class: 'animation-play', 'aria-hidden': 'true' }, '▶'),
        model.model_url && h('span', { class: 'thumb-hint' }, isMecha && model.glb_url ? '▶ Play animation' : 'View in 3D')),
      h('div', { class: 'model-meta' },
        h('div', { class: 'model-title' },
          h('span', { class: 'model-file' },
            h('strong', { class: 'ellipsis', title: model.file }, model.file),
            model.parts != null && h('span', { class: 'muted' }, `, ${partsLabel(model.parts)}`))),
        model.info_heading && h('p', { class: 'model-info-heading' }, h('strong', null, model.info_heading)),
        model.description && h('p', { class: 'model-description' }, model.description),
        h('div', { class: 'muted small ellipsis' }, `From the ${PROJECTS[model.project].name} gallery`),
        h('div', { class: 'model-actions' },
          model.info_url && h('button', { type: 'button', class: 'model-info-action', onclick: () => openInfo(model), title: 'About this model, from its author (e.g. the prompt that made it)' }, infoIcon(), 'Info'),
          h('span', { class: 'model-viewer-actions', role: 'group', 'aria-label': 'View model' }, viewerActions),
          h('span', { class: 'button-group model-download-actions', role: 'group', 'aria-label': 'Download' }, downloads))));
  }

  /** A gallery tile opens its model's card. */
  function openCard(model) {
    let dialogEntry;
    const dialog = h('div', { class: 'modal card-modal', dataset: { project: model.project } },
      h('header', { class: 'modal-head' },
        h('span', { class: 'card-modal-kicker' }, h('span', { class: 'dot', 'aria-hidden': 'true' }), PROJECTS[model.project].name),
        closeButton(() => dialogEntry.close())),
      modelCard(model));
    setHash(model.project, model.name);
    dialogEntry = openDialog(dialog, { label: titleOf(model), onClose: () => setHash(model.project) });
  }

  // --- galleries -----------------------------------------------------------------
  function tile(model) {
    const isMecha = model.project === 'mecha';
    return h('li', null,
      h('button', { type: 'button', class: 'gallery-item', onclick: () => openCard(model), 'aria-label': `${model.info_heading || titleOf(model)}: open its card` },
        h('span', { class: 'gallery-thumb' },
          model.image_url ? h('img', { src: model.image_url, alt: '', loading: 'lazy', decoding: 'async' }) : h('span', { class: 'thumb-missing' }, 'No snapshot'),
          isMecha && model.glb_url && h('span', { class: 'badge-play', 'aria-hidden': 'true' }, '▶')),
        h('span', { class: 'gallery-caption' },
          h('strong', null, model.info_heading || titleOf(model)),
          h('small', null, [model.parts != null ? partsLabel(model.parts) : null, isMecha && model.glb_url ? 'animated' : null].filter(Boolean).join(' · ') || model.file))));
  }

  const models = {};
  for (const id of ORDER) {
    indexes[id].then(list => {
      models[id] = list;
      document.querySelector(`[data-gallery="${id}"]`).replaceChildren(...list.map(tile));
      document.querySelectorAll(`[data-count="${id}"]`).forEach(el => { el.textContent = String(list.length); });
      document.querySelectorAll(`[data-collage="${id}"]`).forEach(el => collage(el, list));
      openFromHash();
    }, error => {
      document.querySelector(`[data-gallery="${id}"]`).replaceChildren(
        h('li', { class: 'gallery-loading danger-text' }, `Couldn't load the gallery: ${error.message}`));
    });
  }

  function collage(el, list) {
    const size = Number(el.dataset.collageSize) || 4;
    el.replaceChildren(...list.filter(m => m.image_url).slice(0, size).map(m => h('img', { src: m.image_url, alt: '', loading: 'lazy', decoding: 'async' })));
  }

  // --- the switch between showcases ------------------------------------------------
  // Each showcase keeps its own scroll position, so going back and forth
  // returns to where you were in each.
  const showcase = document.getElementById('showcase');
  const tabs = [...document.querySelectorAll('.switch [role="tab"]')];
  const offsets = {};
  let active = 'nova';

  function setHash(project, name) {
    history.replaceState(null, '', '#' + project + (name ? '/' + encodeURIComponent(name) : ''));
  }

  function activate(project, { scroll = true, focus = false } = {}) {
    if (!PROJECTS[project]) return;
    const showcaseTop = showcase.getBoundingClientRect().top + scrollY - headerHeight();
    if (scrollY >= showcaseTop - 1) offsets[active] = scrollY - showcaseTop;
    active = project;
    document.body.dataset.project = project;
    for (const tab of tabs) {
      const selected = tab.dataset.target === project;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const id of ORDER) document.getElementById(id).hidden = id !== project;
    setHash(project);
    if (scroll) scrollTo({ top: showcaseTop + (offsets[project] || 0), behavior: offsets[project] ? 'instant' : 'smooth' });
    if (focus) document.getElementById(project).focus({ preventScroll: true });
  }
  const headerHeight = () => document.querySelector('.topbar').offsetHeight;

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab.dataset.target));
    tab.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      activate(next.dataset.target);
    });
  });
  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => { offsets[button.dataset.open] = 0; activate(button.dataset.open, { focus: true }); });
  });

  // #nova, #mecha, or #nova/<model>: a showcase, or a model's card in it. The
  // card waits for its gallery index; switching showcases rewrites the hash.
  let wanted = null;
  function readHash() {
    const [project, name] = location.hash.slice(1).split('/');
    if (!PROJECTS[project]) return;
    wanted = name ? { project, name: decodeURIComponent(name) } : null;
    if (project !== active) activate(project, { scroll: false });
    showcase.scrollIntoView();
    openFromHash();
  }
  function openFromHash() {
    if (!wanted || !models[wanted.project]) return;
    const model = models[wanted.project].find(m => m.name === wanted.name);
    wanted = null;
    if (model) openCard(model);
  }
  readHash();
  addEventListener('hashchange', readHash);
})();
