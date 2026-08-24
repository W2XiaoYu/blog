# CongWong 的笔记

基于 VitePress 的个人技术笔记站点，支持 GitHub Pages 和 Vercel 部署。

## 常用命令

```sh
pnpm install
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

## 目录约定

- `src/`：所有 Markdown 文章；一级文件是栏目首页，子目录存放栏目文章。
- `src/public/`：不经构建处理的静态资源；引用路径从网站根目录开始。
- `.vitepress/config.mts`：站点基础设置、主题设置和构建配置。
- `.vitepress/navigation.ts`：顶部导航与侧边栏共享的文章链接清单。新增文章后，在这里补充入口。
- `.vitepress/theme/`：Vue 主题组件和样式。
- `.github/workflows/deploy.yml`：GitHub Pages 的构建与部署工作流。

`.vitepress/cache/` 和 `.vitepress/dist/` 是本地生成目录，均不提交；删除后可分别由开发服务器和构建命令自动再生。

## 发布

- 推送到 `main`：GitHub Actions 构建并发布到 GitHub Pages。
- Vercel：使用 `vercel.json` 中的 `pnpm run docs:build`，发布 `.vitepress/dist`。
