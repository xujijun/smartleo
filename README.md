# SmartLeo

一个面向儿童启蒙学习场景的移动端 PWA 应用，基于 `Vue 3 + Vite + Vant + TypeScript` 开发，支持 GitHub Pages 部署，并可在支持的浏览器中添加到主屏幕。

线上访问地址：

- <https://xujijun.github.io/smartleo>

## 功能特性

- 首页聚合学习入口
- 英文字母学习
- 简单汉字学习
- PWA 支持，可添加到主屏幕
- GitHub Actions 自动部署到 GitHub Pages

## 技术栈

- Vue 3
- Vite
- TypeScript
- Vue Router
- Vant
- vite-plugin-pwa

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 项目结构

```text
smartleo/
├─ public/
│  ├─ icons/
│  └─ 404.html
├─ src/
│  ├─ components/
│  ├─ data/
│  ├─ router/
│  └─ views/
├─ .github/workflows/
├─ PRD.md
├─ package.json
└─ vite.config.ts
```

## 路由说明

- `/`：首页
- `/letters`：英文字母学习
- `/hanzi`：简单汉字学习

## PWA 说明

项目已配置：

- `manifest`
- `service worker`
- GitHub Pages 下的 SPA 刷新兜底

在支持的移动端浏览器中打开站点后，可通过浏览器菜单选择“添加到主屏幕”。

## GitHub Pages 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages。

工作流文件：

- `.github/workflows/deploy.yml`

触发方式：

- 推送到 `main` 分支时自动触发
- 也支持手动触发 `workflow_dispatch`

## 部署前检查

- 仓库名为 `smartleo`
- GitHub Pages 已启用
- 仓库 Actions 与 Pages 权限正常
- 默认分支为 `main`

## 后续可扩展方向

- 增加字母发音和汉字读音
- 增加互动练习和学习进度
- 增加更多启蒙模块，如数字、颜色、动物
