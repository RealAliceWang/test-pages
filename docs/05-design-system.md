# 设计规范

本规范由 3D3S 云授权系统改版沉淀而来，可直接复用于同类 B 端后台产品。
所有取值以 `src/index.css` 的 `@theme` 为唯一来源，本文档是它的说明书。

## 1. 设计基调

一句话：**灰画布上悬浮圆角外壳，壳内三栏（图标轨 + bento 主区 + 白色任务栏），柠檬绿标记数据**。

参考图的高级感来自五个**结构性**特征，缺一不可 —— 只换颜色和圆角是换不出来的：

1. **悬浮外壳** — 整个应用装在一个 34px 圆角面板里，四周留边，浮在灰底上
2. **图标窄轨** — 导航是壳内一列图标胶囊，账号入口固定在轨底
3. **右侧任务栏** — 白色独立列，承载「待办」与「目标」，不随主区滚动
4. **bento 错落** — 卡片大小不等，有明确主次，不是均分栅格
5. **环形进度 + 柠檬绿** — 比例用环形，绿色专门标记「这是数据」

三栏结构是关键：**主区回答「现状如何」，右栏回答「接下来做什么」**。
两者分列且独立滚动，用户浏览数据时待办清单始终在视野里。

改版前的问题与对应决策：

| 原状态 | 问题 | 现决策 |
| --- | --- | --- |
| 内容通铺到屏幕边缘 | 页面像一堆卡片，不像一个产品 | 圆角悬浮外壳 `.app-shell` |
| 244px 深海军蓝侧边栏 | 视觉重量全压左侧，页面失衡 | 壳内图标窄轨，选中态为墨黑圆形 |
| 待办混在主区列表里 | 滚动后就看不见了 | 独立白色右栏 `.app-aside`，不随主区滚动 |
| 四等分指标栅格 | 无主次，模板感 | bento：身份卡 5 列 + 比例块 7 列 |
| 全是纯灰白 | 偏冷、偏"后台" | 亮蓝身份卡 `.panel-feature` 作暖色锚点 |
| 比例只用横条表达 | 扫读效率低 | 环形 `RingProgress` 或三重表达 `MiniStat` |
| 卡片标题 16px 加粗 | 与数字抢层级 | 标题降到 13.5px，数字承担层级 |
| 蓝色渐变用在按钮/标签/开关/进度条 | 渐变泛滥 | 渐变只留给身份卡与墨黑区 |
| 页面底色带蓝调 + 三色光晕 | 白卡浮不起来 | 四层中性面：画布 → 壳 → 白卡/白栏 |
| 圆角 8/14/18px 混用 | 语言不统一 | 壳 34px，卡片 22px，控件胶囊 |
| 每页各写一套指标卡 | 6 页 6 种样式 | 统一 `MetricCard` |
| 图表 8 色轮转 | 颜色无语义 | 墨黑打头 6 色序列，柠檬绿标重点 |

两条判断标准：

- **如果一个颜色不承担语义，就不该出现。**
- **如果一个卡片和旁边一样大，就要问它凭什么一样重要。**

---

## 2. 色彩

### 2.1 品牌与行动色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-ink` | `#0A0C10` | 主行动色。主按钮、导航选中态、Toast、主数据序列 |
| `--color-ink-soft` | `#1A1D24` | 墨黑 hover 态 |
| `--color-primary` | `#2F6BFF` | 强调色。链接、聚焦环、次级数据序列 |
| `--color-primary-dark` | `#1E4FD8` | 蓝色按钮 hover、蓝底上的文字 |
| `--color-primary-bg` | `#EDF2FF` | 蓝色浅底（图标底、软标签） |
| `--color-primary-ring` | `rgba(47,107,255,.18)` | 输入框聚焦光环 |
| `--color-signal` | `#C8F135` | **柠檬绿。数据高亮专用** |
| `--color-signal-deep` | `#5F7A04` | 柠檬绿需要承载文字时的替代色 |

