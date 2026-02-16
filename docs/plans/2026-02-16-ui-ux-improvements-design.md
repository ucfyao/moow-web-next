# Moow 全站 UI/UX 改进设计规范

> 日期：2026-02-16
> 状态：已批准
> 范围：全部 19 个页面 + 全局组件

## 目录

1. [概述](#概述)
2. [设计系统基础](#设计系统基础)
3. [P0 严重问题](#p0-严重问题)
4. [P1 高优先级](#p1-高优先级)
5. [P2 中等优先级](#p2-中等优先级)
6. [P3 低优先级](#p3-低优先级)
7. [逐页改进速查表](#逐页改进速查表)

---

## 概述

### 项目背景

Moow 是一个加密货币智能投顾平台，基于 Next.js 15 App Router 构建，使用 Bulma + Emotion + MUI + Tailwind 四套 CSS 框架共存的样式体系。本文档基于对全站 19 个页面的 UI/UX 审计，整理出 17 项改进任务，按优先级 P0-P3 分层。

### 分析方法

- 全页面代码审查（组件结构、样式、交互逻辑）
- UI/UX Pro Max 设计系统评估（无障碍、交互、性能、布局、动画）
- 金融科技行业最佳实践对标

### 改进总览

| 优先级 | 数量 | 类别 |
|--------|------|------|
| P0 严重 | 4 项 | 无障碍、加载状态、颜色可辨识、键盘导航 |
| P1 高 | 5 项 | 确认弹窗、密码可见性、表格移动端、图表响应式、空状态 |
| P2 中 | 5 项 | 按钮规范、间距阴影、实时验证、页面细节、样式迁移 |
| P3 低 | 3 项 | Glassmorphism、微交互、图表增强 |

---

## 设计系统基础

### 颜色规范

保持现有品牌色，补充语义色：

| 用途 | 色值 | 场景 |
|------|------|------|
| 成功 | `#23d160` | 盈利、运行中、激活 |
| 危险 | `#ff3860` | 亏损、已停止、错误、删除 |
| 警告 | `#ffdd57` | 暂停、提醒 |
| 信息 | `#209cee` | 编辑、查看、链接 |

### 字体比例

6 级字号，覆盖所有场景：

| 级别 | 大小 | 用途 |
|------|------|------|
| xs | 12px | 表格内操作、辅助说明 |
| sm | 14px | 正文、表单标签 |
| base | 16px | 正文默认 |
| md | 18px | 小标题、统计标签 |
| lg | 20-24px | 页面标题、关键指标 |
| xl | 32px | Hero 大标题 |

### 间距系统

8px 基准，7 级间距：

```
--spacing-xs:  4px
--spacing-sm:  8px
--spacing-md:  16px
--spacing-lg:  24px
--spacing-xl:  32px
--spacing-2xl: 48px
```

使用场景：
- 卡片内边距：`--spacing-md`（16px）
- 卡片间距：`--spacing-sm`（8px）或 `--spacing-md`（16px）
- 区块间距：`--spacing-lg`（24px）或 `--spacing-xl`（32px）
- 页面容器内边距：`--spacing-lg`（24px）

### 阴影层级

```
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

- 卡片/Box 默认：`--shadow-sm`
- 卡片 hover 态：`--shadow-md`
- 弹窗/浮层：`--shadow-lg`

### 圆角

```
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
```

### 过渡时长

| 类型 | 时长 | 用途 |
|------|------|------|
| 微交互 | 150ms | 按钮 hover、图标切换 |
| 状态变化 | 200ms | 下拉展开、错误提示 |
| 布局动画 | 300ms | 弹窗进入、卡片进场 |

### 盈亏配色

- 盈利：`#23d160` + `▲` 或 `+` 前缀
- 亏损：`#ff3860` + `▼` 或 `-` 前缀
- 持平：默认文字色，无前缀

---

## P0 严重问题

### P0-1：表单无障碍

**问题：** 输入框缺少 `<label>` 关联、错误提示无 `role="alert"`、验证码无 `alt` 文本。

**影响页面：** `/login`、`/signup`、`/forgetPassword`、`/resetPassword`、`/ucenter/changePassword`、`/aip/addstrategy`、`/aip/addmarketkeys`

**设计规范：**

- 所有 `<input>` 必须有关联的 `<label htmlFor="id">`，或使用 `aria-label` 属性
- 表单错误提示元素添加 `role="alert"` + `aria-live="polite"`
- 验证码 `<img>` 添加 `alt="验证码，点击刷新"`
- 错误消息文本必须填充实际内容（当前部分页面 `<p class="help is-danger"></p>` 为空）

**验收标准：**

- [ ] 所有表单输入框有可访问的标签
- [ ] 错误出现时屏幕阅读器能播报
- [ ] 验证码有替代文本描述

---

### P0-2：骨架屏加载状态

**问题：** 数据加载时无视觉反馈，页面空白或仅显示 "loading..." 文本。

**影响页面：** `/aip`、`/aip/[strategyId]`、`/aip/orders`、`/aip/markets`、`/ucenter/assets`、`/ucenter/invite`、`/`（首页图表）

**设计规范：**

- 创建通用 `<Skeleton>` 组件，支持 `variant`：`text`（单行）、`rect`（矩形块）、`circle`（头像）
- 表格加载：渲染 5 行骨架行，每列用 `Skeleton variant="text"` 占位
- 图表加载：渲染与图表同尺寸的 `Skeleton variant="rect"`
- 统计卡片加载：卡片框架 + 内部数字/标签用骨架占位
- 动画：使用 `@keyframes shimmer` 横向渐变扫光效果，周期 1.5s

**验收标准：**

- [ ] 所有数据页面在 API 返回前展示骨架屏
- [ ] 骨架屏尺寸与实际内容一致，无布局跳动
- [ ] 动画流畅，不消耗过多 CPU

---

### P0-3：颜色不应作为唯一信息载体

**问题：** 盈亏状态仅靠红绿色区分，色盲用户无法辨识。

**影响页面：** `/aip`、`/aip/[strategyId]`、`/aip/orders`、`/ucenter/assets`

**设计规范：**

- 盈利数值前添加 `▲` 或 `+` 前缀，亏损添加 `▼` 或 `-` 前缀
- 策略状态 Tag：运行中添加绿色小圆点 `●`，已停止添加红色方块 `■`
- 买/卖标签：除颜色外添加文字标注（已有 buy/sell 文字的保持即可）
- 表格中盈亏列：数值 + 前缀符号 + 颜色三重信息

**验收标准：**

- [ ] 灰度模式下仍能区分盈亏
- [ ] 状态信息不仅依赖颜色传达

---

### P0-4：键盘导航与焦点管理

**问题：** Navbar 下拉菜单不支持键盘操作，可交互元素无焦点环。

**影响页面：** 全局（Navbar 组件）、所有含可点击卡片的页面

**设计规范：**

- Navbar 下拉菜单添加 `role="menu"`、`aria-expanded`，支持 `Enter/Space` 展开、`Escape` 关闭、`↑↓` 切换选项
- 所有可交互元素添加 `:focus-visible` 样式：`outline: 2px solid #209cee; outline-offset: 2px`
- 可点击卡片（交易所选择、交易对选择等）添加 `tabIndex={0}` + 键盘事件处理
- 全局样式：移除 `outline: none`（如果存在），确保浏览器默认焦点环不被覆盖

**验收标准：**

- [ ] 仅用键盘 Tab 可以遍历所有可交互元素
- [ ] 焦点环清晰可见
- [ ] Navbar 菜单支持键盘完整操作

---

## P1 高优先级

### P1-1：自定义确认弹窗替代 `window.confirm`

**问题：** 删除策略、删除 API Key、切换状态等操作使用浏览器原生 `window.confirm`，体验粗糙且不可定制。

**影响页面：** `/aip`（删除/状态切换）、`/aip/markets`（删除 Key）、`/aip/[strategyId]`（手动买卖）

**设计规范：**

- 创建通用 `<ConfirmModal>` 组件，基于 Bulma `.modal` 结构
- Props：`title`、`message`、`confirmText`、`cancelText`、`variant`（danger / warning / info）、`onConfirm`、`onCancel`、`loading`
- 危险操作（删除）：确认按钮红色 `is-danger`，标题含警告图标
- 普通确认（状态切换）：确认按钮蓝色 `is-info`
- 弹窗出现时 `body` 添加 `overflow: hidden`，防止背景滚动
- 支持 `Escape` 键关闭、点击遮罩关闭
- 确认按钮在请求期间显示 `is-loading` 状态

**验收标准：**

- [ ] 所有 `window.confirm` 替换为 `<ConfirmModal>`
- [ ] 弹窗支持键盘操作（Escape 关闭、Tab 切换按钮）
- [ ] 确认按钮有 loading 态防重复提交

---

### P1-2：密码可见性切换

**问题：** 密码输入框无显示/隐藏切换功能，用户无法确认输入内容。

**影响页面：** `/login`、`/signup`、`/resetPassword`、`/ucenter/changePassword`

**设计规范：**

- 密码输入框右侧添加眼睛图标按钮（Bulma `has-icons-right` + `<span class="icon is-right">`）
- 点击切换 `type="password"` ↔ `type="text"`
- 图标状态：隐藏时 `fa-eye-slash`（灰色），显示时 `fa-eye`（品牌色）
- 按钮使用 `aria-label="显示密码"` / `"隐藏密码"` 动态切换
- 不影响现有的左侧锁图标布局

**验收标准：**

- [ ] 所有密码输入框有切换按钮
- [ ] 切换状态后输入内容不丢失
- [ ] 图标有无障碍标签

---

### P1-3：表格移动端适配

**问题：** 数据表格在移动端需水平滚动，体验差且信息密度过高。

**影响页面：** `/aip`（策略表格 1050px）、`/aip/orders`（订单表格）、`/aip/markets`（800px）、`/aip/[strategyId]`（订单表格）

**设计规范：**

- 断点：`≤768px` 切换为卡片列表视图
- 每条记录渲染为一张卡片，布局：

```
┌─────────────────────────┐
│ BTC/USDT    ● 运行中     │  ← 标题行：交易对 + 状态
│ Binance · 2024-01-15    │  ← 副标题：交易所 + 时间
├─────────────────────────┤
│ 投入: $1,200   均价: $42k │  ← 关键数据 2 列
│ 收益: +$180 (+15%)  ▲   │  ← 盈亏高亮
├─────────────────────────┤
│ [编辑] [暂停] [查看]      │  ← 操作按钮行
└─────────────────────────┘
```

- 桌面端保持现有表格不变
- 使用 CSS Media Query 切换，不需要 JS 判断
- 卡片间距 12px，内边距 16px，圆角 6px

**验收标准：**

- [ ] 768px 以下自动切换为卡片视图
- [ ] 卡片展示关键信息，无水平滚动
- [ ] 桌面端表格样式不受影响

---

### P1-4：图表响应式与时间筛选

**问题：** Highcharts 图表宽度固定，小屏溢出；无时间范围筛选。

**影响页面：** `/`（首页 BTC 走势 + DingtouChart）、`/aip/[strategyId]`（策略走势）、`/fund`

**设计规范：**

- 图表容器设为 `width: 100%`，Highcharts 配置 `chart.reflow = true`
- 监听 `window resize` 事件调用 `chart.reflow()`（防抖 200ms）
- 移动端图表高度降为 250px（桌面端 400px）
- 策略详情页和 Fund 页添加时间范围选择器：
  - 按钮组样式：`7天` | `30天` | `90天` | `全部`
  - 默认选中 `30天`
  - 使用 Bulma `.buttons.has-addons` 样式
- 首页图表不需要时间筛选（固定展示 365 天）

**验收标准：**

- [ ] 图表在所有屏幕宽度下无溢出
- [ ] 窗口缩放时图表自适应
- [ ] 时间筛选器切换后图表数据更新

---

### P1-5：空状态引导设计

**问题：** 数据为空时仅显示 "无记录" 图片或空白，缺少引导。

**影响页面：** `/aip`（无策略）、`/aip/orders`（无订单）、`/aip/markets`（无 API Key）、`/ucenter/assets`（无策略）

**设计规范：**

- 空状态组件 `<EmptyState>` Props：`icon`（SVG 插图）、`title`、`description`、`actionText`、`actionHref`
- 布局：垂直居中，图标 120px、标题 18px 粗体、描述 14px 灰色、按钮在下方
- 各页面配置：

| 页面 | 标题 | 描述 | 按钮 |
|------|------|------|------|
| `/aip` | 还没有策略 | 创建你的第一个定投计划 | 新建策略 → `/aip/addstrategy` |
| `/aip/orders` | 暂无订单记录 | 策略运行后订单会自动出现 | 查看策略 → `/aip` |
| `/aip/markets` | 还没有交易所 API | 添加交易所 API Key 开始交易 | 添加 API Key → `/aip/addmarketkeys` |
| `/ucenter/assets` | 开始你的投资之旅 | 创建定投策略，自动执行投资计划 | 立即开始 → `/aip/addstrategy` |

**验收标准：**

- [ ] 所有列表页空数据时展示引导组件
- [ ] 引导按钮跳转正确
- [ ] 组件可复用、支持 i18n

---

## P2 中等优先级

### P2-1：按钮规范统一

**问题：** 全站按钮尺寸 (`is-small`/默认/`is-medium`)、颜色、圆角混用，无统一规范。

**影响页面：** 全部页面

**设计规范：**

- 按钮尺寸仅保留 2 级：
  - **默认**：表单提交、主操作（高度 36px，字号 14px）
  - **小号** `is-small`：表格内操作、次级操作（高度 28px，字号 12px）
- 按钮语义色规范：

| 场景 | 类名 | 用途 |
|------|------|------|
| 主操作 | `is-link` | 提交、保存、确认 |
| 信息操作 | `is-info` | 编辑、查看详情 |
| 成功操作 | `is-success` | 启动、激活 |
| 警告操作 | `is-warning` | 暂停、修改状态 |
| 危险操作 | `is-danger` | 删除、登出 |
| 次级操作 | `is-outlined` | 取消、返回 |

- 所有可点击元素添加 `cursor: pointer`
- 按钮间距统一 8px（使用 `gap: 8px` 替代 margin hack）
- 异步操作按钮必须支持 `is-loading` + `disabled` 防重复提交

**验收标准：**

- [ ] 全站无 `is-medium` 按钮（统一为默认或小号）
- [ ] 同一场景的按钮颜色一致
- [ ] 所有可点击元素有 `cursor: pointer`

---

### P2-2：间距与阴影统一

**问题：** padding/margin 值随意使用，box-shadow 各页面不一致。

**影响页面：** 全部页面

**设计规范：**

- 在 `globals.scss` 中定义 CSS 变量：

```css
:root {
  --spacing-xs:  4px;
  --spacing-sm:  8px;
  --spacing-md:  16px;
  --spacing-lg:  24px;
  --spacing-xl:  32px;
  --spacing-2xl: 48px;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

- 卡片/Box 统一使用 `--shadow-sm`，hover 态升级为 `--shadow-md`
- 逐步替换硬编码的 px 值为变量引用

**验收标准：**

- [ ] CSS 变量已定义并在至少 80% 的新代码/修改代码中使用
- [ ] 同级别的卡片阴影一致
- [ ] 无随意的间距值（如 13px、17px、22px）

---

### P2-3：表单实时验证反馈

**问题：** 表单仅在提交时验证，用户填完整个表单才知道哪里有错。

**影响页面：** `/login`、`/signup`、`/forgetPassword`、`/resetPassword`、`/ucenter/changePassword`、`/aip/addstrategy`、`/aip/addmarketkeys`

**设计规范：**

- 验证时机：
  - `onBlur`：字段失焦时验证当前字段
  - `onSubmit`：提交时验证全部字段（保持现有逻辑）
  - 不使用 `onChange` 实时验证（避免用户还在输入时就报错）
- 验证通过：输入框边框恢复默认色（不需要绿色勾号，避免过度设计）
- 验证失败：输入框添加 `is-danger` 类名（红色边框）+ 下方显示错误文字
- 注册页密码字段：添加密码强度指示器（复用 changePassword 页的逻辑）
- 错误文字样式：`font-size: 12px; color: #ff3860; margin-top: 4px`

**验收标准：**

- [ ] 所有表单字段支持 `onBlur` 验证
- [ ] 错误提示在字段下方即时显示
- [ ] 提交验证仍然作为最终保障

---

### P2-4：逐页样式细节修正

各页面需要修正的具体样式问题：

#### 首页 (`/`)

- 问题/解答区块：`float` 布局改为 `display: flex` + `gap`
- 特性展示卡片：添加 `hover` 状态（`transform: translateY(-2px)` + `shadow-md`）
- CTA 按钮：增大尺寸（高度 48px、字号 16px、padding 0 32px）

#### 登录/注册 (`/login`、`/signup`)

- 验证码图片：添加 `cursor: pointer` 提示可点击
- 验证码刷新：添加淡入过渡 `opacity transition 200ms`
- 左侧背景区：添加 `gradient overlay` 提升文字可读性

#### 策略列表 (`/aip`)

- 操作列 4 个按钮改为：保留「查看」「编辑」两个按钮 + 更多操作下拉菜单（含暂停/删除）
- 表格行添加 `hover` 背景色 `#f5f5f5`
- 运行中状态 Tag 添加呼吸动画小圆点

#### 策略详情 (`/aip/[strategyId]`)

- 统计区域改为独立卡片组（每个统计项一张卡片，带小图标）
- 关键指标（总收益率）使用 24px 加粗字号
- 信息网格标签与值之间增加视觉间隔

#### 用户资产 (`/ucenter/assets`)

- 统计卡片添加语义 SVG 图标
- XBT 余额区域添加卡片容器 + 轻微品牌色背景

#### 邀请页 (`/ucenter/invite`)

- 邀请码旁添加一键复制按钮（Clipboard API）
- QR 码下方添加 "扫码注册" 说明文案
- 邀请统计数字使用 24px 粗体突出

**验收标准：**

- [ ] 各页面修正项按上述规范实施
- [ ] 修改不影响现有功能
- [ ] 移动端适配正常

---

### P2-5：样式体系统一（forgetPassword / resetPassword）

**问题：** 这两个页面使用独立 CSS 文件而非 Emotion，与其他页面不一致。

**影响页面：** `/forgetPassword`、`/resetPassword`

**设计规范：**

- 将 `/styles/forgetPassword.css` 和 `/styles/resetPassword.css` 迁移为 Emotion `css` 模板字面量
- 文件首行添加 `/** @jsxImportSource @emotion/react */`
- 样式逻辑保持一致，仅改变载入方式
- 迁移完成后删除原 CSS 文件

**验收标准：**

- [ ] 两个页面使用 Emotion 样式
- [ ] 原 CSS 文件已删除
- [ ] 视觉效果与迁移前完全一致

---

## P3 低优先级

### P3-1：设计语言升级 — Glassmorphism 元素引入

**问题：** 当前视觉风格偏传统，缺乏现代金融科技产品的质感。

**影响页面：** 全局（渐进式引入，不一次性重写）

**设计规范：**

- **不是全站重写**，而是在关键位置引入毛玻璃元素提升质感
- 适用场景：
  - 首页 Hero 区域的统计卡片叠加层
  - 策略详情页顶部状态栏
  - 用户资产页的余额展示卡
- 效果参数：

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 8px;
```

- 性能降级方案：

```css
@supports not (backdrop-filter: blur(12px)) {
  background: rgba(255, 255, 255, 0.95);
}
```

- 暗色背景上使用，浅色背景页面不使用（对比度不足）

**验收标准：**

- [ ] 仅在 3-5 个关键位置应用，不过度使用
- [ ] 提供 `@supports` 降级
- [ ] 文字对比度仍满足 4.5:1

---

### P3-2：微交互动画

**问题：** 页面状态变化生硬，缺少过渡反馈。

**影响页面：** 全局

**设计规范：**

- 在 `globals.scss` 中定义 3 类动画：

| 类型 | 时长 | 缓动函数 | 应用场景 |
|------|------|---------|---------|
| 微交互 | 150ms | `ease-out` | 按钮 hover/active、图标切换 |
| 状态过渡 | 200ms | `ease-in-out` | 下拉展开、Tab 切换、错误提示出现 |
| 内容进场 | 300ms | `ease-out` | 卡片列表加载、弹窗进入、页面区块出现 |

- 具体应用：
  - 按钮 hover：`transition: background-color 150ms ease-out, box-shadow 150ms ease-out`
  - 表格行 hover：`transition: background-color 150ms ease-out`
  - 卡片 hover：`transition: transform 200ms ease-out, box-shadow 200ms ease-out`（上移 2px + 阴影加深）
  - 错误提示：`fadeIn 200ms`（从 opacity 0 到 1）
  - Modal 弹窗：`fadeIn 200ms` 遮罩 + `slideUp 300ms` 内容
- 尊重用户偏好：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**验收标准：**

- [ ] 动画时长不超过 300ms
- [ ] 使用 `transform` / `opacity` 属性（GPU 加速），不动画 `width` / `height`
- [ ] `prefers-reduced-motion` 媒体查询已添加

---

### P3-3：高级图表功能

**问题：** 图表交互单一，缺少数据探索能力。

**影响页面：** `/aip/[strategyId]`、`/fund`

**设计规范：**

- Highcharts tooltip 增强：
  - 显示完整数据（日期 + 各系列数值 + 涨跌幅）
  - 自定义 tooltip 模板，统一格式
  - 移动端 tooltip 固定在图表顶部（避免手指遮挡）
- 缩放交互：
  - 桌面端：鼠标框选缩放（`chart.zoomType = 'x'`）
  - 移动端：双指捏合缩放
  - 添加「重置缩放」按钮
- 数据导出（可选）：
  - Highcharts `exporting` 模块，支持导出 PNG/CSV
  - 按钮放在图表右上角，使用小号图标按钮
- 图表无障碍：
  - 添加 `aria-label` 描述图表用途
  - 提供数据表格替代视图（`<details>` 折叠区域内放 `<table>`）

**验收标准：**

- [ ] Tooltip 信息完整且格式统一
- [ ] 缩放功能可用且可重置
- [ ] 图表有可访问的描述

---

## 逐页改进速查表

| 页面 | P0 | P1 | P2 | P3 |
|------|----|----|----|----|
| **全局 (Navbar/Footer)** | P0-4 键盘导航 | — | P2-1 按钮规范, P2-2 间距阴影 | P3-2 微交互 |
| **首页 `/`** | P0-2 骨架屏 | P1-4 图表响应式 | P2-4 布局重构+CTA | P3-1 Glassmorphism |
| **登录 `/login`** | P0-1 表单无障碍 | P1-2 密码可见性 | P2-3 实时验证, P2-4 验证码 | — |
| **注册 `/signup`** | P0-1 表单无障碍 | P1-2 密码可见性 | P2-3 实时验证+强度指示器 | — |
| **忘记密码 `/forgetPassword`** | P0-1 表单无障碍 | — | P2-3 实时验证, P2-5 Emotion迁移 | — |
| **重置密码 `/resetPassword`** | P0-1 表单无障碍 | P1-2 密码可见性 | P2-3 实时验证, P2-5 Emotion迁移 | — |
| **激活 `/activate/[userId]`** | — | — | — | — |
| **确认激活 `/activeConfirm`** | — | — | — | — |
| **关于 `/about`** | — | — | — | — |
| **错误 `/error`** | — | — | — | — |
| **策略列表 `/aip`** | P0-2 骨架屏, P0-3 颜色 | P1-1 确认弹窗, P1-3 表格移动端, P1-5 空状态 | P2-1 按钮, P2-4 操作列+hover | P3-2 状态动画 |
| **策略详情 `/aip/[id]`** | P0-2 骨架屏, P0-3 颜色 | P1-1 确认弹窗, P1-3 表格移动端, P1-4 图表 | P2-4 统计卡片 | P3-1 状态栏, P3-3 图表增强 |
| **创建策略 `/aip/addstrategy`** | P0-1 表单无障碍 | — | P2-1 按钮, P2-3 实时验证 | — |
| **API管理 `/aip/markets`** | P0-2 骨架屏 | P1-1 确认弹窗, P1-3 表格移动端, P1-5 空状态 | P2-4 搜索栏 | — |
| **添加Key `/aip/addmarketkeys`** | P0-1 表单无障碍 | — | P2-1 cursor, P2-3 验证 | — |
| **订单历史 `/aip/orders`** | P0-2 骨架屏, P0-3 颜色 | P1-3 表格移动端, P1-5 空状态 | — | — |
| **用户资产 `/ucenter/assets`** | P0-2 骨架屏, P0-3 颜色 | P1-5 空状态 | P2-4 统计卡片+图标 | P3-1 余额卡 |
| **用户资料 `/ucenter/profile`** | — | — | P2-1 按钮层次, P2-4 分组布局 | — |
| **改密码 `/ucenter/changePassword`** | P0-1 表单无障碍 | P1-2 密码可见性 | P2-3 实时验证 | P3-2 强度条动画 |
| **邀请 `/ucenter/invite`** | P0-2 骨架屏 | — | P2-4 复制按钮+QR说明 | — |
| **基金 `/fund`** | P0-2 骨架屏 | P1-4 图表响应式 | — | P3-3 图表增强 |
