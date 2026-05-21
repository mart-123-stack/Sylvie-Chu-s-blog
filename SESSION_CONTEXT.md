# Session Context — 2026-05-21

## 项目状态

个人博客，Next.js 14 App Router + Tailwind CSS + Neon PostgreSQL。
部署在 Vercel，数据库用 Neon（免费 1GB）。

## 本日完成

### Phase 1 — Docker + CI/CD ✅
- Dockerfile（多阶段构建）、docker-compose.yml、.dockerignore
- `migrations/init.sql` 数据库初始化
- 代码从 Supabase 迁移到 `pg` 连接池
- GitHub Actions CI/CD 配置

### Phase 2 — 用户体系 ✅
- JWT 注册/登录（`jose` 库）
- 点赞/收藏 API
- 评论回复（parent_id 支持）
- 前端页面：`/login`、`/register`、`/profile`
- LikeFavoriteBar 组件 + 文章详情页集成
- 共享 SiteHeader 导航栏（登录状态感知，未显示 Login，已登录显示 Profile/Admin）

### 数据库
- Neon PostgreSQL：`postgresql://neondb_owner:npg_8Myh2pmKaQYs@ep-ancient-frog-ap9p4urw.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require`
- 7 张表：posts, about_config, photos, comments, users, likes, favorites

### 修复的 Bug
1. **登录 API 路由优先级** — `if (password)` 在 `if (email)` 之前，导致用户登录永远走 admin 分支。已修复为先判断 email。
2. **Profile 页空白** — AuthContext 初始化时 token 为 null，页面立即 redirect。已增加 `authLoaded` 状态。
3. **评论区内容不显示** — 增加 `comment.content || ''` 安全渲染。

## 待做

- **Phase 3**: Markdown 编辑器（react-markdown + code highlight）
- **Phase 3**: 标签系统 + 搜索
- **Phase 3**: 分页
- **Phase 4**: SEO / RSS / 明暗切换 / 图片上传
- 自定义域名（暂不购买）

## 部署命令

```bash
cd ~/Documents/项目/blog && vercel --prod
```

## 关键文件索引

| 文件 | 说明 |
|------|------|
| `src/lib/db.ts` | PostgreSQL 连接池 |
| `src/lib/posts.ts` | 文章 CRUD（pg + JSON 回退） |
| `src/lib/config.ts` | 配置/照片 CRUD（pg + JSON 回退） |
| `src/lib/auth.ts` | JWT sign/verify + 注册登录逻辑 |
| `src/lib/auth-context.tsx` | 前端全局认证状态 |
| `src/components/SiteHeader.tsx` | 共享导航栏（登录状态感知） |
| `src/components/CommentSection.tsx` | 评论区（支持回复） |
| `src/components/LikeFavoriteBar.tsx` | 点赞/收藏按钮 |
| `src/app/api/auth/login/route.ts` | 登录 API（管理员 + 用户双模式） |
| `src/app/api/auth/register/route.ts` | 注册 API |
| `src/app/api/likes/route.ts` | 点赞 API |
| `src/app/api/favorites/route.ts` | 收藏 API |
| `migrations/init.sql` | Phase 1 数据库初始化 |
| `migrations/002-phase2-auth.sql` | Phase 2 新增表 |