**柠檬绿的唯一职责是「标记数据」**：环形进度、进度条填充、图表重点序列、达标徽章。

它有三条硬约束：

- 不进导航、不进按钮 —— 一旦用作交互色，它就不再意味着「这是数字」
- 不做白底上的正文（对比度约 1.5:1，远不达标）；需要文字时用 `--color-signal-deep`
- 绿底上的文字用 `#2C3A00`（`.chip-signal` 已封装），对比度 ≥ 7:1

**主色为什么是墨黑而不是蓝**：B 端页面上蓝色出现频率极高（链接、选中、图标、进度）。
若主按钮也用蓝，页面就没有真正的视觉锚点。墨黑主按钮把"最重要的那一个动作"独立出来，
蓝色因此重新变得有意义。

> 每屏只允许一个墨黑主按钮。第二个动作用 `.btn-soft`，第三个用 `.btn-ghost`。

### 2.2 语义色

每个语义色是三件套：`深色（文字）/ 亮色（图形）/ 浅底（背景）`。
文字色在自己的浅底上均满足 4.5:1。

| 语义 | 文字 | 图形 | 浅底 | 含义 |
| --- | --- | --- | --- | --- |
| success | `#047857` | `#10B981` | `#ECFDF5` | 生效中、已完成、已认证 |
| warning | `#B45309` | `#F59E0B` | `#FFFAEB` | 待审批、即将到期、待支付 |
| danger | `#DC2626` | `#EF4444` | `#FEF2F2` | 已驳回、停用、删除 |
| orange | `#EA580C` | `#F97316` | `#FFF7ED` | 商业版、计费相关 |
| violet | `#6D28D9` | `#8B5CF6` | `#F5F3FF` | 厂商侧动作 |

**红绿不单独承载信息**：状态一律走 `StatusBadge`，色块之外必须有文字。

### 2.3 中性色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-text` | `#0A0C10` | 标题、数字、主体 |
| `--color-text-secondary` | `#4A515E` | 正文、次级信息 |
| `--color-text-muted` | `#6B7280` | 辅助说明、表头 |
| `--color-text-placeholder` | `#9CA3AF` | 占位符、禁用、空态图标 |
| `--color-page-bg` | `#D9DCE1` | 最外层灰画布 |
| `--color-shell` | `#EFF1F4` | 应用外壳、Header 底、导航轨底 |
| `--color-aside` | `#FFFFFF` | 右侧任务栏 |
| `--color-surface` | `#FFFFFF` | 卡片 |
| `--color-surface-secondary` | `#F4F6F8` | 内嵌面板、表头 |
| `--color-surface-hover` | `#EBEEF2` | hover 底、进度槽 |
| `--color-hairline` | `rgba(10,12,16,.05)` | 卡片描边、分隔线 |

**四层面是「浮起来」的前提**：`#D9DCE1` → `#EFF1F4` → `#FFFFFF`，每层必须比下层明显更亮。
画布刻意压到 `#D9DCE1`（比常见的 `#F8FAFC` 深好几档），否则外壳和白卡都浮不起来。

右栏与卡片同为纯白，靠**位置**而非明度区分 —— 它是壳的一部分，不是浮在壳上的卡片。

### 2.4 身份卡蓝

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-feature` | `#5B9BF8` | 亮蓝身份卡主色 |
| `--color-feature-deep` | `#2F6BFF` | 身份卡上白色按钮的文字色 |

`.panel-feature` 是页面上**唯一的暖色块**，作用是让整屏灰白不至于冷冰冰。
和 `.panel-ink` 二选一，不能同屏出现两个焦点色块。

---

## 3. 字体与排版

字体：`Plus Jakarta Sans`（拉丁）→ `PingFang SC` / `Microsoft YaHei`（中文）。

### 3.1 字号阶梯

