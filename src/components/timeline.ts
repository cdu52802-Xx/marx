// M5 T6 · 时间轴（HTML slider → SVG 整条可拖 + 单游标 = 时间滤镜）
//
// vision pivot @ 2026-05-15 Stage 3 PM checkpoint round 1（DR-042 ~ DR-045）:
//   原 (DR-015 + DR-038 已作废): 时间轴 ↔ 画布 双向锁定 + 范围条显示画布可视段
//   新: 时间轴 = 时间游标 / 时间滤镜
//   - 拖游标年份变化 → 仅触发 onCursorChange callback (main.ts 用来 fading 观点/连线)
//   - 画布 pan/zoom 跟时间轴完全解耦
//   - 删视觉范围条 + 2 edge ticks (失去意义)
//   - 删 updateZoomK API (不需要)
//
// 保留功能:
//   ✅ SVG axis + ticks (1770→1950 + Marx 活跃年 1830/1850/1870 紫色加粗)
//   ✅ Marx 区间 indicator 1830-1880 (z 在底)
//   ✅ 整条线可拖 (mousedown anywhere on svg → drag 改 currentYear)
//   ✅ Model A 滚动条直觉 (拖右 → year 变大 / 拖左 → year 变小 / DR-038 思路保留只是不动画布)
//   ✅ ▶ 播放按钮 (DR-040 20s 跑完 / 9 年/秒 / 画布不动)
//   ✅ 游标 label 显示 "游标 XXXX"
//
// API:
//   { setCursor(year), getCurrentYear() } // updateZoomK 已删
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

// 播放速度（DR-040 · PM 拍 20s）：180 年 / 20s = 9 年/秒 / 50ms 间隔 / 0.45 年/step
const PLAY_INTERVAL_MS = 50;
const PLAY_YEAR_PER_STEP = 0.45;

const AXIS_PAD_PCT = 5;
const AXIS_TOP_PX = 24;

