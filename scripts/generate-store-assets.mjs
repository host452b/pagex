import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Resvg } from '@resvg/resvg-js';

const ICON_SPECS = [
  { size: 16, squareSize: 16, squareOffset: 0, border: 1 },
  { size: 32, squareSize: 32, squareOffset: 0, border: 2 },
  { size: 48, squareSize: 48, squareOffset: 0, border: 3 },
  { size: 128, squareSize: 96, squareOffset: 16, border: 6 },
];

const PX_MATRIX = [
  '111100011110',
  '100100100001',
  '100100010010',
  '111100001100',
  '100000010010',
  '100000100001',
  '100000100001',
  '100000010010',
  '100000001100',
];
const FONT_STACK = "Menlo, Monaco, 'Courier New', monospace";

const SCREENSHOT_SCENES = [
  {
    fileName: 'pagex-screenshot-01-target-tab-1280x800.png',
    statusText: 'SYSTEM.IDLE',
    detailLines: ['SELECT TARGET TAB.', 'PARSE PAGE STRUCTURE.', 'COPY CLEAN JSON.'],
    summaryLines: ['NO PAYLOAD CAPTURED.'],
    metrics: ['-', '-', '-', '-'],
    calloutTitle: 'SELECT.TARGET',
    calloutLines: ['CHOOSE THE ACTIVE PAGE.', 'PRESS PARSE.'],
    buttonPrimary: 'PARSE',
    buttonSecondary: 'COPY.JSON',
    footerText: 'LOCAL OUTPUT. NO REMOTE SEND.',
  },
  {
    fileName: 'pagex-screenshot-02-parsing-1280x800.png',
    statusText: 'EXPAND + PARSE',
    detailLines: ['EXPANDING HIDDEN CONTENT.', 'COLLECTING DOM.'],
    summaryLines: ['ACTIVE TASK.', 'KEEP WINDOW OPEN OR RETURN LATER.'],
    metrics: ['4', '128', '7', '42 KB'],
    calloutTitle: 'RUNNING',
    calloutLines: ['DISCLOSURE PANELS OPEN.', 'FRAMES SCAN. JSON BUILD.'],
    buttonPrimary: 'PARSING...',
    buttonSecondary: 'COPY.JSON',
    footerText: 'LOCAL OUTPUT. NO REMOTE SEND.',
  },
  {
    fileName: 'pagex-screenshot-03-parse-complete-1280x800.png',
    statusText: 'PARSE.COMPLETE',
    detailLines: ['PAYLOAD READY.', 'PRESS COPY.JSON.'],
    summaryLines: ['4 ACCESSIBLE FRAMES.', '1 SKIPPED FRAME. 2 WARNINGS.'],
    metrics: ['5', '241', '9', '64 KB'],
    calloutTitle: 'PAYLOAD.READY',
    calloutLines: ['STRUCTURE. TEXT. STYLE SUMMARY.', 'HIDDEN CONTENT.'],
    buttonPrimary: 'PARSE',
    buttonSecondary: 'COPY.JSON',
    footerText: 'LOCAL OUTPUT. NO REMOTE SEND.',
  },
  {
    fileName: 'pagex-screenshot-04-copy-json-1280x800.png',
    statusText: 'PARSE.COMPLETE',
    detailLines: ['PAYLOAD READY.', 'PRESS COPY.JSON.'],
    summaryLines: ['4 ACCESSIBLE FRAMES.', '1 SKIPPED FRAME. 2 WARNINGS.'],
    metrics: ['5', '241', '9', '64 KB'],
    calloutTitle: 'COPY.JSON',
    calloutLines: ['MOVE CLEAN PAGE DATA', 'INTO YOUR AI WORKFLOW.'],
    buttonPrimary: 'PARSE',
    buttonSecondary: 'COPY.JSON',
    footerText: 'COPY COMPLETE.',
  },
];

function getProjectRoot() {
  return process.cwd();
}

