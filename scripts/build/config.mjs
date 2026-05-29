export const siteBaseUrl = 'https://portfolio.ibaifernandez.com';
export const defaultShareImage = `${siteBaseUrl}/assets/images/260525-featured-image.jpeg`;
export const personSchemaId = `${siteBaseUrl}/#ibai-fernandez`;
export const websiteSchemaId = `${siteBaseUrl}/#website`;
export const personSchemaName = 'Ibai Fernández';

export const projectShareImageMap = {
  'lfi.html': 'assets/images/lfi-la.png',
  'ruta-de-la-digitalizacion-y-2x2-mkt.html': 'assets/images/2x2.png',
  'elm-st.html': 'assets/images/elm-st-web.png',
  'aglaya.html': 'assets/images/aglaya-web.png'
};

export const basePageEntries = [
  { template: 'src/pages/index.template.html', output: 'index.html' },
  { template: 'src/pages/privacy.template.html', output: 'privacy.html' },
  { template: 'src/pages/dossier-scanner-21179.template.html', output: 'scanner-21179.html' },
  { template: 'src/pages/dossier-kanban-desk.template.html', output: 'kanban-desk.html' },
  { template: 'src/pages/dossier-crm-aglaya.template.html', output: 'crm-aglaya.html' },
  { template: 'src/pages/404.template.html', output: '404.html' }
];

export const legacyPageEntries = [
  {
    template: 'src/pages/lfi-legacy.template.html',
    output: 'lfi-legacy.html',
    data: {
      pageTitle: 'LFi Legacy Dossier | Archived Case Study',
      pageDescription: 'Archived pre-redesign LFi dossier kept as a private fallback reference outside the public discovery surface.',
      pageCanonicalUrl: `${siteBaseUrl}/lfi-legacy.html`,
      pageShareImage: `${siteBaseUrl}/assets/images/lfi-la.png`,
      pageKeywords: 'LFi legacy dossier, archived case study, agency systems history',
      pageAuthor: 'Ibai Fernández',
      pageOgType: 'article',
      projectBackHref: 'index.html#project_sec',
      projectIndexHref: 'index.html#project_sec',
      previousProjectNavHtml: '',
      nextProjectNavHtml: '',
      projectMediaHtml: '<picture>\n<source type="image/avif" srcset="assets/images/lfi-la.avif">\n<source type="image/webp" srcset="assets/images/lfi-la.webp">\n<img class="project_spotlight_img--lfi" src="assets/images/lfi-la.png" alt="LFi operations cockpit showing enterprise campaign orchestration and automation controls" loading="lazy" decoding="async" width="1800" height="1005" data-avif-fallback="true">\n</picture>'
    }
  }
];

export const generatedAssetEntries = [
  { source: 'assets/css/font.css', output: 'assets/css/font.min.css', type: 'css' },
  { source: 'assets/css/animate.css', output: 'assets/css/animate.min.css', type: 'css' },
  { source: 'assets/css/style.css', output: 'assets/css/style.min.css', type: 'css' },
  { source: 'assets/css/print.css', output: 'assets/css/print.min.css', type: 'css' },
  { source: 'assets/css/scrollbar.css', output: 'assets/css/scrollbar.min.css', type: 'css' },
  { source: 'assets/css/jquery-jvectormap-2.0.3.css', output: 'assets/css/jquery-jvectormap-2.0.3.min.css', type: 'css' },
  { source: 'assets/css/national-route.css', output: 'assets/css/national-route.min.css', type: 'css' },
  { source: 'assets/js/custom.js', output: 'assets/js/custom.min.js', type: 'js' },
  { source: 'assets/js/translate.js', output: 'assets/js/translate.min.js', type: 'js' },
  { source: 'assets/js/cookie-consent.js', output: 'assets/js/cookie-consent.min.js', type: 'js' },
  { source: 'assets/js/scrollbar.js', output: 'assets/js/scrollbar.min.js', type: 'js' },
  { source: 'assets/js/cvtext1.js', output: 'assets/js/cvtext1.min.js', type: 'js' },
  { source: 'assets/js/cvtext2.js', output: 'assets/js/cvtext2.min.js', type: 'js' },
  { source: 'assets/js/circle-progress.js', output: 'assets/js/circle-progress.min.js', type: 'js' },
  { source: 'assets/js/jquery-jvectormap-world-mill.js', output: 'assets/js/jquery-jvectormap-world-mill.min.js', type: 'js' }
];
