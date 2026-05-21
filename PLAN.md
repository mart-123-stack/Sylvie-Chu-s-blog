# Blog 发展路线图

## 当前架构

```
Frontend (Vercel Serverless) → Neon PostgreSQL
           ↕
   本地 JSON 文件 (回退/持久化)
```

## 当前状态（2026-05-21）

### 部署
- 线上地址: https://blog-pied-alpha-14.vercel.app
- 数据库: Neon PostgreSQL（免费 1GB，无服务器绑定）
- CI/CD: 手动 `vercel --prod` 部署（GitHub Actions 已配置但未启用）

### 已完成功能

| 功能 | 状态 |
|------|------|
| 文章 CRUD | ✅ |
| 个人介绍/经历 | ✅ |
| 照片墙管理 | ✅ |
| 评论区（支持回复 + 用户关联） | ✅ |
| 点赞/取消点赞 | ✅ |
| 收藏/取消收藏 | ✅ |
| 用户注册/登录（JWT） | ✅ |
| Profile 个人中心 | ✅ |
| 共享导航栏（登录状态感知） | ✅ |
| Docker 容器化 | ✅ |
| 自定义域名 | ⏳（未购买） |

---

## Phase 1 — 容器化 + CI/CD（脱离 Vercel 依赖）✅

目标：项目可一键部署到任意服务器，不再绑定 Vercel。

### 1.1 Docker 化 ✅

```
blog/
├── Dockerfile              # Next.js 多阶段构建 (node:20-alpine)
├── docker-compose.yml      # app + PostgreSQL 15
├── .dockerignore
└── migrations/init.sql     # 数据库初始化脚本
```

- `Dockerfile`: Node.js 20, Next.js standalone output, 多阶段构建
- `docker-compose.yml`: 两个服务
  - `app`: Next.js 容器，暴露 3000 端口
  - `db`: PostgreSQL 15 + 初始化 schema（替代 Supabase）
- 数据库连接: `DATABASE_URL` 环境变量，带 healthcheck 确保 app 在 db 就绪后启动
- 本地一键启动: `docker compose up -d`

### 1.2 数据库迁移 ✅

- Supabase 已替换为自托管 PostgreSQL
- `src/lib/supabase.ts` → 废弃，改为 `src/lib/db.ts`（基于 `pg` 连接池）
- `src/lib/posts.ts` — 改用 pg 查询，保留 JSON 文件回退
- `src/lib/config.ts` — 改用 pg 查询，保留 JSON 文件回退
- `src/app/api/comments/route.ts` — 改用 pg + JSON 双写
- 本地数据目录 `data/` 作为离线回退层

### 1.3 CI/CD（GitHub Actions）✅

```yaml
.github/workflows/
├── ci.yml        # push/PR → lint + tsc + build
├── deploy.yml    # push main → build 镜像 → push Docker Hub → SSH 部署
```

流程：
1. git push → GitHub Actions 触发 CI
2. 自动运行 lint、TypeScript 检查、build
3. 合并到 main 后构建 Docker 镜像，推送到 Docker Hub
4. SSH 登录服务器拉取镜像重启容器

### 1.4 服务器部署

- 推荐：阿里云 ECS（2C4G）或腾讯云轻量服务器
- 安装 Docker + Docker Compose
- 配置域名 DNS + Nginx SSL（Let's Encrypt）
- 一条命令部署：

```bash
docker compose pull && docker compose up -d
```

### 🔧 需要手动配置的 GitHub Secrets

| Secret | 说明 |
|--------|------|
| `DOCKER_USERNAME` | Docker Hub 用户名 |
| `DOCKER_PASSWORD` | Docker Hub 密码或 Access Token |
| `SSH_HOST` | 服务器 IP |
| `SSH_USER` | SSH 用户名 |
| `SSH_KEY` | SSH 私钥 |

---

## Phase 2 — 用户体系 ✅

目标：从「只有博主一个人能用」变成「注册用户可互动」。

### 已完成

**数据库新增表**（需先有 PostgreSQL 实例）：

```sql
-- migrations/002-phase2-auth.sql
CREATE TABLE users (id UUID, email TEXT UNIQUE, password_hash TEXT, nickname TEXT, ...);
-- comments 表增加 user_id + parent_id（支持回复）
-- likes / favorites 表（UNIQUE post_slug + user_id）
```