function escapeText(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function drawRect(x, y, width, height, fill, strokeWidth, stroke) {
  let markup = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"`;

  if (strokeWidth > 0) {
    markup += ` stroke="${stroke}" stroke-width="${strokeWidth}"`;
  }

  markup += ' />';

  return markup;
}

function drawText(x, y, size, value, fill, weight) {
  const safeValue = escapeText(value);

  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${FONT_STACK}" font-size="${size}" font-weight="${weight}" dominant-baseline="hanging">${safeValue}</text>`;
}

function drawTextLines(x, y, lineHeight, size, values, fill, weight) {
  let markup = '';

  for (let index = 0; index < values.length; index += 1) {
    markup += drawText(x, y + index * lineHeight, size, values[index], fill, weight);
  }

  return markup;
}

function createSvgDocument(width, height, innerMarkup) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${innerMarkup}
    </svg>
  `;
}

function createPixelCells(matrix, startX, startY, cellSize) {
  let markup = '';

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (row[columnIndex] !== '1') {
        continue;
      }

      const x = startX + columnIndex * cellSize;
      const y = startY + rowIndex * cellSize;

      markup += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
    }
  }

  return markup;
}

function buildIconSvg(spec) {
  const availableSize = spec.squareSize - spec.border * 2;
  const cellSize = Math.floor(availableSize / PX_MATRIX[0].length);
  const glyphWidth = PX_MATRIX[0].length * cellSize;
  const glyphHeight = PX_MATRIX.length * cellSize;
  const glyphStartX = spec.squareOffset + spec.border + Math.floor((availableSize - glyphWidth) / 2);
  const glyphStartY = spec.squareOffset + spec.border + Math.floor((availableSize - glyphHeight) / 2);
  const squareX = spec.squareOffset;
  const squareY = spec.squareOffset;
  const totalSize = spec.size;
  const innerSize = spec.squareSize - spec.border * 2;
  const innerX = squareX + spec.border;
  const innerY = squareY + spec.border;
  const pixels = createPixelCells(PX_MATRIX, glyphStartX, glyphStartY, cellSize);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
      <rect x="${squareX}" y="${squareY}" width="${spec.squareSize}" height="${spec.squareSize}" fill="#FFFFFF" />
      <rect x="${squareX}" y="${squareY}" width="${spec.squareSize}" height="${spec.squareSize}" fill="none" stroke="#000000" stroke-width="${spec.border}" />
      <rect x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" fill="#FFFFFF" />
      ${pixels}
    </svg>
  `;
}

