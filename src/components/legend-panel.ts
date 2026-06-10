// M-B2 T6.1 · legend-panel 图例 paper 风格
// spec § 4.9 左下 paper 风格 · 只在 geo-main 模式显示（内容描述地理图视觉）
// 位置：left 60px（sidebar 48px 图标栏右侧让位 + 12px gap）· bottom 76px（timeline 60 + 16px 呼吸）
// 5 行：紫点人物 / 紫实线已走行迹 / 紫虚线未来行迹 / 灰弧线影响关系 / 沙金描边历史国界

export interface LegendPanelApi {
  setVisible(visible: boolean): void;
  destroy(): void;
}

interface LegendRow {
  swatchCss: string;
  label: string;
}

const ROWS: LegendRow[] = [
  {
    swatchCss: 'width:8px;height:8px;border-radius:50%;background:#5b3a8c;',
    label: '人物',
  },
  {
    swatchCss: 'width:18px;height:0;border-top:2px solid #5b3a8c;opacity:0.7;',
    label: '已走行迹',
  },
  {
    swatchCss: 'width:18px;height:0;border-top:2px dashed #5b3a8c;opacity:0.5;',
    label: '未来行迹',
  },
  {
    swatchCss: 'width:18px;height:0;border-top:1px solid #9b8b6f;opacity:0.6;',
    label: '影响关系',
  },
  {
    swatchCss: 'width:14px;height:9px;background:#fcfaf6;border:1px solid #b8a880;',
    label: '历史国界（随时间轴变化）',
  },
];

export function mountLegendPanel(): LegendPanelApi {
  const panel = document.createElement('aside');
  panel.className = 'legend-panel';
  panel.style.cssText = `
    position: fixed;
    left: 60px;
    bottom: 76px;
    background: #fcfaf6;
    border: 1px solid #d8cab0;
    box-shadow: 2px 4px 14px rgba(58, 35, 96, 0.08);
    padding: 10px 16px 12px;
    z-index: 8;
    font-family: 'EB Garamond', Georgia, serif;
  `;

  const title = document.createElement('div');
  title.className = 'legend-panel-title';
  title.style.cssText = `
    font-style: italic;
    font-size: 12px;
    color: #5b3a8c;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  `;
  title.textContent = '§ 图例';
  panel.appendChild(title);

  for (const row of ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'legend-row';
    rowEl.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;';

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.cssText = `display:inline-block;flex-shrink:0;${row.swatchCss}`;
    rowEl.appendChild(swatch);

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.style.cssText = 'font-size:11px;color:#6a5a4a;';
    label.textContent = row.label;
    rowEl.appendChild(label);

    panel.appendChild(rowEl);
  }

  document.body.appendChild(panel);

  return {
    setVisible(visible: boolean): void {
      panel.style.display = visible ? 'block' : 'none';
    },
    destroy(): void {
      panel.remove();
    },
  };
}
