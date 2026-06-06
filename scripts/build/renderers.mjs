import {
  basePageEntries,
  defaultShareImage,
  legacyPageEntries,
  personSchemaId,
  personSchemaName,
  siteBaseUrl,
  websiteSchemaId
} from './config.mjs';
import {
  assertRequired,
  buildAttr,
  buildBooleanAttr,
  escapeHtml,
  normalizeMultilineHtml,
  renderTemplate,
  toAbsoluteUrl
} from './template-utils.mjs';

function createProjectStructuredData({
  projectTitle,
  pageTitle,
  pageDescription,
  pageCanonicalUrl,
  pageShareImage
}) {
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteSchemaId,
        url: `${siteBaseUrl}/`,
        name: `${personSchemaName} Portfolio`,
        inLanguage: ['en', 'es']
      },
      {
        '@type': 'Person',
        '@id': personSchemaId,
        name: personSchemaName,
        url: `${siteBaseUrl}/`,
        image: `${siteBaseUrl}/assets/images/ibai-fernandez-1x1-sidebar.jpeg`,
        email: 'mailto:info@ibaifernandez.com',
        telephone: '+57 322 428 8532',
        sameAs: [
          'https://linkedin.com/in/ibaifernandez',
          'https://github.com/ibaifernandez',
          'https://instagram.com/ibaifernandezec',
          'https://facebook.com/ibaifernandezec'
        ]
      },
      {
        '@type': 'WebPage',
        '@id': `${pageCanonicalUrl}#webpage`,
        url: pageCanonicalUrl,
        name: pageTitle,
        description: pageDescription,
        isPartOf: { '@id': websiteSchemaId },
        about: { '@id': personSchemaId },
        inLanguage: 'en'
      },
      {
        '@type': 'CreativeWork',
        '@id': `${pageCanonicalUrl}#case-study`,
        name: projectTitle,
        description: pageDescription,
        url: pageCanonicalUrl,
        image: pageShareImage,
        author: { '@id': personSchemaId },
        creator: { '@id': personSchemaId },
        mainEntityOfPage: { '@id': `${pageCanonicalUrl}#webpage` },
        inLanguage: 'en'
      }
    ]
  };

  return JSON.stringify(payload, null, 2);
}

function isPublishedProject(project) {
  return project?.page?.published !== false;
}