**后端 API**

| 端点 | 状态 |
|------|------|
| `POST /api/auth/register` | ✅ |
| `POST /api/auth/login` | ✅（支持用户+管理员双模式） |
| `GET /api/comments?post_slug=` | ✅（支持 user 关联） |
| `POST /api/comments` | ✅（支持登录用户 + 回复） |
| `DELETE /api/comments/:id` | ✅（仅删除自己的） |
| `GET /api/likes?post_slug=` | ✅ |
| `POST /api/likes` | ✅（点赞/取消点赞） |
| `POST /api/favorites` | ✅（收藏/取消收藏） |
| `GET /api/favorites` | ✅（获取个人收藏列表） |

**前端页面**

| 页面 | 状态 |
|------|------|
| `/login` — 登录页（支持用户+管理员） | ✅ |
| `/register` — 注册页 | ✅ |
| `/profile` — 个人中心（我的收藏） | ✅ |
| 文章页 — 点赞按钮 + 收藏按钮 | ✅ |
| 评论区 — 回复功能 + 登录用户标识 | ✅ |

**技术选型**

- JWT: `jose` 库（Edge Runtime 兼容）
- 前端 AuthContext: 全局认证状态管理
- 密码: SHA256 哈希（上线前应升级为 bcrypt）
- 评论: PostgreSQL 主存 + JSON 文件回退

---

## Phase 3 — 内容体验升级

目标：达到 Hexo 级别的内容编辑和展示体验。

### 3.1 Markdown 编辑器

- 安装 `react-markdown` + `remark-gfm` + `rehype-highlight`
- 编辑后台的 `<textarea>` 替换为 Markdown 编辑器（等宽字体 + 预览分栏）
- 文章详情页渲染 Markdown 内容
- 代码语法高亮（支持 JS/TS/Python/Go 等常见语言）

### 3.2 标签 + 搜索

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

- 新增文章时可选标签
- `/blog?tag=xxx` 按标签筛选
- 全局搜索框：`GET /api/posts/search?q=xxx`（PostgreSQL `ILIKE` 或 `tsvector`）

### 3.3 分页

- 博客列表改为分页：`GET /api/posts?page=1&limit=10`
- 前端加「加载更多」或页码导航

---

## Phase 4 — 体验打磨

| 功能 | 说明 |
|------|------|
| SEO | sitemap.xml, robots.txt, Open Graph 标签, JSON-LD 结构化数据 |
| RSS | `/feed.xml` 输出 Atom/RSS |
| 阅读时间 | 根据字数估算 "X min read" |
| 目录导航 | 长文章右侧锚点目录 |
| 明暗切换 | 加手动 toggle，保存偏好到 localStorage |
| 社交分享 | 文章底部一键分享到 Twitter/X |
| 浏览量 | 简单 PV 计数，无需第三方 |
| 图片上传 | 支持文章内上传图片（阿里云 OSS / 本地文件） |

---

## 技术选型汇总

| 模块 | 当前 | 目标 |
|------|------|------|
| 部署平台 | Vercel Serverless | 自建服务器 Docker |
| 数据库 | Supabase Cloud | 自托管 PostgreSQL |
| 认证 | Admin 密码 | JWT + 用户注册登录 |
| 文章编辑 | 纯文本 textarea | Markdown + 实时预览 |
| 评论 | 假数据 | 真实评论 + 回复 + 点赞 |
| 前端框架 | Next.js 14 App | Next.js 14 App（不变） |
| CSS | Tailwind 3 | Tailwind 3（不变） |
| CI/CD | 手动 `vercel deploy` | GitHub Actions 自动构建部署 |

---

## 推荐执行顺序

```
Phase 1 (容器化 + CI/CD)
    ↓
Phase 2 (用户体系 + 评论/点赞/收藏)
    ↓
Phase 3 (Markdown + 标签 + 搜索)
    ↓
Phase 4 (SEO + RSS + 体验打磨)
```

**Phase 1 是所有后续工作的前置条件**——必须先容器化，才能脱离 Vercel 在自有服务器上跑完整的后端逻辑（用户鉴权、文件上传等）。
