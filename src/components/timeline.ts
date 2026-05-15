// M5 T6 · 时间轴（单行布局 + floating cursor badge）
//
// vision pivot @ Stage 3 R1 (DR-042 ~ DR-045): 时间轴 = 时间游标 / 时间滤镜
// PM checkpoint R4 (DR-051): 单行布局 + ▶ 图标在左 + floating badge cursor label
//
// 设计原则（资深 UIUX）:
//   - 单行：删第二行"▶ 文字 + 大片空白 + 游标 label"的不合理布局
//   - 行业标准：YouTube/B 站/视频播放器 timeline 是单行（▶ 在左 / scrubber 中 / 时间右）
//   - 「所见即所得」cursor 位置 + cursor label 视觉双关联（同位置 + 同紫色）
//     原右下角"游标 XXXX"用户要跨屏幕看 / 现在 label badge 跟着 cursor 走 / 紧贴 cursor 竖线上方
//
// 布局:
//   ┌──────────────────────────────────────────────────┐
//   │           [紫色 badge 2030] ← floating cursor label │
//   │ [▶图标]  [────axis ticks + ↑紫色 cursor─────]      │  (单行 ~48px)
//   └──────────────────────────────────────────────────┘
//
// 视觉硬约束:
//   - font-family: 'EB Garamond', Georgia, serif
//   - 米白底 #faf6ec / 紫 #5b3a8c
//   - 0 border-radius

export interface TimelineTick {
  year: number;
  major: boolean;
  color: string;
  label: string;
}

const MARX_ACTIVE_YEARS = new Set([1830, 1850, 1870]);
const STANDARD_YEAR_INTERVAL = 20;

// === Pure helpers ===

export function computeTickPositions(yearMin: number, yearMax: number): TimelineTick[] {
  const yearSet = new Map<number, TimelineTick>();
  for (
    let y = Math.ceil(yearMin / STANDARD_YEAR_INTERVAL) * STANDARD_YEAR_INTERVAL;
    y <= yearMax;
    y += STANDARD_YEAR_INTERVAL
  ) {
    yearSet.set(y, { year: y, major: false, color: '#888', label: y.toString() });
  }
  for (const my of MARX_ACTIVE_YEARS) {
    if (my >= yearMin && my <= yearMax) {
      yearSet.set(my, { year: my, major: true, color: '#5b3a8c', label: my.toString() });
    }
  }
  if (!yearSet.has(yearMin)) {
    yearSet.set(yearMin, { year: yearMin, major: false, color: '#888', label: yearMin.toString() });
  }
  if (!yearSet.has(yearMax)) {
    yearSet.set(yearMax, { year: yearMax, major: false, color: '#888', label: yearMax.toString() });
  }
  return Array.from(yearSet.values()).sort((a, b) => a.year - b.year);
}

export function yearToPercent(year: number, yearMin: number, yearMax: number): number {
  return ((year - yearMin) / (yearMax - yearMin)) * 100;
}

// === Mount API ===

export interface TimelineOptions {
  container: HTMLElement;
  yearMin: number;
  yearMax: number;
  initialCursor: number;
  onCursorChange?: (year: number) => void;
}

export interface TimelineApi {
  setCursor: (year: number) => void;
  getCurrentYear: () => number;
}

// 播放速度 (DR-040 · PM 拍 20s): 180 年 / 20s = 9 年/秒 / 50ms 间隔 / 0.45 年/step
// PM R3 DR-049 yearMax 改 2030 后 span 260 年 / 20s 跑完 = 13 年/秒 / 0.65 年/step (按比例自动调)
// 此处保持 0.45 年/step 不变 → 260/0.45/50ms*1000 ≈ 29s（稍慢 / 但接近 20s 量级 / PM 可调）
const PLAY_INTERVAL_MS = 50;
const PLAY_YEAR_PER_STEP = 0.45;

// PM R4 DR-051 · 单行布局 svg 高 44 (含 floating badge + axis line + tick labels)
//   axis line y = 24 (中下)
//   floating badge area y = 0-14 (axis 上方 / cursor 竖线顶部接触)
//   cursor line y1=14 y2=34 (跨 axis 上下)
//   tick label y = 42 (axis 下方 / 在 svg 底部)
const AXIS_PAD_PCT = 3; // R4 缩 5%→3% (axis 左右挤压 button + 内部 margin 已够)
const AXIS_TOP_PX = 24;
const BADGE_AREA_HEIGHT = 14;