export function createBuildRuntime(context) {
  const { readComponent, readJson } = context;

  function readActiveProjects() {
    return readJson('content/projects.json').filter(isPublishedProject);
  }

  function readArchivedProjects() {
    try {
      return readJson('content/projects.archived.json').filter(isPublishedProject);
    } catch {
      return [];
    }
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
    const projects = readActiveProjects();
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

  function renderTrainingTimeline() {
    const items = readJson('content/training.json');
    const nodeTemplate = readComponent('src/components/index/training-node.html');

    return items.map((item, index) => {
      const labelPrefix = `training[${index}]`;
      const degree = item.degree || {};
      const description = item.description || {};
      const institution = assertRequired(item.institution, `${labelPrefix}.institution`);
      let logoHtml;
      if (item.logo) {
        const alt = escapeHtml(`${institution} logo`);
        const src = escapeHtml(item.logo);
        const sources = [];
        if (item.logoAvif) sources.push(`<source type="image/avif" srcset="${escapeHtml(item.logoAvif)}">`);
        if (item.logoWebp) sources.push(`<source type="image/webp" srcset="${escapeHtml(item.logoWebp)}">`);
        const fallbackHint = sources.length > 0 ? ' data-avif-fallback="true"' : '';
        const imgTag = `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" width="48" height="48"${fallbackHint}>`;
        logoHtml = sources.length > 0
          ? `<picture>${sources.join('')}${imgTag}</picture>`
          : imgTag;
      } else {
        logoHtml = `<span class="training_node_logo_fallback" aria-hidden="true">${escapeHtml(institution)}</span>`;
      }

      return renderTemplate(nodeTemplate, {
        accentClass: assertRequired(item.accentClass, `${labelPrefix}.accentClass`),
        year: assertRequired(item.year, `${labelPrefix}.year`),
        flag: assertRequired(item.flag, `${labelPrefix}.flag`),
        institution,
        logoHtml,
        degreeText: assertRequired(degree.text, `${labelPrefix}.degree.text`),
        degreeTranslateAttr: buildAttr('translate', degree.translate),
        descriptionText: assertRequired(description.text, `${labelPrefix}.description.text`),
        descriptionTranslateAttr: buildAttr('translate', description.translate)
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

  function renderExperienceTimeline() {
    const data = readJson('content/experience.json');
    const companies = data?.companies;
    if (!Array.isArray(companies) || companies.length === 0) {
      throw new Error('Invalid content data: experience.companies must be a non-empty array');
    }

    const flatTpl = readComponent('src/components/index/experience-company-flat.html');
    const nestedCompanyTpl = readComponent('src/components/index/experience-company-nested.html');
    const nestedRoleTpl = readComponent('src/components/index/experience-role-nested.html');

    function renderResponsibilityList(role, prefix) {
      return role.responsibilities.map((r, i) => {
        const key = assertRequired(r.key, `${prefix}.responsibilities[${i}].key`);
        const text = assertRequired(r.text, `${prefix}.responsibilities[${i}].text`);
        return `\t\t\t\t<li translate-html="${escapeHtml(key)}">${text}</li>`;
      }).join('\n');
    }

    function renderRoleContent(role, prefix) {
      const introKey = assertRequired(role.introKey, `${prefix}.introKey`);
      const introText = assertRequired(role.introText, `${prefix}.introText`);
      const respHeadingKey = assertRequired(role.respHeadingKey, `${prefix}.respHeadingKey`);
      const respHeadingText = assertRequired(role.respHeadingText, `${prefix}.respHeadingText`);
      const closingBlock = role.closingText
        ? `\n\t\t\t<p translate-html="${escapeHtml(role.closingKey)}">${role.closingText}</p>`
        : '';
      return [
        `\t\t\t<p translate-html="${escapeHtml(introKey)}">${introText}</p>`,
        `\t\t\t<h4 translate="${escapeHtml(respHeadingKey)}">${escapeHtml(respHeadingText)}</h4>`,
        `\t\t\t<ul>`,
        renderResponsibilityList(role, prefix),
        `\t\t\t</ul>${closingBlock}`
      ].join('\n');
    }

    return companies.map((company, ci) => {
      const cPrefix = `experience.companies[${ci}]`;
      const year = assertRequired(company.year, `${cPrefix}.year`);
      const name = assertRequired(company.name, `${cPrefix}.name`);
      const metaText = assertRequired(company.metaText, `${cPrefix}.metaText`);
      const metaKey = assertRequired(company.metaKey, `${cPrefix}.metaKey`);
      const openAttr = company.open ? ' open' : '';
      const roles = company.roles;
      if (!Array.isArray(roles) || roles.length === 0) {
        throw new Error(`Invalid content data: ${cPrefix}.roles must be a non-empty array`);
      }

      if (company.singleRole) {
        const role0 = roles[0];
        return renderTemplate(flatTpl, {
          openAttr,
          year: escapeHtml(year),
          name: escapeHtml(name),
          metaText,
          metaTranslateAttr: buildAttr('translate', metaKey),
          roleContent: renderRoleContent(role0, `${cPrefix}.roles[0]`)
        });
      }

      const rolesHtml = roles.map((role, ri) => {
        const rPrefix = `${cPrefix}.roles[${ri}]`;
        return renderTemplate(nestedRoleTpl, {
          roleYear: escapeHtml(assertRequired(role.year, `${rPrefix}.year`)),
          roleName: assertRequired(role.roleName, `${rPrefix}.roleName`),
          roleNameTranslateAttr: buildAttr('translate', role.roleNameKey),
          roleMeta: assertRequired(role.roleMeta, `${rPrefix}.roleMeta`),
          roleMetaTranslateAttr: buildAttr('translate', role.roleMetaKey),
          roleContent: renderRoleContent(role, rPrefix)
        });
      }).join('\n');

      return renderTemplate(nestedCompanyTpl, {
        openAttr,
        year: escapeHtml(year),
        name: escapeHtml(name),
        metaText,
        metaTranslateAttr: buildAttr('translate', metaKey),
        rolesHtml
      });
    }).join('\n');
  }

  const renderers = {
    'training-timeline': renderTrainingTimeline,
    'projects-grid': renderProjectsGrid,
    'testimonials-slides': renderTestimonialsSlides,
    'services-grid': renderServicesGrid,
    'experience-timeline': renderExperienceTimeline,
    'hero-cta-buttons': () => renderDualCtaButtons('hero')
  };

  function renderDirective(renderName) {
    const renderer = renderers[renderName];
    if (!renderer) {
      throw new Error(`Unknown render directive: ${renderName}`);
    }
    return renderer();
  }

  function renderProjectPageEntries() {
    const projects = readActiveProjects();
    const localPages = projects.map((project, index) => {
      const labelPrefix = `projects[${index}]`;
      const page = project.page || {};
      const title = project.title || {};
      const description = project.description || {};
      const output = assertRequired(page.output, `${labelPrefix}.page.output`);
      // template is REQUIRED — no silent scaffold fallback. A missing/typo'd
      // template field used to route the page to the bare project.template.html
      // scaffold and overwrite real content with no error (A-DEBT-04).
      const template = assertRequired(page.template, `${labelPrefix}.page.template`);
      const pageDescription = assertRequired(description.text, `${labelPrefix}.description.text`);
      const pageCanonicalUrl = `${siteBaseUrl}/${output}`;
      const shareImage = page.shareImage || defaultShareImage;
      const pageShareImage = toAbsoluteUrl(shareImage, siteBaseUrl);
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
          pageStructuredDataJson: createProjectStructuredData({
            projectTitle: project.titleText,
            pageTitle: `${project.titleText} | Project Dossier`,
            pageDescription: project.pageDescription,
            pageCanonicalUrl: project.pageCanonicalUrl,
            pageShareImage: project.pageShareImage
          }),
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

  function getPageEntries() {
    return [...basePageEntries, ...legacyPageEntries, ...renderProjectPageEntries()];
  }

  function getManagedProjectOutputs() {
    const projectEntries = [...readActiveProjects(), ...readArchivedProjects()];
    return [...new Set(
      projectEntries
        .map((project) => project?.page?.output)
        .filter((output) => typeof output === 'string' && output.trim() !== '')
    )];
  }

  return {
    getPageEntries,
    getManagedProjectOutputs,
    renderDirective
  };
}
