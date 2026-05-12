// M4 T8 · 左侧颗粒度过滤栏组件
// spec § 7 设计 / plan line 2085-2180 实现
//
// 三个 export:
//   - SidebarFilters: 当前 filter 状态 (nodes / relations / cats 三类)
//   - DEFAULT_FILTERS: 默认 claim+person+绿弧+红弧 ON / work+event+place+灰弧 OFF / 5 学科 ON
//   - mountSidebar: 48px 收起态 icon 列 / 200px 展开态 checkbox 列表 / hover + change 回调
//
// ⭐ PM 视觉期待（subagent task brief 决策 / 跟 T7 timeline 同思路）:
//   spec § 7 "颗粒度栏" 暗示是**独立栏**始终可见（"hover icon 触发主画布高亮"语义需要 sidebar 在视口）。
//   T6 + T7 后 #app 改 overflow: auto / 横向 scroll 时主画布可拉到右下，
//   plan 原方案 flex layout sidebar 跟主画布同 #app 内 → 横向 scroll 时 sidebar 也被拉走，
//   → PM 不能稳定看到 icon / 不能稳定操作 checkbox → 不符合"独立栏"期待。
//
//   方案 B (本实现 + main.ts 配合):
//     - sidebar 用 position: fixed; left: 0; top: 0; bottom: 0; z-index: 10
//     - mount 到 document.body（不在 #app 内 / 跟 T7 timeline 同思路）
//     - 跟 timeline (bottom: 0) 不冲突（z-index 同级 / 物理位置不重叠）
//     - #app 加 padding-left: 48px 避免 SVG 被遮挡
//     - 展开 200px 时不调 padding-left → 临时遮挡画布左侧 ~150px（spec § 7.2 默认展开态短暂使用）
//
// 视觉硬约束（AGENTS.md 三件套 + spec § 4 + T7 timeline 同色系）:
//   - font-family: 'EB Garamond', Georgia, serif（避开 Inter/Roboto/Arial）
//   - 米白底 #faf6ec（比主画布 #fcfaf6 略深 / 跟 timeline 同色 / 区分独立栏边界）
//   - 紫 #5b3a8c 主导色（toggle button / hover icon active）
//   - 灰 #888 / 暗灰 #2a2a2a 文字配色

export interface SidebarFilters {
  nodes: { claim: boolean; person: boolean; work: boolean; event: boolean; place: boolean };
  relations: { agreement_with: boolean; disagreement_with: boolean; extends: boolean };
  cats: { me: boolean; po: boolean; et: boolean; re: boolean; mp: boolean };
}

export interface SidebarOptions {
  container: HTMLElement;
  onFilterChange?: (filters: SidebarFilters) => void;
  onHover?: (filterKey: string | null) => void;
}

export const DEFAULT_FILTERS: SidebarFilters = {
  nodes: { claim: true, person: true, work: false, event: false, place: false },
  relations: { agreement_with: true, disagreement_with: true, extends: false },
  cats: { me: true, po: true, et: true, re: true, mp: true },
};

