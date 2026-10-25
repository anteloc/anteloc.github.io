// What the Docker apps' backend provides to the viewers, for static hosting
// (GitHub Pages): an LDraw parts library, a theme and file downloads.
//
//   ?lib=<url of an LDraw folder>   overrides the default library below
//   ?theme=light|dark               dark is the default here
(function () {
  const params = new URLSearchParams(location.search);

  // The official LDraw library: LDConfig.ldr, parts/, p/, models/.
  const LIB = (params.get('lib') || 'https://raw.githubusercontent.com/anteloc/ldraw-lib/master/ldraw').replace(/\/+$/, '');

  // Primitives usually live in p/, everything else in parts/. Without a
  // server-side resolver, asking the likely folder first saves a 404 per file.
  const PRIMITIVE = /^(48\/|8\/|\d+-\d+|stu|box|rect|edge|ring|cyl|con\d|disc|ndis|tri|logo|axl|bush|peghole|connect|beam|tooth|npeg|filstud|knob|empty)/;
  function libraryUrls(id) {
    const path = id.replaceAll('\\', '/').toLowerCase().split('/').map(encodeURIComponent).join('/');
    const folders = PRIMITIVE.test(path) ? ['p', 'parts', 'models'] : ['parts', 'p', 'models'];
    return folders.map(folder => `${LIB}/${folder}/${path}`);
  }

  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  const background = theme === 'dark' ? 0x1b1e24 : 0xf2f2f2;

  // Same-origin links download with the `download` attribute; browsers ignore
  // it across origins (Git LFS files come from media.githubusercontent.com),
  // so those are fetched and saved as a blob under their own name.
  function sameOrigin(url) {
    return new URL(url, location.href).origin === location.origin;
  }
  function fileNameOf(url) {
    return decodeURIComponent(new URL(url, location.href).pathname.split('/').pop());
  }
  async function save(url, name) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await response.blob());
    link.download = name || fileNameOf(url);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 30000);
  }
  function downloadLink(a, url, name, onError) {
    a.href = url;
    a.setAttribute('download', name || fileNameOf(url));
    if (sameOrigin(url)) return;
    a.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      save(url, name).catch(e => onError && onError(e));
    });
  }

  window.STATIC = { LIB, libraryUrls, theme, background, downloadLink, fileNameOf };
})();
