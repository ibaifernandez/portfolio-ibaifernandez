import fs from 'node:fs';
import path from 'node:path';

import { siteBaseUrl } from './config.mjs';

/**
 * Build sitemap.xml + llms.txt + llms-full.txt from content/projects.json.
 *
 * Single source of truth for what's publicly indexable:
 *   - content/projects.json    → 4 active dossiers (published === true)
 *   - basePageEntries (home, cv-print)
 *
 * llms-full.txt content blocks are static per project; they live below.
 * If the narrative changes, update the templates in this file.
 */

const PROJECT_BLURBS = {
  'lfi.html': {
    title: 'LFi: Agency Operating Systems',
    purpose: 'Agency operating-systems case proving CRM routing, qualification logic, launch governance, and commercial reliability across 18+ enterprise accounts through the POCURO and Leben proof modules.'
  },
  'ruta-de-la-digitalizacion-y-2x2-mkt.html': {
    title: 'The Route to Digitalization / 2x2MKT',
    purpose: 'Nationwide upskilling, field operations, and crisis-proof digital adoption program onboarding 10,600+ users into digital conversion funnels.'
  },
  'elm-st.html': {
    title: 'Elm St: Reel-First Brand Website',
    purpose: 'Cinematic brand system, reel-first UX, and custom audiovisual portfolio architecture case. YouTube embeds, brand psychology, audiovisual UX.'
  },
  'aglaya.html': {
    title: 'AGLAYA: Remote Agency Operations',
    purpose: 'Conversion-first remote agency operating system, staged growth services, and brand-evaluation-driven acquisition case.'
  }
};

function todayIso() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function readActiveDossierOutputs(rootDir) {
  const projectsPath = path.resolve(rootDir, 'content/projects.json');
  const raw = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  return raw
    .filter((p) => p?.page?.published !== false)
    .map((p) => p?.page?.output)
    .filter((output) => typeof output === 'string' && output.trim() !== '');
}

function renderSitemapEntry(url, lastmod, priority, changefreq) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${url}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="es" href="${url}?lang=es"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
  </url>`;
}

export function renderSitemap(rootDir) {
  const today = todayIso();
  const outputs = readActiveDossierOutputs(rootDir);

  const entries = [
    renderSitemapEntry(`${siteBaseUrl}/`, today, '1.0', 'weekly'),
    ...outputs.map((output, idx) => {
      const isLfi = output === 'lfi.html';
      const priority = isLfi ? '0.9' : '0.8';
      return renderSitemapEntry(`${siteBaseUrl}/${output}`, today, priority, 'monthly');
    })
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

export function renderLlmsTxt(rootDir) {
  const outputs = readActiveDossierOutputs(rootDir);
  const primaryPages = [
    `- ${siteBaseUrl}/`,
    ...outputs.map((output) => `- ${siteBaseUrl}/${output}`)
  ].join('\n');

  return `# Ibai Fernandez Portfolio

Site: ${siteBaseUrl}/
Owner: Ibai Fernandez
Contact: mailto:info@ibaifernandez.com
Languages: en, es
Positioning: AI Product Engineer · Founder-Operator

Primary pages:
${primaryPages}

Discovery:
- robots: ${siteBaseUrl}/robots.txt
- sitemap: ${siteBaseUrl}/sitemap.xml
- llms-full: ${siteBaseUrl}/llms-full.txt
`;
}

export function renderLlmsFullTxt(rootDir) {
  const today = todayIso();
  const outputs = readActiveDossierOutputs(rootDir);

  const projectBlocks = outputs
    .map((output) => {
      const blurb = PROJECT_BLURBS[output];
      if (!blurb) {
        return `- ${blurb?.title || output}: ${siteBaseUrl}/${output}\n  - Purpose: see dossier page.`;
      }
      return `- ${blurb.title}: ${siteBaseUrl}/${output}\n  - Purpose: ${blurb.purpose}`;
    })
    .join('\n');

  return `# Ibai Fernandez Portfolio - Full LLM Index

Last-Updated: ${today}
Base-URL: ${siteBaseUrl}/

## Overview
Founder-operator who codes. AI Product Engineer with two decades connecting narrative, systems, and delivery. Builds production systems end-to-end: RegTech compliance pipelines, multi-tenant SaaS, email infrastructure, IRL discovery products, open-source AI tooling. EU citizen, remote, building right now.

## Currently Shipping
- Scanner 21.179 — automated RegTech audit pipeline against Chile's Ley 21.719 data privacy regulation. Give it a URL, get a compliance report.
- Kanban Desk — project management for teams that want to own their stack. Multi-tenant SaaS.
- Outreach — a whole email marketing department compressed into a single app. Email infrastructure built for scale.
- Pulse — email engagement turned into a prioritized call list. Sales intelligence layer on top of any ESP.
- Web — websites built right, fully owned, zero-dependent. Custom architecture, no vendor lock-in.
- Open-source AI tooling — Claude, Cursor, Codex agent orchestration patterns.

## Canonical Pages
- Home: ${siteBaseUrl}/
  - Purpose: profile, capabilities, work history, project index, testimonials, contact.
${projectBlocks}

## Contact
- Email: info@ibaifernandez.com
- WhatsApp: +57 322 428 8532
- LinkedIn: https://linkedin.com/in/ibaifernandez
- GitHub: https://github.com/ibaifernandez

## Discovery Endpoints
- robots: ${siteBaseUrl}/robots.txt
- sitemap: ${siteBaseUrl}/sitemap.xml
- llms index: ${siteBaseUrl}/llms.txt
`;
}
