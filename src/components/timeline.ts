// M5 T6 · 时间轴大改造（HTML slider → SVG 整条可拖 + 范围条 + 双向同步）
// 决策：DR-038 (Model A 滚动条直觉) · DR-039 (范围条样式 B 半透明 + 两端 ticks) ·
//      DR-040 (▶ 播放 20s 跑完 / 9 年/秒) · DR-041 (syncingFromTimeline flag 防震荡)
//
// 改动 from M4:
//   ❌ 删 <input type="range"> slider（PM 反馈: "整条时间轴本身就是单游标"）
//   ❌ 不画 thumb circle marker（同上）
//   ✅ 改 SVG axis + drag-area / mousedown anywhere on timeline triggers drag
//   ✅ 加视觉范围条 rect + 两端 ticks（样式 B）/ 仅显示当前 zoom 可视段 / 不可拖
//   ✅ 拖动 = Model A：拖向左 → 范围条 / 游标向左 (更早) → 主画布向右 pan
//   ✅ 新 API: { setCursor, getCurrentYear, updateZoomK }
//
// 视觉硬约束（沿 M4）:
//   - font-family: 'EB Garamond', Georgia, serif
//   - 米白底 #faf6ec / 紫 #5b3a8c 主导
//   - 0 border-radius 学术编辑硬约束

export interface TimelineTick {
  year: number;
  major: boolean;
  color: string;
  label: string;
}

const MARX_ACTIVE_YEARS = new Set([1830, 1850, 1870]);
const STANDARD_YEAR_INTERVAL = 20;

// === Pure helpers (export 给 test) ===

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

// M5 T6 · 范围条宽度 = timelineWidth / zoomK
//   推导：SVG viewBox + preserveAspectRatio="xMidYMid meet" + fit-to-content default
//   k=1 → 全 viewBox 可见 → range = 全 timelineWidth
//   k=2 → 可见画布段 = 1/2 → 可见年份段 = 全长/2 → range = timelineWidth/2
export function computeRangeBarWidth(p: { zoomK: number; timelineWidth: number }): number {
  return p.timelineWidth / p.zoomK;
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
  updateZoomK: (k: number) => void;
}

// 播放速度（DR-040 · PM 拍 20s）：180 年 / 20s = 9 年/s / 24 fps → 0.375 年/step / interval 1000/24 ≈ 42ms
// 取整间隔 50ms / 0.45 年/step → 180/0.45 = 400 step × 50ms = 20s ✓
const PLAY_INTERVAL_MS = 50;
const PLAY_YEAR_PER_STEP = 0.45;

const AXIS_PAD_PCT = 5; // 主轴线左右各留 5% padding
const AXIS_TOP_PX = 24; // axis line y 坐标
const RANGE_BAR_HEIGHT = 12; // 范围条高度
const RANGE_BAR_TOP = AXIS_TOP_PX - RANGE_BAR_HEIGHT / 2; // range bar 居中于 axis line

