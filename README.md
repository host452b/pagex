# Pagex

Pagex 是一个 Chrome Manifest V3 插件，用于把当前网页提取成适合 AI 处理的 JSON。它会尽量保留页面结构、文本、样式摘要、隐藏内容和可展开内容，并通过 popup 提供清晰的解析与复制流程。

Pagex is a Chrome Manifest V3 extension that extracts the current page into AI-friendly JSON. It is designed to capture structure, text, style summaries, hidden content, and expanded disclosure content with a visible parse flow in the popup.

## Features / 功能

- 在 popup 中选择目标 tab / choose the target tab from the popup
- 点击 `Parse` 后执行增强但带保护的页面采集 / click `Parse` to run an aggressive but guarded collection pass
- 自动展开常见折叠内容，如 `details`、`aria-expanded="false"` 和常见 accordion 控件 / expand common disclosure patterns such as `details`, `aria-expanded="false"`, and common accordion controls
- 通过自动滚动触发部分 lazy-loaded 内容 / trigger lazy-loaded content by auto-scrolling the page
- 采集 DOM 与 shadow DOM，并输出结构化 JSON / collect DOM and shadow DOM nodes into structured JSON
- 合并可访问 iframe 结果，并显式标记跳过或失败的 frame / merge accessible iframe results and mark skipped or failed frames explicitly
- 在 popup 中展示完成反馈，并支持一键复制 JSON / show completion feedback in the popup and copy the final JSON with one click
- 按选中站点的 origin 动态申请权限，而不是永久持有全站权限 / request site access for the selected origin at parse time instead of holding permanent all-site access
- 默认导出更紧凑的结果，包含敏感属性过滤、URL scrub 和遍历预算 / export a more compact payload by default with sensitive attribute filtering, URL scrubbing, and traversal budgets

## File Layout / 项目结构

- `manifest.json`: MV3 插件清单 / MV3 extension manifest
- `background.js`: 解析任务编排与 session 状态存储 / parse orchestration and session state storage
- `content.js`: 注入目标页面的核心采集器 / in-page collector injected into the target tab
- `popup.html`, `popup.css`, `popup.js`: popup 界面、动画和交互流程 / popup UI, animation, and interaction flow
- `src/shared/`: 共享状态、权限与格式化工具 / shared state, permission, and formatting utilities
- `fixtures/`: 本地手工验证页面 / manual verification pages
- `tests/`: 基于 Node 的单元测试 / Node-based unit tests

## Install / 安装

1. 打开 Chrome 并访问 `chrome://extensions`。Open Chrome and go to `chrome://extensions`.
2. 开启 `Developer mode`。Enable `Developer mode`.
3. 点击 `Load unpacked`。Click `Load unpacked`.
4. 选择当前项目目录。Select this project folder.

## Use / 使用

1. 打开你想解析的网页。Open the page you want to parse.
2. 点击 `Pagex` 插件图标。Click the `Pagex` extension icon.
3. 在下拉框中选择目标 tab。Choose the target tab in the dropdown.
4. 点击 `Parse`。Click `Parse`.
5. 如果 Chrome 弹出权限请求，允许当前站点访问。Approve the site access prompt if Chrome asks for it.
6. 等待 popup 显示成功状态。Wait until the popup shows the success state.
7. 点击 `Copy JSON` 复制结构化结果。Click `Copy JSON` to copy the structured payload.

## Local Fixture / 本地验证页

你可以通过 `fixtures/demo-page.html` 手工验证采集器行为。

You can manually verify the collector with `fixtures/demo-page.html`.

1. 在 Chrome 中打开 `fixtures/demo-page.html`。Open `fixtures/demo-page.html` in Chrome.
2. 如果 Chrome 阻止插件访问本地文件，请在扩展详情中启用 `Allow access to file URLs`。If Chrome blocks extension access on local files, enable `Allow access to file URLs` for the extension.
3. 执行 `Parse`，确认结果包含以下内容。Run `Parse` and check that the output includes:
   - 原生 `details` 内容 / details content
   - `Read more` 展开内容 / `Read more` expanded content
   - fragment collapse link 展开内容 / fragment collapse link content
   - shadow DOM 内容 / shadow DOM content
   - iframe 内容 / iframe content
   - 自动滚动后触发的 lazy-loaded 内容 / lazy-loaded content after auto-scroll
   - 危险按钮不会被误点 / the danger button remaining unclicked
   - 已展开控件不会被重复点击 / the already expanded control remaining unclicked

## Test / 测试

```bash
npm test
```

## Package / 打包

使用下面的命令生成可上传到 Chrome Developer Dashboard 的 zip 包。

Use the command below to generate a zip archive that can be uploaded to the Chrome Developer Dashboard.

```bash
npm run package
```

默认输出路径：

Default output path:

- `release/pagex-v<manifest.version>.zip`

打包脚本会只包含插件运行时需要的文件，不会把 `tests`、`fixtures`、`node_modules`、`README.md` 或其他开发文件打进 zip。

The packaging script only includes files required at runtime. It excludes `tests`, `fixtures`, `node_modules`, `README.md`, and other development-only files.

## Store Assets / 商店素材

使用下面的命令生成 Chrome Web Store 上架素材。

Use the command below to generate Chrome Web Store listing assets.

```bash
npm run generate:store-assets
```

默认会生成：

By default, this generates:

- 运行时图标 / runtime icons
  - `assets/icons/pagex-16.png`
  - `assets/icons/pagex-32.png`
  - `assets/icons/pagex-48.png`
  - `assets/icons/pagex-128.png`
- 商店宣传图 / promo images
  - `store-assets/promo/pagex-small-promo-440x280.png`
  - `store-assets/promo/pagex-marquee-1400x560.png`
- 商店截图 / store screenshots
  - `store-assets/screenshots/pagex-screenshot-01-target-tab-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-02-parsing-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-03-parse-complete-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-04-copy-json-1280x800.png`
- 上架文案与合规资料 / listing and compliance docs
  - `docs/store-listing/`

当前品牌方向为：

Current brand direction:

- `PX` 双字母 `16-bit / pixel-art` logo
- `Brutalist / 粗野主义` 黑白系统信息风格
- 纯黑白、高对比、等宽字体、粗边框

## Notes / 注意事项

- `chrome://` 之类的浏览器内部页面无法注入脚本。Chrome internal pages such as `chrome://` cannot be scripted.
- 插件按需申请站点权限，只在解析选中页面时请求对应 origin。The extension requests origin access on demand, only when you parse a selected site.
- 部分跨域 iframe 仍可能因为 Chrome 限制而被标记为跳过或失败。Some cross-origin iframes may still be marked as skipped or failed because Chrome can restrict frame injection even when the page itself is scriptable.
- 默认导出的是压缩后的 AI 友好结构，不会携带完整样式表源码。The collector stores compact AI-friendly structure and style summaries, not full stylesheet source.
- 结果里会对部分敏感属性做过滤，并去掉 `href` / `src` 中的 query 与 hash。Sensitive attributes are filtered, and exported `href` / `src` values have query strings and hashes removed.
