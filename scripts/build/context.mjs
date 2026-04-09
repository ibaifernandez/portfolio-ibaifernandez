import fs from 'node:fs';
import path from 'node:path';

import {
  includePattern,
  renderPattern,
  renderTemplate
} from './template-utils.mjs';

export function createBuildContext(rootDir) {
  const componentCache = new Map();
  const jsonCache = new Map();

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

  function renderWithIncludes(filePath, { stack = [], data = {}, renderDirective } = {}) {
    const absolutePath = path.resolve(rootDir, filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    if (stack.includes(absolutePath)) {
      const cycle = [...stack, absolutePath]
        .map((item) => path.relative(rootDir, item))
        .join(' -> ');
      throw new Error(`Circular include detected: ${cycle}`);
    }

    const raw = fs.readFileSync(absolutePath, 'utf8');
    const withIncludes = raw.replace(includePattern, (_match, includePath) => {
      const resolved = path.resolve(path.dirname(absolutePath), includePath);
      const relative = path.relative(rootDir, resolved);
      return renderWithIncludes(relative, {
        stack: [...stack, absolutePath],
        data,
        renderDirective
      });
    });

    const withRenders = withIncludes.replace(renderPattern, (_match, renderName) => {
      if (typeof renderDirective !== 'function') {
        throw new Error('Render directive callback is required');
      }
      return renderDirective(renderName);
    });

    return renderTemplate(withRenders, data);
  }

  return {
    rootDir,
    readJson,
    readComponent,
    renderTemplate,
    renderWithIncludes
  };
}