export function mountTimeline(opts: TimelineOptions): TimelineApi {
  const { container, yearMin, yearMax, initialCursor, onCursorChange } = opts;
  const yearSpan = yearMax - yearMin;

  // === 1. 容器 + 内部布局 ===
  container.innerHTML = `
    <div style="border-top:2px solid #d8cab0;background:#faf6ec;padding:18px 60px 14px;font-family:'EB Garamond','Georgia',serif">
      <div style="font-size:9px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;text-align:center">时间轴 · 时间游标</div>
      <svg id="tl-svg" width="100%" height="60" style="display:block;cursor:ew-resize;user-select:none"></svg>
      <div style="display:flex;align-items:center;gap:14px;margin-top:6px">
        <button id="tl-play" style="border:1px solid #5b3a8c;background:#fcfaf6;color:#5b3a8c;padding:4px 14px;font-style:italic;cursor:pointer;font-family:inherit;font-size:12px">▶ 播放思想史</button>
        <span id="tl-cursor-label" style="font-size:12px;color:#5b3a8c;font-style:italic;white-space:nowrap;flex:1;text-align:right">游标 ${initialCursor}</span>
      </div>
    </div>
  `;

  const svg = container.querySelector('#tl-svg') as SVGSVGElement;
  const cursorLabel = container.querySelector('#tl-cursor-label') as HTMLElement;
  const playBtn = container.querySelector('#tl-play') as HTMLButtonElement;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // === 2. 内部状态 ===
  let currentYear = clamp(initialCursor, yearMin, yearMax);

  // jsdom getBoundingClientRect 对 SVG 返 0 / 加 fallback 600px
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

  // === 3. 渲染 SVG ===

  // 3.1 Marx 区间 indicator 1830-1880
  const marxIndicator = document.createElementNS(SVG_NS, 'rect');
  marxIndicator.setAttribute('class', 'timeline-marx-indicator');
  marxIndicator.setAttribute('y', String(AXIS_TOP_PX - 4));
  marxIndicator.setAttribute('height', '8');
  marxIndicator.setAttribute('fill', '#5b3a8c');
  marxIndicator.setAttribute('opacity', '0.12');
  svg.appendChild(marxIndicator);

  // 3.2 主轴线
  const axisLine = document.createElementNS(SVG_NS, 'line');
  axisLine.setAttribute('class', 'timeline-axis-line');
  axisLine.setAttribute('y1', String(AXIS_TOP_PX));
  axisLine.setAttribute('y2', String(AXIS_TOP_PX));
  axisLine.setAttribute('stroke', '#888');
  axisLine.setAttribute('stroke-width', '1');
  svg.appendChild(axisLine);

  // 3.3 游标视觉指示 (PM checkpoint 1 反馈：删范围条 / 但还是要让用户看到游标位置)
  //     用紫色竖线 (2px 宽 / 24px 高 / 跨 axis 上下) / pointer-events none
  const cursorLine = document.createElementNS(SVG_NS, 'line');
  cursorLine.setAttribute('class', 'timeline-cursor-line');
  cursorLine.setAttribute('y1', String(AXIS_TOP_PX - 12));
  cursorLine.setAttribute('y2', String(AXIS_TOP_PX + 12));
  cursorLine.setAttribute('stroke', '#5b3a8c');
  cursorLine.setAttribute('stroke-width', '2');
  cursorLine.setAttribute('pointer-events', 'none');
  svg.appendChild(cursorLine);

  // 3.4 ticks + labels
  const ticks = computeTickPositions(yearMin, yearMax);
  for (const t of ticks) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', t.major ? 'timeline-tick major' : 'timeline-tick');
    line.setAttribute('y1', String(t.major ? AXIS_TOP_PX - 7 : AXIS_TOP_PX - 4));
    line.setAttribute('y2', String(t.major ? AXIS_TOP_PX + 7 : AXIS_TOP_PX + 4));
    line.setAttribute('stroke', t.color);
    line.setAttribute('stroke-width', t.major ? '2' : '1');
    line.setAttribute('pointer-events', 'none');
    line.dataset.year = String(t.year);
    svg.appendChild(line);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', t.major ? 'timeline-tick-label major' : 'timeline-tick-label');
    label.setAttribute('y', String(AXIS_TOP_PX + 22));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', t.color);
    label.setAttribute('font-size', '10');
    label.setAttribute('font-style', 'italic');
    label.setAttribute('pointer-events', 'none');
    if (t.major) label.setAttribute('font-weight', '700');
    label.textContent = t.label;
    label.dataset.year = String(t.year);
    svg.appendChild(label);
  }

  // 3.5 drag-area：透明 rect 覆盖整个 svg / 接收 mousedown
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

  function updateMarxIndicator() {
    const x1 = yearToAxisPx(1830);
    const x2 = yearToAxisPx(1880);
    marxIndicator.setAttribute('x', String(x1));
    marxIndicator.setAttribute('width', String(x2 - x1));
  }

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

  function updateCursorLine() {
    const x = yearToAxisPx(currentYear);
    cursorLine.setAttribute('x1', String(x));
    cursorLine.setAttribute('x2', String(x));
  }

  function renderAll() {
    updateMarxIndicator();
    updateAxisLine();
    updateTicks();
    updateCursorLine();
    cursorLabel.textContent = `游标 ${Math.round(currentYear)}`;
  }

  renderAll();
  setTimeout(renderAll, 0); // browser mount 后再 render 一次

  // === 5. 拖动 (Model A scrollbar 直觉 / DR-038 思路保留) ===

  let dragging = false;
  let dragStartX = 0;
  let dragStartYear = 0;

  function onMouseDown(e: MouseEvent) {
    dragging = true;
    dragStartX = e.clientX;
    dragStartYear = currentYear;
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

  // === 6. ▶ 播放 (toggle pause / DR-040 20s / 画布不动 DR-044) ===

  let activeInterval: ReturnType<typeof setInterval> | null = null;
  const PLAY_LABEL = '▶ 播放思想史';
  const PAUSE_LABEL = '⏸ 暂停播放';
  playBtn.setAttribute('aria-pressed', 'false');

  function stopPlayback() {
    if (activeInterval !== null) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    playBtn.textContent = PLAY_LABEL;
    playBtn.setAttribute('aria-pressed', 'false');
  }

  function startPlayback() {
    if (currentYear >= yearMax) currentYear = yearMin;
    playBtn.textContent = PAUSE_LABEL;
    playBtn.setAttribute('aria-pressed', 'true');
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