| 角色 | 字号 | 字重 | 字距 | 场景 |
| --- | --- | --- | --- | --- |
| 页面标题 | 26px | 800 | -0.035em | `Header` 问候语 |
| 身份卡数字 | 40px | 800 | -0.04em | `.panel-feature` 核心指标 |
| 活跃度数字 | 38px | 800 | -0.04em | 大数字 + 柱状图 |
| 指标数字 | 34px | 800 | -0.04em | `MetricCard` |
| 比例数字 | 27px | 800 | -0.04em | `MiniStat` |
| 右栏标题 | 17px | 800 | -0.02em | 任务栏分区标题 |
| 卡片标题 | 13.5px | 700 | -0.01em | `SectionCard` 标题 |
| 正文 | 14px | 400 | 0 | 表格、列表、说明 |
| 辅助 | 13px | 400 | 0 | 副标题、hint |
| 微标签 | 12px | 600 | 0 | 状态标签、Show all |
| Eyebrow | 11px | 700 | +0.14em | 分组标题（大写） |

**卡片标题刻意做小（13.5px）**：在这套布局里层级由数字承担，
标题只是给数字贴标签。标题一旦加粗放大，就会和它所标注的数据抢注意力。

### 3.2 两条硬规则

**数字必须等宽**。表格与指标一律带 `.num`（或 `.display-num`），否则数值刷新时会左右抖动。

**大数字必须收紧字距**。`.display-num` 统一 `-0.04em / line-height .92`。
字距不收的大号数字只是"字大"，不是"设计过"。

```html
<!-- 指标数字 -->
<p class="display-num text-[34px] text-text">86%</p>
<!-- 表格数字 -->
<td class="num">1,280</td>
```

---

## 4. 间距、圆角、投影

### 4.1 间距

以 4px 为基，实际只用这几档：

| 场景 | 值 |
| --- | --- |
| 页面外框 | `p-7`（28px） |
| 区块之间 | `gap-5`（20px） |
| 卡片内边距 | `px-5 py-[18px]` ~ `px-6 py-6` |
| 卡片头部 | `px-6 py-[18px]` |
| 表格单元格 | `px-5 py-3` |
| 图标与文字 | `gap-2` ~ `gap-3` |

### 4.2 圆角

| Token | 值 | 用途 |
| --- | --- | --- |
| `--radius-xs` | 10px | 小色块 |
| `--radius-sm` | 12px | 内嵌小卡、多行输入 |
| `--radius-md` | 16px | 内嵌面板、浮层、弹窗 |
| `--radius-lg` | 22px | **卡片标准圆角** |
| `--radius-xl` | 28px | 大尺寸容器 |
| `--radius-shell` | 34px | **应用外壳**，必须大于其内任何卡片 |
| `--radius-pill` | 999px | **所有控件** |

规则：**壳 34px > 卡片 22px > 控件胶囊**，三层不混用。
圆角必须由外向内递减，反过来会让内层"顶破"外层。
圆形容器（图标底、头像、导航选中态、空态图标）一律正圆。

### 4.3 投影

中性投影，绝不带品牌色 —— 带色投影会在白底上显出一层脏雾。

| Token | 用途 |
| --- | --- |
| `--shadow-xs` | 分段控件里被选中的那一片 |
| `--shadow-card` | 卡片静置 |
| `--shadow-elevated` | 卡片 hover、下拉、墨黑主视觉区 |
| `--shadow-float` | 弹窗、Toast |
| `--shadow-ink` | 墨黑按钮专用 |

每层都是「1px 接触影 + 大范围低透明度环境影」的组合。

---

## 5. 组件

### 5.1 面板

| 类 | 用途 |
| --- | --- |
| `.app-shell` | **应用外壳**。全局仅一个，包住三栏 |
| `.app-aside` | **右侧任务栏**。白底，独立滚动 |
| `.panel` | 标准卡片。白底 + 发丝描边 + `shadow-card` |
| `.panel-feature` | **亮蓝身份卡**。每页最多一个，与 `.panel-ink` 二选一 |
| `.panel-inset` | 卡片**内部**的次级容器。扁平无投影 —— 投影套投影会发浑 |
| `.panel-ink` | 墨黑主视觉区。自带蓝/黄双光晕。**每页最多一个** |
| `.panel-floating` | 下拉、气泡。不透明，滚动内容不可透出 |
| `.panel-hover` | 追加给可点卡片：hover 上浮 3px + 升高投影 |