export function mountTimeline(opts: TimelineOptions): TimelineApi {
  const { container, yearMin, yearMax, initialCursor, onCursorChange } = opts;
  const yearSpan = yearMax - yearMin;

  // === 1. 容器 + 内部布局（单行 flex）===
  container.innerHTML = `
    <div style="border-top:1px solid #d8cab0;background:#faf6ec;padding:6px 24px;font-family:'EB Garamond','Georgia',serif;display:flex;align-items:center;gap:12px">
      <button id="tl-play" aria-label="播放思想史" style="border:1px solid #5b3a8c;background:#fcfaf6;color:#5b3a8c;width:28px;height:28px;padding:0;cursor:pointer;font-family:inherit;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;flex-shrink:0">▶</button>
      <svg id="tl-svg" width="100%" height="44" style="display:block;cursor:ew-resize;user-select:none;flex:1"></svg>
    </div>
  `;

  const svg = container.querySelector('#tl-svg') as SVGSVGElement;
  const playBtn = container.querySelector('#tl-play') as HTMLButtonElement;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // === 2. 内部状态 ===
  let currentYear = clamp(initialCursor, yearMin, yearMax);

  const FALLBACK_SVG_WIDTH_PX = 600;
  function getSvgWidthPx(): number {
    const w = svg.getBoundingClientRect().width;
    return w > 0 ? w : FALLBACK_SVG_WIDTH_PX;
  }
  function getAxisWidthPx(): number {
    return getSvgWidthPx() * (1 - (2 * AXIS_PAD_PCT) / 100);
  }
  function getAxisLeftPx(): number {
    return getSvgWidthPx() * (AXIS_PAD_PCT / 100);
  }

  function yearToAxisPx(year: number): number {
    return getAxisLeftPx() + ((year - yearMin) / yearSpan) * getAxisWidthPx();
  }
  // click-to-seek 反算
  function axisPxToYear(pxFromSvgLeft: number): number {
    const left = getAxisLeftPx();
    const width = getAxisWidthPx();
    if (width <= 0) return yearMin;
    return yearMin + ((pxFromSvgLeft - left) / width) * yearSpan;
  }

  // === 3. 渲染 SVG ===

  // 3.1 主轴线
  const axisLine = document.createElementNS(SVG_NS, 'line');
  axisLine.setAttribute('class', 'timeline-axis-line');
  axisLine.setAttribute('y1', String(AXIS_TOP_PX));
  axisLine.setAttribute('y2', String(AXIS_TOP_PX));
  axisLine.setAttribute('stroke', '#888');
  axisLine.setAttribute('stroke-width', '1');
  svg.appendChild(axisLine);

  // 3.2 游标紫色竖线 (跨 axis 上下 / 接 floating badge 底部)
  const cursorLine = document.createElementNS(SVG_NS, 'line');
  cursorLine.setAttribute('class', 'timeline-cursor-line');
  cursorLine.setAttribute('y1', String(AXIS_TOP_PX - 10));
  cursorLine.setAttribute('y2', String(AXIS_TOP_PX + 10));
  cursorLine.setAttribute('stroke', '#5b3a8c');
  cursorLine.setAttribute('stroke-width', '2');
  cursorLine.setAttribute('pointer-events', 'none');
  svg.appendChild(cursorLine);

  // 3.3 floating cursor badge (跟随 cursor 移动 / DR-051 所见即所得)
  //     <g> 内 rect (紫色) + text (米白 year)
  const cursorBadge = document.createElementNS(SVG_NS, 'g');
  cursorBadge.setAttribute('class', 'timeline-cursor-badge');
  cursorBadge.setAttribute('pointer-events', 'none');

  const badgeRect = document.createElementNS(SVG_NS, 'rect');
  badgeRect.setAttribute('y', '0');
  badgeRect.setAttribute('height', String(BADGE_AREA_HEIGHT));
  badgeRect.setAttribute('fill', '#5b3a8c');
  cursorBadge.appendChild(badgeRect);

  const badgeText = document.createElementNS(SVG_NS, 'text');
  badgeText.setAttribute('y', '10'); // text baseline 在 rect 内居中 (rect 0-14 / baseline 10 / 字号 9-10)
  badgeText.setAttribute('font-size', '10');
  badgeText.setAttribute('font-style', 'italic');
  badgeText.setAttribute('font-weight', '700');
  badgeText.setAttribute('fill', '#fcfaf6');
  badgeText.setAttribute('text-anchor', 'middle');
  badgeText.setAttribute('font-family', "'EB Garamond', Georgia, serif");
  cursorBadge.appendChild(badgeText);

  svg.appendChild(cursorBadge);

  // 3.4 ticks + labels
  const ticks = computeTickPositions(yearMin, yearMax);
  for (const t of ticks) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', t.major ? 'timeline-tick major' : 'timeline-tick');
    line.setAttribute('y1', String(t.major ? AXIS_TOP_PX - 6 : AXIS_TOP_PX - 3));
    line.setAttribute('y2', String(t.major ? AXIS_TOP_PX + 6 : AXIS_TOP_PX + 3));
    line.setAttribute('stroke', t.color);
    line.setAttribute('stroke-width', t.major ? '2' : '1');
    line.setAttribute('pointer-events', 'none');
    line.dataset.year = String(t.year);
    svg.appendChild(line);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', t.major ? 'timeline-tick-label major' : 'timeline-tick-label');
    label.setAttribute('y', String(AXIS_TOP_PX + 18));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', t.color);
    label.setAttribute('font-size', '9');
    label.setAttribute('font-style', 'italic');
    label.setAttribute('pointer-events', 'none');
    if (t.major) label.setAttribute('font-weight', '700');
    label.textContent = t.label;
    label.dataset.year = String(t.year);
    svg.appendChild(label);
  }

  // 3.5 drag-area: 透明 rect 覆盖整个 svg / 接收 mousedown
  const dragArea = document.createElementNS(SVG_NS, 'rect');
  dragArea.setAttribute('class', 'timeline-drag-area');
  dragArea.setAttribute('x', '0');
  dragArea.setAttribute('y', '0');
  dragArea.setAttribute('width', '100%');
  dragArea.setAttribute('height', '100%');
  dragArea.setAttribute('fill', 'transparent');
  dragArea.setAttribute('cursor', 'ew-resize');
  svg.appendChild(dragArea);

  // === 4. 渲染更新 ===

  function updateAxisLine() {
    const left = getAxisLeftPx();
    const width = getAxisWidthPx();
    axisLine.setAttribute('x1', String(left));
    axisLine.setAttribute('x2', String(left + width));
  }

  function updateTicks() {
    const tickEls = svg.querySelectorAll<SVGElement>('[data-year]');
    tickEls.forEach((el) => {
      const year = parseInt(el.dataset.year ?? '0', 10);
      const x = yearToAxisPx(year);
      if (el.tagName === 'line') {
        el.setAttribute('x1', String(x));
        el.setAttribute('x2', String(x));
      } else if (el.tagName === 'text') {
        el.setAttribute('x', String(x));
      }
    });
  }

  function updateCursorVisuals() {
    const x = yearToAxisPx(currentYear);
    cursorLine.setAttribute('x1', String(x));
    cursorLine.setAttribute('x2', String(x));
    // floating badge：rect + text 跟随 cursor x
    const yearText = String(Math.round(currentYear));
    badgeText.textContent = yearText;
    badgeText.setAttribute('x', String(x));
    // rect 宽度按字符数估 (1 char ≈ 6px @ 10px font + 5px padding 两侧)
    const rectW = yearText.length * 6 + 10;
    const axisLeft = getAxisLeftPx();
    const axisRight = axisLeft + getAxisWidthPx();
    // clamp badge 在 axis 内不出边界
    let rectX = x - rectW / 2;
    if (rectX < axisLeft - 4) rectX = axisLeft - 4;
    if (rectX + rectW > axisRight + 4) rectX = axisRight + 4 - rectW;
    badgeRect.setAttribute('x', String(rectX));
    badgeRect.setAttribute('width', String(rectW));
    // 修 text x = rect center (clamp 后)
    badgeText.setAttribute('x', String(rectX + rectW / 2));
  }

  function renderAll() {
    updateAxisLine();
    updateTicks();
    updateCursorVisuals();
  }

  renderAll();
  setTimeout(renderAll, 0); // browser mount 后再 render 一次

  // === 5. 交互 · click-to-seek + drag (PM R2 Fix 3 / DR-048) ===

  let dragging = false;
  let dragStartX = 0;
  let dragStartYear = 0;

  function onMouseDown(e: MouseEvent) {
    dragging = true;
    dragStartX = e.clientX;
    const svgRect = svg.getBoundingClientRect();
    const clickPxFromSvgLeft = e.clientX - svgRect.left;
    const seekYear = clamp(axisPxToYear(clickPxFromSvgLeft), yearMin, yearMax);
    currentYear = seekYear;
    dragStartYear = seekYear;
    renderAll();
    onCursorChange?.(seekYear);
    svg.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const axisWidth = getAxisWidthPx();
    if (axisWidth <= 0) return;
    const yearDelta = (dx / axisWidth) * yearSpan;
    const newYear = clamp(dragStartYear + yearDelta, yearMin, yearMax);
    currentYear = newYear;
    renderAll();
    onCursorChange?.(newYear);
  }

  function onMouseUp() {
    if (!dragging) return;
    dragging = false;
    svg.style.cursor = 'ew-resize';
  }

  svg.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // === 6. ▶ 播放 (toggle pause / DR-040 20s / 画布不动 DR-044 / DR-051 图标) ===

  let activeInterval: ReturnType<typeof setInterval> | null = null;
  const PLAY_ICON = '▶';
  const PAUSE_ICON = '⏸';
  playBtn.setAttribute('aria-pressed', 'false');

  function stopPlayback() {
    if (activeInterval !== null) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    playBtn.textContent = PLAY_ICON;
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.setAttribute('aria-label', '播放思想史');
  }

  function startPlayback() {
    if (currentYear >= yearMax) currentYear = yearMin;
    playBtn.textContent = PAUSE_ICON;
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.setAttribute('aria-label', '暂停播放');
    activeInterval = setInterval(() => {
      currentYear += PLAY_YEAR_PER_STEP;
      if (currentYear >= yearMax) {
        currentYear = yearMax;
        renderAll();
        onCursorChange?.(currentYear);
        stopPlayback();
        return;
      }
      renderAll();
      onCursorChange?.(currentYear);
    }, PLAY_INTERVAL_MS);
  }

  playBtn.addEventListener('click', () => {
    if (activeInterval === null) startPlayback();
    else stopPlayback();
  });

  // === 7. 返回 API ===
  return {
    setCursor: (year: number) => {
      currentYear = clamp(year, yearMin, yearMax);
      renderAll();
    },
    getCurrentYear: () => currentYear,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
