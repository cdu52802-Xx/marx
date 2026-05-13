// M4 T7 · 底部横向时间轴组件
// spec § 6 设计 / plan line 1827-2024 实现
//
// 三个 export:
//   - computeTickPositions: 1770→1950 / 20 年间隔 / Marx 活跃年 1830/1850/1870 紫色加粗
//   - yearToPercent: year → 横轴百分比线性映射
//   - mountTimeline: ▶ 播放按钮 + slider 游标 + tick render + onCursorChange 回调
//
// ⭐ PM 视觉期待（subagent task brief 决策）:
//   spec § 6.1 "位置：画布**底部**横向（独立栏，跟主画布解耦）"。
//   "独立栏" = 始终可见，不应该 scroll 到画布底部才看到。
//   T6 后 #app 改 overflow: auto / SVG 高 ≈ canvasHeight (2000+ px) 动态，
//   plan 原方案 timeline mount 到 #app 末尾 → PM 必须 scroll 到底才看到 → 不符合期待。
//
//   方案 B (本实现):
//     - timeline 用 position: fixed; bottom: 0; left: 0; right: 0; z-index: 10
//     - mount 到 document.body (而不是 #app 内)
//     - 保证任何 scroll 位置都能看到 + 拖游标
//
//   若 PM 后续反馈"timeline 应跟画布一起 scroll" → 切回方案 A（mount 到 #app 末尾）5 分钟改回。
//
// 视觉硬约束（AGENTS.md 三件套 + spec § 4）:
//   - font-family: 'EB Garamond', Georgia, serif（避开 Inter/Roboto/Arial）
//   - 米白底 #faf6ec（比主画布 #fcfaf6 略深，区分独立栏边界）
//   - 紫 #5b3a8c 主导色（Marx 活跃年 tick + 游标 + ▶ 按钮 border）
//   - 其他年份灰色 #888 standard tick

export interface TimelineTick {
  year: number;
  major: boolean;
  color: string;
  label: string;
}

const MARX_ACTIVE_YEARS = new Set([1830, 1850, 1870]);
const STANDARD_YEAR_INTERVAL = 20;

export function computeTickPositions(yearMin: number, yearMax: number): TimelineTick[] {
  // Note: 20 年 interval 起点从 1780 起跳无法命中 1830/1850/1870（Marx 活跃年是 10-年偏移）
  // 所以策略 = 标准 interval ticks (灰) + Marx 活跃年强制加 major tick (紫) + 端点
  const yearSet = new Map<number, TimelineTick>();

  // 1. 标准 20 年 interval ticks (灰色)
  for (
    let y = Math.ceil(yearMin / STANDARD_YEAR_INTERVAL) * STANDARD_YEAR_INTERVAL;
    y <= yearMax;
    y += STANDARD_YEAR_INTERVAL
  ) {
    yearSet.set(y, {
      year: y,
      major: false,
      color: '#888',
      label: y.toString(),
    });
  }

  // 2. Marx 活跃年强制 override 成 major + 紫 (即使不在 20 年 interval 上)
  for (const my of MARX_ACTIVE_YEARS) {
    if (my >= yearMin && my <= yearMax) {
      yearSet.set(my, {
        year: my,
        major: true,
        color: '#5b3a8c',
        label: my.toString(),
      });
    }
  }

  // 3. 端点（如果不在已有 ticks 上则补）
  if (!yearSet.has(yearMin)) {
    yearSet.set(yearMin, {
      year: yearMin,
      major: false,
      color: '#888',
      label: yearMin.toString(),
    });
  }
  if (!yearSet.has(yearMax)) {
    yearSet.set(yearMax, {
      year: yearMax,
      major: false,
      color: '#888',
      label: yearMax.toString(),
    });
  }

  // 4. 按 year 升序返回
  return Array.from(yearSet.values()).sort((a, b) => a.year - b.year);
}

export function yearToPercent(year: number, yearMin: number, yearMax: number): number {
  return ((year - yearMin) / (yearMax - yearMin)) * 100;
}

export interface TimelineOptions {
  container: HTMLElement;
  yearMin: number;
  yearMax: number;
  initialCursor: number;
  onCursorChange?: (year: number) => void;
}