export function mountTimeline(opts: TimelineOptions): TimelineApi {
  const { container, yearMin, yearMax, initialCursor, onCursorChange } = opts;
  const yearSpan = yearMax - yearMin;

  // === 1. 容器 + 内部布局 ===
  container.innerHTML = `
    <div style="border-top:2px solid #d8cab0;background:#faf6ec;padding:18px 60px 14px;font-family:'EB Garamond','Georgia',serif">
      <div style="font-size:9px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;text-align:center">时间轴 · 参考维度</div>
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
  let currentZoomK = 1;

  // axis 实际像素宽度 (svg width 100% / 在 mount 时算)
  // jsdom getBoundingClientRect 对 SVG 返 0 / 加 fallback 600px (test 默认 / 不影响 browser)
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

  // year → axis pixel X (axisPxToYear 删除 / 拖动用 dx delta 公式不需要逆向)
  function yearToAxisPx(year: number): number {
    return getAxisLeftPx() + ((year - yearMin) / yearSpan) * getAxisWidthPx();
  }

  // === 3. 渲染 SVG 内容 ===

  // 3.1 Marx 区间 indicator (z 在底)
  const marxIndicator = document.createElementNS(SVG_NS, 'rect');
  marxIndicator.setAttribute('class', 'timeline-marx-indicator');
  marxIndicator.setAttribute('y', String(AXIS_TOP_PX - 4));
  marxIndicator.setAttribute('height', '8');
  marxIndicator.setAttribute('fill', '#5b3a8c');
  marxIndicator.setAttribute('opacity', '0.12');
  svg.appendChild(marxIndicator);

  // 3.2 主轴线 (灰色)
  const axisLine = document.createElementNS(SVG_NS, 'line');
  axisLine.setAttribute('class', 'timeline-axis-line');
  axisLine.setAttribute('y1', String(AXIS_TOP_PX));
  axisLine.setAttribute('y2', String(AXIS_TOP_PX));
  axisLine.setAttribute('stroke', '#888');
  axisLine.setAttribute('stroke-width', '1');
  svg.appendChild(axisLine);

  // 3.3 视觉范围条 (样式 B: 半透明 rect + 两端 edge ticks / DR-039)
  const rangeBar = document.createElementNS(SVG_NS, 'rect');
  rangeBar.setAttribute('class', 'timeline-range-bar');
  rangeBar.setAttribute('y', String(RANGE_BAR_TOP));
  rangeBar.setAttribute('height', String(RANGE_BAR_HEIGHT));
  rangeBar.setAttribute('fill', '#5b3a8c');
  rangeBar.setAttribute('opacity', '0.35');
  rangeBar.setAttribute('pointer-events', 'none');
  svg.appendChild(rangeBar);

  const edgeTickL = document.createElementNS(SVG_NS, 'line');
  edgeTickL.setAttribute('class', 'timeline-range-edge-tick');
  edgeTickL.setAttribute('y1', String(AXIS_TOP_PX - 10));
  edgeTickL.setAttribute('y2', String(AXIS_TOP_PX + 10));
  edgeTickL.setAttribute('stroke', '#5b3a8c');
  edgeTickL.setAttribute('stroke-width', '2');
  edgeTickL.setAttribute('pointer-events', 'none');
  svg.appendChild(edgeTickL);

  const edgeTickR = document.createElementNS(SVG_NS, 'line');
  edgeTickR.setAttribute('class', 'timeline-range-edge-tick');
  edgeTickR.setAttribute('y1', String(AXIS_TOP_PX - 10));
  edgeTickR.setAttribute('y2', String(AXIS_TOP_PX + 10));
  edgeTickR.setAttribute('stroke', '#5b3a8c');
  edgeTickR.setAttribute('stroke-width', '2');
  edgeTickR.setAttribute('pointer-events', 'none');
  svg.appendChild(edgeTickR);

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

  // 3.5 drag-area: 透明 rect 覆盖整个 svg / 接收 mousedown
  // class timeline-drag-area / 测试用
  const dragArea = document.createElementNS(SVG_NS, 'rect');
  dragArea.setAttribute('class', 'timeline-drag-area');
  dragArea.setAttribute('x', '0');
  dragArea.setAttribute('y', '0');
  dragArea.setAttribute('width', '100%');
  dragArea.setAttribute('height', '100%');
  dragArea.setAttribute('fill', 'transparent');
  dragArea.setAttribute('cursor', 'ew-resize');
  svg.appendChild(dragArea);

  // === 4. 渲染位置更新 ===

  function updateMarxIndicator() {
    // Marx 区间 1830-1880
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

  function updateRangeBar() {
    const axisWidth = getAxisWidthPx();
    const rangeWidthPx = computeRangeBarWidth({ zoomK: currentZoomK, timelineWidth: axisWidth });
    const cursorPx = yearToAxisPx(currentYear);
    let leftPx = cursorPx - rangeWidthPx / 2;
    let rightPx = cursorPx + rangeWidthPx / 2;
    // clamp 范围条不出 axis 边界
    const axisLeft = getAxisLeftPx();
    const axisRight = axisLeft + axisWidth;
    if (leftPx < axisLeft) leftPx = axisLeft;
    if (rightPx > axisRight) rightPx = axisRight;
    rangeBar.setAttribute('x', String(leftPx));
    rangeBar.setAttribute('width', String(Math.max(0, rightPx - leftPx)));
    edgeTickL.setAttribute('x1', String(leftPx));
    edgeTickL.setAttribute('x2', String(leftPx));
    edgeTickR.setAttribute('x1', String(rightPx));
    edgeTickR.setAttribute('x2', String(rightPx));
  }

  function renderAll() {
    updateMarxIndicator();
    updateAxisLine();
    updateTicks();
    updateRangeBar();
    cursorLabel.textContent = `游标 ${Math.round(currentYear)}`;
  }

  renderAll();
  // svg getBoundingClientRect 在 jsdom 可能 0 / browser mount 后再 render 一次
  setTimeout(renderAll, 0);

  // === 5. 拖动交互 (Model A: 拖向左 → 范围条向左 → year 变小 / DR-038) ===

  let dragging = false;
  let dragStartX = 0; // mousedown 时屏幕 X
  let dragStartYear = 0; // mousedown 时 currentYear

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
    // Model A: dx>0 (拖右) → 范围条/游标向右 → year 变大
    //          dx<0 (拖左) → 范围条/游标向左 → year 变小
    // 即 year 跟手指方向走（scrollbar thumb 直觉）
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

  // === 6. ▶ 播放按钮 (toggle pause / M4 fix #5 同思路 / DR-040 速度 20s) ===

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
    // restart from yearMin if 已在 yearMax
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
    updateZoomK: (k: number) => {
      currentZoomK = k;
      updateRangeBar();
    },
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
