#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const siteBaseUrl = 'https://portfolio.ibaifernandez.com';
const defaultShareImage = `${siteBaseUrl}/assets/images/240610-featured-image.jpeg`;
const projectShareImageMap = {
  'project-debtracker.html': 'assets/images/debtracker.png',
  'project-gymtracker.html': 'assets/images/gymtracker-cover-2.png',
  'project-enterprise-crm.html': 'assets/images/lfi-newspaper.jpg',
  'project-national-tech-evangelism.html': 'assets/images/2x2.png',
  'project-elm-st.html': 'assets/images/elm-st-web.png',
  'project-aglaya.html': 'assets/images/aglaya-web.png'
};

const basePageEntries = [
  { template: 'src/pages/index.template.html', output: 'index.html' },
  { template: 'src/pages/blog.template.html', output: 'blog.html' }
];

const includePattern = /<!--\s*@include\s+([^\s]+)\s*-->/g;
const renderPattern = /<!--\s*@render\s+([^\s]+)\s*-->/g;
const componentCache = new Map();
const jsonCache = new Map();

const renderers = {
  'training-timeline': renderTrainingTimeline,
  'projects-grid': renderProjectsGrid,
  'testimonials-slides': renderTestimonialsSlides,
  'services-grid': renderServicesGrid,
  'experience-rows': renderExperienceRows,
  'hero-cta-buttons': () => renderDualCtaButtons('hero'),
  'about-cta-buttons': () => renderDualCtaButtons('about'),
  'training-linkedin-cta': () => renderSingleCtaButton('trainingLinkedin')
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getValueByPath(data, keyPath) {
  return keyPath.split('.').reduce((current, segment) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[segment];
  }, data);
}

function renderTemplate(template, data) {
  const withRawValues = template.replace(/{{{\s*([^}]+?)\s*}}}/g, (_match, keyPath) => {
    const value = getValueByPath(data, keyPath.trim());
    return value === undefined || value === null ? '' : String(value);
  });

  return withRawValues.replace(/{{\s*([^}]+?)\s*}}/g, (_match, keyPath) => {
    const value = getValueByPath(data, keyPath.trim());
    return value === undefined || value === null ? '' : escapeHtml(value);
  });
}

function readJson(relativePath) {
  if (jsonCache.has(relativePath)) {
    return jsonCache.get(relativePath);
  }

  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`JSON data file not found: ${relativePath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  jsonCache.set(relativePath, parsed);
  return parsed;
}

function readComponent(relativePath) {
  if (componentCache.has(relativePath)) {
    return componentCache.get(relativePath);
  }

  const absolutePath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Component template not found: ${relativePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf8');
  componentCache.set(relativePath, raw);
  return raw;
}

function buildAttr(name, value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return ` ${name}="${escapeHtml(value)}"`;
}

function buildBooleanAttr(name, value) {
  if (!value) {
    return '';
  }
  return ` ${name}`;
}

function assertRequired(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Invalid content data: missing ${label}`);
  }
  return value;
}

function normalizeMultilineHtml(rawHtml) {
  if (!rawHtml) {
    return '';
  }
  return String(rawHtml)
    .split('\n')
    .map((line) => (line.trim() ? `\t\t\t${line.trim()}` : ''))
    .join('\n')
    .trimEnd();
}