export function mountTimeline(opts: TimelineOptions): {
  setCursor: (year: number) => void;
} {
  const { container, yearMin, yearMax, initialCursor, onCursorChange } = opts;
  container.innerHTML = `
    <div style="border-top:2px solid #d8cab0;background:#faf6ec;padding:18px 60px 14px;font-family:'EB Garamond','Georgia',serif">
      <div style="font-size:9px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;text-align:center">时间轴 · 参考维度</div>
      <div id="tl-axis" style="position:relative;height:50px"></div>
      <div style="display:flex;align-items:center;gap:14px;margin-top:10px">
        <button id="tl-play" style="border:1px solid #5b3a8c;background:#fcfaf6;color:#5b3a8c;padding:4px 14px;font-style:italic;cursor:pointer;font-family:inherit;font-size:12px">▶ 播放思想史</button>
        <input id="tl-slider" type="range" min="${yearMin}" max="${yearMax}" value="${initialCursor}" style="flex:1;accent-color:#5b3a8c">
        <span id="tl-cursor-label" style="font-size:12px;color:#5b3a8c;font-style:italic;white-space:nowrap">游标 ${initialCursor}</span>
      </div>
    </div>
  `;

  const axis = container.querySelector('#tl-axis') as HTMLElement;
  axis.style.position = 'relative';

  // 主轴线
  const line = document.createElement('div');
  line.style.cssText = 'position:absolute;left:0;right:0;top:24px;height:1px;background:#888';
  axis.appendChild(line);

  // ticks
  const ticks = computeTickPositions(yearMin, yearMax);
  for (const t of ticks) {
    const pct = yearToPercent(t.year, yearMin, yearMax);
    const tickEl = document.createElement('div');
    tickEl.style.cssText = `position:absolute;left:${pct}%;top:${t.major ? 8 : 14}px`;
    tickEl.innerHTML = `
      <div style="width:${t.major ? 2 : 1}px;height:${t.major ? 14 : 8}px;background:${t.color};margin:0 auto"></div>
      <div style="font-size:10px;color:${t.color};font-style:italic;${t.major ? 'font-weight:700;' : ''}margin-top:${t.major ? 2 : 4}px;text-align:center;transform:translateX(-50%);position:relative">${t.label}</div>
    `;
    axis.appendChild(tickEl);
  }

  // 游标
  const cursor = document.createElement('div');
  cursor.id = 'tl-cursor';
  cursor.style.cssText = `position:absolute;left:${yearToPercent(initialCursor, yearMin, yearMax)}%;top:0;width:2px;height:50px;background:#5b3a8c;opacity:0.6;pointer-events:none`;
  axis.appendChild(cursor);

  // slider 联动
  const slider = container.querySelector('#tl-slider') as HTMLInputElement;
  const cursorLabel = container.querySelector('#tl-cursor-label') as HTMLElement;
  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    cursor.style.left = `${yearToPercent(year, yearMin, yearMax)}%`;
    cursorLabel.textContent = `游标 ${year}`;
    onCursorChange?.(year);
  });

  // 播放按钮 toggle pause (M4 closure fix #5 · qa ISSUE-001 / polish backlog B2)
  // 修复前: 每次 click 起一个 setInterval / 不记 id / 不 toggle 文字
  //   → 第 2 次 click 第 2 个 interval 并发 / 没法暂停 / cursor 加速跑诡异
  // 修复后: activeInterval 闭包记录正在播放的 timer id
  //   null = 未播放 → click 起 interval + 改 ⏸ + aria-pressed=true
  //   非 null = 正在播放 → click clearInterval + 改 ▶ + aria-pressed=false
  //   播放从当前 cursor 位置继续 (用户期望) / 若 cursor 已在 yearMax 则 restart 从 yearMin
  //   跑到 yearMax 自然结束时也 reset textContent + activeInterval
  const playBtn = container.querySelector('#tl-play') as HTMLButtonElement;
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
    let y = parseInt(slider.value, 10);
    if (isNaN(y) || y >= yearMax) y = yearMin; // 末尾或异常时从头
    playBtn.textContent = PAUSE_LABEL;
    playBtn.setAttribute('aria-pressed', 'true');
    activeInterval = setInterval(() => {
      y += 5;
      if (y >= yearMax) {
        slider.value = yearMax.toString();
        slider.dispatchEvent(new Event('input'));
        stopPlayback();
        return;
      }
      slider.value = y.toString();
      slider.dispatchEvent(new Event('input'));
    }, 100);
  }

  playBtn.addEventListener('click', () => {
    if (activeInterval === null) startPlayback();
    else stopPlayback();
  });

  return {
    setCursor: (year: number) => {
      slider.value = year.toString();
      slider.dispatchEvent(new Event('input'));
    },
  };
}