### 5.2 按钮

统一高度：主要 38–42px，次要 32–34px。全部胶囊。

| 类 | 层级 | 用法 |
| --- | --- | --- |
| `.btn-primary` | 主 | 墨黑实底。每屏一个 |
| `.btn-accent` | 主（蓝） | 蓝底。仅当同屏需压过墨黑按钮时 |
| `.btn-soft` | 次 | 灰底。取消、查看全部 |
| `.btn-ghost` | 三 | 白底描边。加载更多 |
| `.btn-icon` | 图标 | 正圆，hover 出灰底 |

```html
<button class="btn-primary h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
  确认
</button>
```

危险动作用 `bg-danger` + 胶囊，并与主按钮保持间距。

### 5.3 输入

`.field` 默认灰底无边框，聚焦时转白底 + 蓝边 + 3px 光环。
搜索框等单行控件为胶囊；多行/下拉追加 `.field-box` 转为 12px 圆角。

### 5.4 MetricCard

全站唯一的指标卡（`src/components/common/MetricCard.tsx`）。

结构固定为 **标签 → 数字 → 提示**。标签行高固定，因此一排卡片的数字落在同一基线上，
整行能作为"一行数字"扫读，而不是四个互不相干的盒子。

```tsx
const metrics: Metric[] = [
  { icon: KeyRound, value: 128, label: '持有席位', hint: '覆盖 12 个模块', tone: 'accent', to: '/seats' },
];
<div className="grid grid-cols-4 gap-5 stagger">
  {metrics.map((m) => <MetricCard key={m.label} metric={m} onGo={navigate} />)}
</div>
```

`tone` 只有四档，**不接受自定义颜色**：

| tone | 含义 |
| --- | --- |
| `neutral` | 中性事实 |
| `accent` | 主要指标 |
| `positive` | 健康、已完成 |
| `attention` | 需要处理 |

> tone 应由数据推导，而非写死：`tone: inbox.length ? 'attention' : 'neutral'`。

### 5.5 RingProgress

环形进度（`src/components/common/RingProgress.tsx`）。默认柠檬绿。

```tsx
<RingProgress value={86} size={124} thickness={12} caption="席位利用率" />
```

**只用于有上限的比例**（利用率、完成度、配额占用）。
给无上限的计数套环形会暗示一个并不存在的天花板 —— 那种情况用大数字或头像组。

工作台主视觉区按这条规则分流：管理员看到利用率环形，成员和厂商看到头像组。

### 5.6 SectionCard

全站卡片外壳（`src/components/common/SectionCard.tsx`）：小标题 + 右侧「查看全部」文字链 + 内容。

```tsx
<SectionCard title="近 7 天活跃度" actionLabel="用量统计" to="/statistics" className="xl:col-span-7">
  …
</SectionCard>
```

`bare` 用于列表类内容，让行铺满卡片宽度。
「查看全部」是 12px 灰色文字链，不是按钮 —— 它是次要出口，不该有按钮的视觉重量。

### 5.7 MiniStat

比例三重表达：分数 + 进度条 + 百分比。

```tsx
<MiniStat label="席位已分配" current={68} total={80} icon={KeyRound} onClick={…} />
```

三种表达各回答一个问题：**多少个**、**多满**、**离目标多远**。
`warn` 切成琥珀色，用于需要处理的比例。无上限的计数用 `MetricCard`，不要用这个。

### 5.8 WorkQueue（右栏）

`useAside()` 把内容挂进壳的右栏：

```tsx
useAside(<WorkQueue items={inbox} pools={orgPools} ownView={false} />, [inbox.length]);
```