export function mountSidebar(opts: SidebarOptions): { getFilters: () => SidebarFilters } {
  const { container, onFilterChange, onHover } = opts;
  // deep clone 默认 filter 避免多个 mount 共享同一引用
  const filters: SidebarFilters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));

  container.innerHTML = `
    <div class="sidebar" data-state="collapsed" style="width:48px;height:100%;padding:14px 8px;border-right:1px solid #e8e0d0;background:#faf6ec;font-family:'EB Garamond','Georgia',serif;transition:width 0.2s;box-sizing:border-box;overflow:hidden">
      <div class="toggle-btn" style="font-size:18px;color:#5b3a8c;text-align:center;margin-bottom:14px;cursor:pointer;user-select:none">⟩</div>
      <div class="collapsed-icons">
        <div data-filter-icon="node-claim" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#5b3a8c;font-size:14px" title="claim 观点">●</div>
        <div data-filter-icon="node-person" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#5b3a8c;font-size:14px" title="person 人物">👤</div>
        <hr style="border:none;border-top:1px dotted #d0c8b0;margin:8px 0">
        <div data-filter-icon="rel-agreement_with" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#7a9a5a;font-size:18px" title="agreement 影响">↝</div>
        <div data-filter-icon="rel-disagreement_with" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#b8654a;font-size:18px" title="disagreement 反驳">⇋</div>
        <div data-filter-icon="rel-extends" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#aaa;font-size:18px" title="extends 自延">⋯</div>
      </div>
      <div class="expanded-content" style="display:none">
        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">节点类型</div>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#2a2a2a"><input type="checkbox" data-filter="node-claim" checked style="margin-right:6px;accent-color:#5b3a8c">观点 claim</label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#2a2a2a"><input type="checkbox" data-filter="node-person" checked style="margin-right:6px;accent-color:#5b3a8c">人物 person</label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#888"><input type="checkbox" data-filter="node-work" style="margin-right:6px;accent-color:#5b3a8c">著作 work</label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#888"><input type="checkbox" data-filter="node-event" style="margin-right:6px;accent-color:#5b3a8c">事件 event</label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#888"><input type="checkbox" data-filter="node-place" style="margin-right:6px;accent-color:#5b3a8c">地点 place</label>

        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin:14px 0 6px">关系类型</div>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#2a2a2a"><input type="checkbox" data-filter="rel-agreement_with" checked style="margin-right:6px;accent-color:#5b3a8c">影响 <span style="color:#7a9a5a">●</span></label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#2a2a2a"><input type="checkbox" data-filter="rel-disagreement_with" checked style="margin-right:6px;accent-color:#5b3a8c">反驳 <span style="color:#b8654a">●</span></label>
        <label style="display:block;font-size:13px;margin-bottom:5px;color:#888"><input type="checkbox" data-filter="rel-extends" style="margin-right:6px;accent-color:#5b3a8c">自延 <span style="color:#aaa">●</span></label>

        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin:14px 0 6px">学科</div>
        <label style="display:block;font-size:12px;margin-bottom:4px;color:#2a2a2a"><input type="checkbox" data-filter="cat-me" checked style="margin-right:6px;accent-color:#5b3a8c">形而上 me</label>
        <label style="display:block;font-size:12px;margin-bottom:4px;color:#2a2a2a"><input type="checkbox" data-filter="cat-po" checked style="margin-right:6px;accent-color:#5b3a8c">政治 po</label>
        <label style="display:block;font-size:12px;margin-bottom:4px;color:#2a2a2a"><input type="checkbox" data-filter="cat-et" checked style="margin-right:6px;accent-color:#5b3a8c">伦理 et</label>
        <label style="display:block;font-size:12px;margin-bottom:4px;color:#2a2a2a"><input type="checkbox" data-filter="cat-re" checked style="margin-right:6px;accent-color:#5b3a8c">宗教 re</label>
        <label style="display:block;font-size:12px;margin-bottom:4px;color:#2a2a2a"><input type="checkbox" data-filter="cat-mp" checked style="margin-right:6px;accent-color:#5b3a8c">元哲学 mp</label>
      </div>
    </div>
  `;

  const sidebar = container.querySelector('.sidebar') as HTMLElement;
  const toggleBtn = container.querySelector('.toggle-btn') as HTMLElement;
  const collapsedIcons = container.querySelector('.collapsed-icons') as HTMLElement;
  const expandedContent = container.querySelector('.expanded-content') as HTMLElement;

  toggleBtn.addEventListener('click', () => {
    if (sidebar.dataset.state === 'collapsed') {
      sidebar.dataset.state = 'expanded';
      sidebar.style.width = '200px';
      collapsedIcons.style.display = 'none';
      expandedContent.style.display = 'block';
      toggleBtn.textContent = '⟨';
    } else {
      sidebar.dataset.state = 'collapsed';
      sidebar.style.width = '48px';
      collapsedIcons.style.display = 'block';
      expandedContent.style.display = 'none';
      toggleBtn.textContent = '⟩';
    }
  });

  // checkbox change → 更新 filter 状态 + 触发 onFilterChange
  // key 格式: "<type>-<name>"，第一个 hyphen 分隔（name 可能含 underscore 如 agreement_with）
  // 例: "rel-agreement_with" → type = "rel" / name = "agreement_with"
  container.querySelectorAll('input[data-filter]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const key = (cb as HTMLInputElement).getAttribute('data-filter')!;
      const checked = (cb as HTMLInputElement).checked;
      const dashIdx = key.indexOf('-');
      const type = key.substring(0, dashIdx);
      const name = key.substring(dashIdx + 1);
      if (type === 'node') (filters.nodes as Record<string, boolean>)[name] = checked;
      else if (type === 'rel') (filters.relations as Record<string, boolean>)[name] = checked;
      else if (type === 'cat') (filters.cats as Record<string, boolean>)[name] = checked;
      onFilterChange?.(filters);
    });
  });

  // hover icon → onHover (高亮预览主画布对应类型)
  container.querySelectorAll('[data-filter-icon]').forEach((icon) => {
    icon.addEventListener('mouseenter', () => onHover?.(icon.getAttribute('data-filter-icon')));
    icon.addEventListener('mouseleave', () => onHover?.(null));
  });

  return { getFilters: () => filters };
}