function toAbsoluteUrl(value) {
  if (!value) {
    return '';
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${siteBaseUrl}/${String(value).replace(/^\/+/, '')}`;
}

function renderDualCtaButtons(sectionKey) {
  const ctas = readJson('content/ctas.json');
  const section = ctas?.[sectionKey] || {};
  const primary = section.primary || {};
  const secondary = section.secondary || {};
  const labelPrefix = `ctas.${sectionKey}`;
  const template = readComponent('src/components/index/dual-cta-buttons.html');

  return renderTemplate(template, {
    containerClass: assertRequired(section.containerClass, `${labelPrefix}.containerClass`),
    primaryHref: assertRequired(primary.href, `${labelPrefix}.primary.href`),
    primaryClass: assertRequired(primary.className, `${labelPrefix}.primary.className`),
    primaryTargetAttr: buildAttr('target', primary.target),
    primaryRelAttr: buildAttr('rel', primary.rel),
    primaryDownloadAttr: buildBooleanAttr('download', Boolean(primary.download)),
    primaryFirstTranslateAttr: buildAttr('translate', primary.firstTranslate),
    primaryFirstText: assertRequired(primary.firstText, `${labelPrefix}.primary.firstText`),
    primarySecondTranslateAttr: buildAttr('translate', primary.secondTranslate),
    primarySecondText: assertRequired(primary.secondText, `${labelPrefix}.primary.secondText`),
    secondaryHref: assertRequired(secondary.href, `${labelPrefix}.secondary.href`),
    secondaryClass: assertRequired(secondary.className, `${labelPrefix}.secondary.className`),
    secondaryTargetAttr: buildAttr('target', secondary.target),
    secondaryRelAttr: buildAttr('rel', secondary.rel),
    secondaryDownloadAttr: buildBooleanAttr('download', Boolean(secondary.download)),
    secondaryFirstTranslateAttr: buildAttr('translate', secondary.firstTranslate),
    secondaryFirstText: assertRequired(secondary.firstText, `${labelPrefix}.secondary.firstText`),
    secondarySecondTranslateAttr: buildAttr('translate', secondary.secondTranslate),
    secondarySecondText: assertRequired(secondary.secondText, `${labelPrefix}.secondary.secondText`)
  });
}

function renderSingleCtaButton(sectionKey) {
  const ctas = readJson('content/ctas.json');
  const section = ctas?.[sectionKey] || {};
  const labelPrefix = `ctas.${sectionKey}`;
  const template = readComponent('src/components/index/single-cta-button.html');

  return renderTemplate(template, {
    columnClass: assertRequired(section.columnClass, `${labelPrefix}.columnClass`),
    containerClass: assertRequired(section.containerClass, `${labelPrefix}.containerClass`),
    href: assertRequired(section.href, `${labelPrefix}.href`),
    targetAttr: buildAttr('target', section.target),
    relAttr: buildAttr('rel', section.rel),
    downloadAttr: buildBooleanAttr('download', Boolean(section.download)),
    buttonClass: assertRequired(section.buttonClass, `${labelPrefix}.buttonClass`),
    firstTranslateAttr: buildAttr('translate', section.firstTranslate),
    firstText: assertRequired(section.firstText, `${labelPrefix}.firstText`),
    secondHtml: assertRequired(section.secondHtml, `${labelPrefix}.secondHtml`)
  });
}

function renderProjectsGrid() {
  const projects = readJson('content/projects.json');
  const cardTemplate = readComponent('src/components/index/project-card.html');
  const linkTemplate = '<a class="project_spotlight_cta" href="{{href}}"{{{targetAttr}}}{{{relAttr}}}{{{labelTranslateAttr}}}>{{labelText}}</a>';
  const mediaLinkTemplate = '<a class="project_spotlight_media_link" href="{{href}}"{{{targetAttr}}}{{{relAttr}}}{{{ariaLabelAttr}}}>';

  return projects.map((project, index) => {
    const labelPrefix = `projects[${index}]`;
    const description = project.description || {};
    const link = project.link || {};
    const rowIndex = Math.floor(index / 2);
    const columnIndex = index % 2;
    const isMediaFirst = rowIndex % 2 === columnIndex % 2;
    const hasLink = typeof link.href === 'string' && link.href.trim() !== '';

    const linkHtml = hasLink
      ? renderTemplate(linkTemplate, {
          href: link.href,
          targetAttr: buildAttr('target', link.target),
          relAttr: buildAttr('rel', link.rel),
          labelText: link.label?.text || 'Open Project Page',
          labelTranslateAttr: buildAttr('translate', link.label?.translate)
        })
      : '';
    const mediaLinkOpen = hasLink
      ? renderTemplate(mediaLinkTemplate, {
          href: link.href,
          targetAttr: buildAttr('target', link.target),
          relAttr: buildAttr('rel', link.rel),
          ariaLabelAttr: buildAttr('aria-label', `${project.title?.text || 'Project'} - ${link.label?.text || 'Open Project Page'}`)
        })
      : '';
    const mediaLinkClose = hasLink ? '</a>' : '';

    return renderTemplate(cardTemplate, {
      layoutClass: isMediaFirst
        ? 'project_spotlight_project--media-first'
        : 'project_spotlight_project--text-first',
      mediaHtml: normalizeMultilineHtml(assertRequired(project.mediaHtml, `${labelPrefix}.mediaHtml`)),
      mediaLinkOpen,
      mediaLinkClose,
      titleText: assertRequired(project.title?.text, `${labelPrefix}.title.text`),
      titleTranslateAttr: buildAttr('translate', project.title?.translate),
      descriptionText: assertRequired(description.text, `${labelPrefix}.description.text`),
      descriptionTranslateAttr: buildAttr('translate', description.translate),
      linkHtml
    });
  }).join('\n');
}

function renderTrainingTitleRow(item, labelPrefix) {
  const yearHtml = [
    '\t\t\t\t\t\t\t\t<div class="left_title">',
    `\t\t\t\t\t\t\t\t\t<h4>${escapeHtml(assertRequired(item.year, `${labelPrefix}.year`))}</h4>`,
    '\t\t\t\t\t\t\t\t</div>'
  ].join('\n');

  const location = item.location || {};
  const locationTranslateAttr = buildAttr('translate', location.translate);
  const locationBadgeClass = assertRequired(location.badgeClass, `${labelPrefix}.location.badgeClass`);
  const locationText = assertRequired(location.text, `${labelPrefix}.location.text`);
  const locationHtml = [
    `\t\t\t\t\t\t\t\t<div class="right_title ${escapeHtml(locationBadgeClass)}">`,
    `\t\t\t\t\t\t\t\t\t<h4${locationTranslateAttr}>${escapeHtml(locationText)}</h4>`,
    '\t\t\t\t\t\t\t\t</div>'
  ].join('\n');

  const titleOrder = assertRequired(item.titleOrder, `${labelPrefix}.titleOrder`);
  if (titleOrder === 'year-location') {
    return `${yearHtml}\n${locationHtml}`;
  }
  if (titleOrder === 'location-year') {
    return `${locationHtml}\n${yearHtml}`;
  }

  throw new Error(`Invalid content data: unsupported ${labelPrefix}.titleOrder (${titleOrder})`);
}

function renderTrainingImageColumn(image, labelPrefix) {
  if (!image) {
    return '';
  }

  const columnClass = assertRequired(image.columnClass, `${labelPrefix}.columnClass`);
  const imageHtml = normalizeMultilineHtml(assertRequired(image.html, `${labelPrefix}.html`));

  return [
    `\t\t\t\t\t\t\t\t\t<div class="${escapeHtml(columnClass)}">`,
    '\t\t\t\t\t\t\t\t\t\t<div class="education_mleft education_left ">',
    '\t\t\t\t\t\t\t\t\t\t\t<div class="edu_mainyear edu_leftyear">',
    '\t\t\t\t\t\t\t\t\t\t\t\t<h1>',
    `${imageHtml}`,
    '\t\t\t\t\t\t\t\t\t\t\t\t</h1>',
    '\t\t\t\t\t\t\t\t\t\t\t</div>',
    '\t\t\t\t\t\t\t\t\t\t</div>',
    '\t\t\t\t\t\t\t\t\t</div>'
  ].join('\n');
}

function renderTrainingTimeline() {
  const items = readJson('content/training.json');
  const itemTemplate = readComponent('src/components/index/training-item.html');

  return items.map((item, index) => {
    const labelPrefix = `training[${index}]`;
    const degree = item.degree || {};
    const institution = item.institution || {};
    const description = item.description || {};

    return renderTemplate(itemTemplate, {
      boxClass: assertRequired(item.boxClass, `${labelPrefix}.boxClass`),
      contentSideClass: assertRequired(item.contentSideClass, `${labelPrefix}.contentSideClass`),
      primaryImageColumnHtml: renderTrainingImageColumn(item.imagePrimary, `${labelPrefix}.imagePrimary`),
      secondaryImageColumnHtml: renderTrainingImageColumn(item.imageSecondary, `${labelPrefix}.imageSecondary`),
      titleRowHtml: renderTrainingTitleRow(item, labelPrefix),
      degreeTranslateAttr: buildAttr('translate', degree.translate),
      degreePrefixHover: assertRequired(degree.prefixHover, `${labelPrefix}.degree.prefixHover`),
      degreePrefixText: assertRequired(degree.prefixText, `${labelPrefix}.degree.prefixText`),
      degreeSuffixText: assertRequired(degree.suffixText, `${labelPrefix}.degree.suffixText`),
      institutionClass: assertRequired(institution.className, `${labelPrefix}.institution.className`),
      institutionTranslateAttr: buildAttr('translate', institution.translate),
      institutionText: assertRequired(institution.text, `${labelPrefix}.institution.text`),
      descriptionTranslateAttr: buildAttr('translate', description.translate),
      descriptionText: assertRequired(description.text, `${labelPrefix}.description.text`)
    });
  }).join('\n');
}

function renderTestimonialsSlides() {
  const testimonials = readJson('content/testimonials.json');
  const slideTemplate = readComponent('src/components/index/testimonial-slide.html');

  return testimonials.map((testimonial, index) => {
    const labelPrefix = `testimonials[${index}]`;
    return renderTemplate(slideTemplate, {
      imageHtml: normalizeMultilineHtml(assertRequired(testimonial.imageHtml, `${labelPrefix}.imageHtml`)),
      recommendationText: assertRequired(testimonial.recommendation?.text, `${labelPrefix}.recommendation.text`),
      recommendationClassAttr: buildAttr('class', testimonial.recommendation?.className),
      recommendationTranslateAttr: buildAttr('translate', testimonial.recommendation?.translate),
      name: assertRequired(testimonial.name, `${labelPrefix}.name`),
      role: assertRequired(testimonial.role, `${labelPrefix}.role`),
      context: assertRequired(testimonial.context, `${labelPrefix}.context`)
    });
  }).join('\n');
}

function renderServicesGrid() {
  const section = readJson('content/services.json');
  const groups = section?.groups;
  const groupTemplate = readComponent('src/components/index/services-group.html');
  const cardTemplate = readComponent('src/components/index/service-card.html');

  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error('Invalid content data: services.groups must be a non-empty array');
  }

  return groups.map((group, groupIndex) => {
    const labelPrefix = `services.groups[${groupIndex}]`;
    const heading = group.heading || {};
    const cards = group.cards;

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error(`Invalid content data: ${labelPrefix}.cards must be a non-empty array`);
    }

    const cardsHtml = cards.map((card, cardIndex) => {
      const cardLabelPrefix = `${labelPrefix}.cards[${cardIndex}]`;
      const title = card.title || {};
      const description = card.description || {};

      return renderTemplate(cardTemplate, {
        iconClass: assertRequired(card.iconClass, `${cardLabelPrefix}.iconClass`),
        titleTranslateAttr: buildAttr('translate', title.translate),
        titleText: assertRequired(title.text, `${cardLabelPrefix}.title.text`),
        descriptionTranslateAttr: buildAttr('translate', description.translate),
        descriptionHtml: assertRequired(description.html, `${cardLabelPrefix}.description.html`)
      });
    }).join('\n');

    return renderTemplate(groupTemplate, {
      headingTranslateAttr: buildAttr('translate', heading.translate),
      headingText: assertRequired(heading.text, `${labelPrefix}.heading.text`),
      cardsHtml
    });
  }).join('\n');
}

function renderExperienceRows() {
  const section = readJson('content/experience.json');
  const rows = section?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Invalid content data: experience.rows must be a non-empty array');
  }

  return rows.map((row, rowIndex) => {
    const labelPrefix = `experience.rows[${rowIndex}]`;
    const rowClass = assertRequired(row.rowClass, `${labelPrefix}.rowClass`);
    const cards = row.cards;

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error(`Invalid content data: ${labelPrefix}.cards must be a non-empty array`);
    }

    const cardsHtml = cards.map((card, cardIndex) => {
      const cardLabelPrefix = `${labelPrefix}.cards[${cardIndex}]`;
      const componentPath = assertRequired(card.component, `${cardLabelPrefix}.component`);
      return readComponent(componentPath).trimEnd();
    }).join('\n');

    return `<div class="${escapeHtml(rowClass)}">\n${cardsHtml}\n</div>`;
  }).join('\n');
}

function renderDirective(renderName) {
  const renderer = renderers[renderName];
  if (!renderer) {
    throw new Error(`Unknown render directive: ${renderName}`);
  }
  return renderer();
}

function renderProjectPageEntries() {
  const projects = readJson('content/projects.json');
  const localPages = projects.map((project, index) => {
    const labelPrefix = `projects[${index}]`;
    const page = project.page || {};
    const title = project.title || {};
    const description = project.description || {};
    const output = assertRequired(page.output, `${labelPrefix}.page.output`);
    const template = page.template || 'src/pages/project.template.html';
    const pageDescription = assertRequired(description.text, `${labelPrefix}.description.text`);
    const pageCanonicalUrl = `${siteBaseUrl}/${output}`;
    const shareImage = page.shareImage || projectShareImageMap[output] || defaultShareImage;
    const pageShareImage = toAbsoluteUrl(shareImage);
    const pageKeywords = page.keywords || 'Ibai Fernández, portfolio project, digital architecture, automation';

    return {
      template,
      output,
      titleText: assertRequired(title.text, `${labelPrefix}.title.text`),
      descriptionText: pageDescription,
      mediaHtml: normalizeMultilineHtml(assertRequired(project.mediaHtml, `${labelPrefix}.mediaHtml`)),
      pageDescription,
      pageCanonicalUrl,
      pageShareImage,
      pageKeywords
    };
  });

  const navTemplate = '<a class="project_case_navlink {{modifierClass}}" href="{{href}}">{{label}}</a>';

  return localPages.map((project, index) => {
    const previousProject = localPages[index - 1];
    const nextProject = localPages[index + 1];
    const previousProjectNavHtml = previousProject
      ? renderTemplate(navTemplate, {
          href: previousProject.output,
          modifierClass: 'project_case_navlink--prev',
          label: `Prev: ${previousProject.titleText}`
        })
      : '';
    const nextProjectNavHtml = nextProject
      ? renderTemplate(navTemplate, {
          href: nextProject.output,
          modifierClass: 'project_case_navlink--next',
          label: `Next: ${nextProject.titleText}`
        })
      : '';

    return {
      template: project.template,
      output: project.output,
      data: {
        pageTitle: `${project.titleText} | Project Dossier`,
        pageDescription: project.pageDescription,
        pageCanonicalUrl: project.pageCanonicalUrl,
        pageShareImage: project.pageShareImage,
        pageKeywords: project.pageKeywords,
        pageAuthor: 'Ibai Fernández',
        pageOgType: 'article',
        projectTitle: project.titleText,
        projectDescription: project.descriptionText,
        projectMediaHtml: project.mediaHtml,
        projectBackHref: 'index.html#project_sec',
        projectIndexHref: 'index.html#project_sec',
        previousProjectNavHtml,
        nextProjectNavHtml
      }
    };
  });
}

function renderWithIncludes(filePath, stack = [], data = {}) {
  const absolutePath = path.resolve(rootDir, filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${filePath}`);
  }

  if (stack.includes(absolutePath)) {
    const cycle = [...stack, absolutePath].map((item) => path.relative(rootDir, item)).join(' -> ');
    throw new Error(`Circular include detected: ${cycle}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf8');
  const withIncludes = raw.replace(includePattern, (_match, includePath) => {
    const resolved = path.resolve(path.dirname(absolutePath), includePath);
    const relative = path.relative(rootDir, resolved);
    return renderWithIncludes(relative, [...stack, absolutePath], data);
  });

  const withRenders = withIncludes.replace(renderPattern, (_match, renderName) => renderDirective(renderName));
  return renderTemplate(withRenders, data);
}

let hasErrors = false;
const pageEntries = [...basePageEntries, ...renderProjectPageEntries()];

for (const entry of pageEntries) {
  const templatePath = path.resolve(rootDir, entry.template);
  if (!fs.existsSync(templatePath)) {
    continue;
  }

  try {
    const rendered = renderWithIncludes(entry.template, [], entry.data || {});
    const outputPath = path.resolve(rootDir, entry.output);

    if (checkOnly) {
      const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
      if (current !== rendered) {
        hasErrors = true;
        console.error(`[FAIL] Outdated generated page: ${entry.output} (run: npm run build:pages)`);
      } else {
        console.log(`[OK] ${entry.output} is in sync with templates`);
      }
      continue;
    }

    fs.writeFileSync(outputPath, rendered);
    console.log(`[OK] Built ${entry.output} from ${entry.template}`);
  } catch (error) {
    hasErrors = true;
    console.error(`[FAIL] ${entry.output}: ${error.message}`);
  }
}

if (hasErrors) {
  process.exit(1);
}