依赖数组是原始依赖而非 `[node]` —— JSX 每次渲染都是新对象，用 `[node]` 会死循环。
右栏只放**「接下来做什么」**：待办清单、目标进度。数据展示留在主区。

### 5.9 其他

- **StatusBadge** — 胶囊 + 圆点 + 文字，扁平填充。新状态只需在 `map` 里登记语义档位。
- **TabFilter** — 灰槽 + 白色胶囊滑块，靠投影而非颜色表达选中。
- **Toggle** — 开启为墨黑，与主按钮同色。
- **Modal** — 50% 墨黑遮罩 + 6px 模糊，`Esc` 关闭并锁滚动。
- **FlashToast** — 墨黑胶囊居中顶部，`aria-live="polite"`，3.6s 自动消失。
- **.meter** — 全站唯一进度条。默认柠檬绿，异常态（过载/低效/过期）才切 `warning` 或灰。

```html
<div class="meter"><span style="width:72%"></span></div>
```

---

## 6. 布局

### 6.1 三栏外壳

```
body（灰画布 #D9DCE1）
└── .app-shell（圆角 34px，四周留边 16/24px）
    ├── Sidebar    展开 236px / 收起 84px，账号入口固定轨底
    ├── main       独立滚动
    │   ├── Header  sticky，问候语 + 居中搜索 + 铃铛 + 身份
    │   └── 内容    px-7 pb-7，12 列 bento
    └── .app-aside 336px 白栏，独立滚动（xl 以上显示）
```

两个关键点：

- **滚动发生在各栏内部而非 window**，外壳圆角始终可见
- **右栏与主区独立滚动**，浏览数据时待办不会滚走

右栏是可选的：页面不调 `useAside()` 就不占位，表格页因此能用满宽度。

### 6.2 页面骨架

```tsx
<div>
  <Header title={greeting} subtitle="…" search />
  <div className="px-7 pb-7 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
    <div className="xl:col-span-5 xl:order-1 panel-feature …">{/* 身份卡 */}</div>
    <div className="xl:col-span-7 xl:order-2 grid grid-cols-2 gap-4">{/* MiniStat */}</div>
    <SectionCard className="xl:col-span-5 xl:order-3">{/* 团队 */}</SectionCard>
    <SectionCard className="xl:col-span-7 xl:order-4">{/* 图表 */}</SectionCard>
  </div>
</div>
```

`order` 必须**全部显式声明**。混用隐式顺序和显式 order 会在断点切换时错位。

### 6.3 bento 规则

- 一屏内**必须有一个主导单元**，宽或高至少是邻居的 1.5 倍
- 主导单元承载「本页最重要的那个数字」：`.panel-feature` 或 `.panel-ink`
- 12 列栅格，常用切分：5/7（身份 + 比例）、4/8（环形 + 指标）、7/5（图表 + 列表）
- 窄屏（< 1280px）退化为单列，bento 与右栏都只在 `xl` 以上生效

卡片头部统一：`px-6 py-[18px] border-b border-hairline`，标题 16px/700/-0.02em，副标题 13px。

---

## 7. 动效

单一缓动：`--ease-fluid: cubic-bezier(.22,1,.36,1)`。

| 场景 | 时长 |
| --- | --- |
| 颜色/背景 | 180ms |
| 卡片 hover | 240ms |
| 入场 `.rise` | 460ms |
| 进度条 | 600ms |

`.stagger` 给卡片网格 45ms 递进延迟，第 5 个及之后统一 170ms，长列表不会越等越久。

只动 `transform` 与 `opacity`。全局已适配 `prefers-reduced-motion`。

---

## 8. 图表

Recharts 渲染 SVG，读不到 CSS 变量，因此图表色单独放在 `src/theme.ts`。
**这是全项目唯一允许出现颜色字面量的地方。**

```ts
import { chart, chartSeries, chartTooltip } from '../theme';
```

