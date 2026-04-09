export const includePattern = /<!--\s*@include\s+([^\s]+)\s*-->/g;
export const renderPattern = /<!--\s*@render\s+([^\s]+)\s*-->/g;

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ensureTrailingNewline(value) {
  return value.endsWith('\n') ? value : `${value}\n`;
}

export function getValueByPath(data, keyPath) {
  return keyPath.split('.').reduce((current, segment) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[segment];
  }, data);
}

export function renderTemplate(template, data) {
  const withRawValues = template.replace(/{{{\s*([^}]+?)\s*}}}/g, (_match, keyPath) => {
    const value = getValueByPath(data, keyPath.trim());
    return value === undefined || value === null ? '' : String(value);
  });

  return withRawValues.replace(/{{\s*([^}]+?)\s*}}/g, (_match, keyPath) => {
    const value = getValueByPath(data, keyPath.trim());
    return value === undefined || value === null ? '' : escapeHtml(value);
  });
}

export function buildAttr(name, value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return ` ${name}="${escapeHtml(value)}"`;
}

export function buildBooleanAttr(name, value) {
  if (!value) {
    return '';
  }
  return ` ${name}`;
}

export function assertRequired(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Invalid content data: missing ${label}`);
  }
  return value;
}

export function normalizeMultilineHtml(rawHtml) {
  if (!rawHtml) {
    return '';
  }

  return String(rawHtml)
    .split('\n')
    .map((line) => (line.trim() ? `\t\t\t${line.trim()}` : ''))
    .join('\n')
    .trimEnd();
}

export function toAbsoluteUrl(value, siteRoot) {
  if (!value) {
    return '';
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${siteRoot}/${String(value).replace(/^\/+/, '')}`;
}