async function renderPng(svgMarkup, width, height, outputPath) {
  const resvg = new Resvg(svgMarkup, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const renderedImage = resvg.render();
  const pngData = renderedImage.asPng();

  await writeFile(outputPath, pngData);
}

async function generateIcons(projectRoot) {
  const iconsDirectory = path.join(projectRoot, 'assets', 'icons');

  await mkdir(iconsDirectory, { recursive: true });

  for (const spec of ICON_SPECS) {
    const svgMarkup = buildIconSvg(spec);
    const outputPath = path.join(iconsDirectory, `pagex-${spec.size}.png`);

    await renderPng(svgMarkup, spec.size, spec.size, outputPath);
  }
}

function buildLogoPanel(x, y, size, borderWidth) {
  const innerSize = size - borderWidth * 2;
  const availableSize = innerSize - borderWidth * 2;
  const cellSize = Math.floor(availableSize / PX_MATRIX[0].length);
  const glyphWidth = PX_MATRIX[0].length * cellSize;
  const glyphHeight = PX_MATRIX.length * cellSize;
  const glyphStartX = x + borderWidth * 2 + Math.floor((availableSize - glyphWidth) / 2);
  const glyphStartY = y + borderWidth * 2 + Math.floor((availableSize - glyphHeight) / 2);
  const pixelMarkup = createPixelCells(PX_MATRIX, glyphStartX, glyphStartY, cellSize);

  return [
    drawRect(x, y, size, size, '#ffffff', borderWidth, '#000000'),
    pixelMarkup,
  ].join('');
}

function buildPromoSvg(width, height, marqueeMode) {
  let headlineLines = ['PARSE', 'COPY'];
  let detailLines = ['PX / LOCAL ONLY'];
  let headlineSize = 46;
  let headlineLineHeight = 52;

  if (marqueeMode) {
    headlineLines = ['EXPAND HIDDEN', 'PARSE STRUCTURE', 'COPY JSON'];
    detailLines = ['BRUTALIST PAGE EXTRACTION SYSTEM'];
    headlineSize = 54;
    headlineLineHeight = 68;
  }

  const logoSize = 120;
  let innerMarkup = '';

  innerMarkup += drawRect(0, 0, width, height, '#ffffff', 8, '#000000');
  innerMarkup += drawRect(28, 28, width - 56, 44, '#000000', 0, '#000000');
  innerMarkup += drawText(42, 40, 18, 'SYSTEM.INFORMATION / PAGEX', '#ffffff', 700);
  innerMarkup += buildLogoPanel(44, 112, logoSize, 8);
  innerMarkup += drawTextLines(192, 112, headlineLineHeight, headlineSize, headlineLines, '#000000', 800);
  innerMarkup += drawRect(188, height - 98, width - 232, 44, '#000000', 0, '#000000');
  innerMarkup += drawTextLines(204, height - 84, 24, 20, detailLines, '#ffffff', 700);

  if (marqueeMode) {
    innerMarkup += drawRect(width - 250, 112, 180, 180, '#000000', 0, '#000000');
    innerMarkup += drawText(width - 226, 136, 26, 'PX', '#ffffff', 800);
    innerMarkup += drawTextLines(
      width - 226,
      176,
      24,
      18,
      ['FRAME SCAN', 'DOM OUTPUT', 'SYSTEM READY'],
      '#ffffff',
      700,
    );
  }

  return createSvgDocument(width, height, innerMarkup);
}

function buildPopupMock(scene) {
  let markup = '';
  let heroFill = '#000000';
  let heroText = '#ffffff';
  let flagFill = '#ffffff';
  let flagText = '#000000';
  let statusFill = '#000000';
  let statusTextFill = '#ffffff';
  let buttonPrimaryFill = '#000000';
  let buttonPrimaryText = '#ffffff';

  if (scene.statusText === 'EXPAND + PARSE') {
    heroFill = '#ffffff';
    heroText = '#000000';
    flagFill = '#000000';
    flagText = '#ffffff';
    statusFill = '#ffffff';
    statusTextFill = '#000000';
    buttonPrimaryFill = '#ffffff';
    buttonPrimaryText = '#000000';
  }

  markup += drawRect(0, 0, 430, 620, '#ffffff', 6, '#000000');
  markup += drawRect(16, 16, 398, 170, heroFill, 6, '#000000');
  markup += drawRect(32, 32, 168, 28, flagFill, 3, heroText);
  markup += drawText(42, 38, 14, 'SYSTEM.INFORMATION', flagText, 700);
  markup += drawRect(226, 32, 172, 28, statusFill, 3, heroText);
  markup += drawText(238, 38, 14, scene.statusText, statusTextFill, 700);
  markup += buildLogoPanel(32, 78, 84, 4);
  markup += drawText(138, 82, 13, 'PAGE EXTRACTION / JSON OUTPUT', heroText, 700);
  markup += drawText(138, 108, 42, 'PAGEX', heroText, 800);
  markup += drawTextLines(138, 150, 16, 12, scene.detailLines, heroText, 700);

  markup += drawRect(16, 204, 398, 116, '#ffffff', 6, '#000000');
  markup += drawText(32, 220, 14, 'TARGET.TAB', '#000000', 700);
  markup += drawRect(32, 248, 366, 42, '#ffffff', 4, '#000000');
  markup += drawText(46, 261, 16, 'Pagex / active / example.com', '#000000', 700);
  markup += drawRect(32, 304, 176, 40, buttonPrimaryFill, 4, '#000000');
  markup += drawText(78, 314, 18, scene.buttonPrimary, buttonPrimaryText, 800);
  markup += drawRect(222, 304, 176, 40, '#ffffff', 4, '#000000');
  markup += drawText(248, 314, 18, scene.buttonSecondary, '#000000', 800);

  markup += drawRect(16, 338, 398, 196, '#ffffff', 6, '#000000');
  markup += drawRect(32, 354, 194, 26, '#000000', 0, '#000000');
  markup += drawText(44, 360, 14, 'PAYLOAD.METRICS', '#ffffff', 700);

  const metricNames = ['FRAMES', 'ELEMENTS', 'CLICKS', 'BYTES'];
  const metricPositions = [
    { x: 32, y: 394 },
    { x: 222, y: 394 },
    { x: 32, y: 468 },
    { x: 222, y: 468 },
  ];

  for (let index = 0; index < metricNames.length; index += 1) {
    const metric = metricPositions[index];

    markup += drawRect(metric.x, metric.y, 176, 60, '#ffffff', 4, '#000000');
    markup += drawText(metric.x + 12, metric.y + 10, 13, metricNames[index], '#000000', 700);
    markup += drawText(metric.x + 12, metric.y + 30, 24, scene.metrics[index], '#000000', 800);
  }

  markup += drawTextLines(32, 548, 18, 13, scene.summaryLines, '#000000', 700);
  markup += drawRect(16, 548 + 34, 398, 40, '#000000', 0, '#000000');
  markup += drawText(32, 558 + 34, 13, scene.footerText, '#ffffff', 700);

  return markup;
}

function buildScreenshotSvg(scene) {
  let innerMarkup = '';

  innerMarkup += drawRect(0, 0, 1280, 800, '#ffffff', 10, '#000000');
  innerMarkup += drawRect(22, 22, 1236, 66, '#000000', 0, '#000000');
  innerMarkup += drawText(40, 38, 18, 'PAGEX / CHROME EXTENSION / BRUTALIST MODE', '#ffffff', 700);
  innerMarkup += drawRect(44, 120, 1190, 634, '#ffffff', 6, '#000000');
  innerMarkup += drawRect(70, 156, 720, 530, '#ffffff', 4, '#000000');
  innerMarkup += drawRect(70, 156, 720, 64, '#000000', 0, '#000000');
  innerMarkup += drawText(92, 176, 18, 'ACTIVE PAGE / CONTENT PREVIEW', '#ffffff', 700);
  innerMarkup += drawRect(104, 258, 260, 60, '#ffffff', 4, '#000000');
  innerMarkup += drawText(122, 276, 26, 'SECTION', '#000000', 800);
  innerMarkup += drawRect(394, 258, 362, 60, '#ffffff', 4, '#000000');
  innerMarkup += drawText(412, 276, 26, 'DETAILS / EXPANDABLE', '#000000', 800);
  innerMarkup += drawRect(104, 348, 652, 110, '#000000', 0, '#000000');
  innerMarkup += drawTextLines(
    128,
    376,
    34,
    24,
    ['DOM STRUCTURE', 'HIDDEN CONTENT', 'FILTERED ATTRIBUTES'],
    '#ffffff',
    700,
  );
  innerMarkup += drawRect(104, 494, 652, 148, '#ffffff', 4, '#000000');
  innerMarkup += drawTextLines(
    128,
    522,
    28,
    20,
    ['LOCAL PARSE FLOW', 'NO REMOTE SEND', 'AI-READY JSON OUTPUT'],
    '#000000',
    700,
  );

  innerMarkup += `<g transform="translate(762, 124)">${buildPopupMock(scene)}</g>`;

  return createSvgDocument(1280, 800, innerMarkup);
}

async function generatePromoAssets(projectRoot) {
  const promoDirectory = path.join(projectRoot, 'store-assets', 'promo');
  const smallPromoPath = path.join(promoDirectory, 'pagex-small-promo-440x280.png');
  const marqueePath = path.join(promoDirectory, 'pagex-marquee-1400x560.png');

  await rm(promoDirectory, { recursive: true, force: true });
  await mkdir(promoDirectory, { recursive: true });
  await renderPng(buildPromoSvg(440, 280, false), 440, 280, smallPromoPath);
  await renderPng(buildPromoSvg(1400, 560, true), 1400, 560, marqueePath);
}

async function generateScreenshotAssets(projectRoot) {
  const screenshotsDirectory = path.join(projectRoot, 'store-assets', 'screenshots');

  await rm(screenshotsDirectory, { recursive: true, force: true });
  await mkdir(screenshotsDirectory, { recursive: true });

  for (const scene of SCREENSHOT_SCENES) {
    const screenshotPath = path.join(screenshotsDirectory, scene.fileName);
    const svgMarkup = buildScreenshotSvg(scene);

    await renderPng(svgMarkup, 1280, 800, screenshotPath);
  }
}

async function main() {
  const projectRoot = getProjectRoot();

  await generateIcons(projectRoot);
  await generatePromoAssets(projectRoot);
  await generateScreenshotAssets(projectRoot);

  console.log('Generated Pagex store assets.');
}

await main();