- `chart.signal`（柠檬绿）标记**被强调的那个量**，如席位排行的条形。
- `chartSeries` 以墨黑打头 —— 单序列图表因此是单色的，绿色不会退化成普通分类色。
- 超过 6 个分类应聚合，而不是延长色板。
- 网格线用 `chart.grid`，压在数据之下。

---

## 9. 无障碍底线

- 正文对比度 ≥ 4.5:1，大字与图形 ≥ 3:1
- 焦点环全局 2px，禁止移除
- 图标按钮必须有 `aria-label`
- 状态不靠颜色单独表达
- 点击区 ≥ 36px，触屏场景 ≥ 44px
- 尊重 `prefers-reduced-motion`

---

## 10. 落地检查清单

新页面合并前逐条核对：

- [ ] 页面骨架不带 `min-h-screen`（滚动在栏内，不在 window）
- [ ] 首屏有明确的主导单元，不是均分栅格
- [ ] bento 单元的 `order` 全部显式声明
- [ ] 卡片标题 13.5px，未与数字抢层级
- [ ] 有上限的比例用 `RingProgress` / `MiniStat`，无上限的计数用 `MetricCard`
- [ ] 柠檬绿只出现在数据上，未进导航或按钮
- [ ] 每页最多一个焦点色块（`.panel-feature` 或 `.panel-ink`，不同时出现）
- [ ] 右栏只放待办与目标，未塞入数据展示
- [ ] 指标用 `MetricCard`，未自建指标卡
- [ ] 全屏仅一个 `.btn-primary`
- [ ] 圆角由外向内递减：壳 34 > 卡片 22 > 控件胶囊
- [ ] 无颜色字面量（图表除外，走 `theme.ts`）
- [ ] 数字带 `.num` / `.display-num`
- [ ] 进度条用 `.meter`
- [ ] 卡片头部为 `px-6 py-[18px] border-b border-hairline`
- [ ] 空态是「圆形灰底图标 + 说明 + 可选动作」
- [ ] 图标全部来自 lucide-react，无 emoji
- [ ] `npm run lint && npm run verify && npm run verify:pages` 全绿

### 反面清单

以下写法在本项目视为缺陷：

| 禁止 | 改用 |
| --- | --- |
| 内容通铺到屏幕边缘 | 装进 `.app-shell` |
| 首屏四等分卡片 | bento，给最重要的那个更大的格子 |
| 卡片标题 16px 加粗 | 13.5px，让数字承担层级 |
| 同屏两个焦点色块 | 只留一个 `.panel-feature` 或 `.panel-ink` |
| 待办混在主区列表 | 挂进右栏 `useAside()` |
| `useAside(node, [node])` | 传原始依赖，否则死循环 |
| bento 里混用隐式顺序和 order | 全部显式声明 order |
| 柠檬绿用于按钮、导航、正文 | 只用于数据；文字场景用 `--color-signal-deep` |
| 给无上限的计数加环形进度 | 大数字或头像组 |
| 按钮/标签/进度条上的渐变 | 扁平填充；渐变只给 `.panel-ink` |
| 卡片顶部 3px 彩条 | 删除，靠留白与字重建立层级 |
| 卡片角落模糊光晕 | 删除 |
| 组件里写死 hex | CSS 变量或语义 class |
| 无语义的多色轮转 | 单色，或语义 tone |
| `.panel` 里再套 `.panel` | 用 `.panel-inset` |
| 页面自建指标卡 | `MetricCard` |
| 同屏多个墨黑主按钮 | 仅保留最重要的一个 |
| 定义了令牌却不用 | 要么用起来，要么删掉 |

---

## 11. 复现

```bash
npm run dev
node --import tsx/esm scripts/shot.ts .review/ref5   # 15 页多角色截图
```

改版前后对照见 `.review/before/` 与 `.review/ref5/`。
右栏需要 ≥ 1280px 宽度才会出现，截图脚本用的是 1600×1000。
