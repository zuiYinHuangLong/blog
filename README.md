# Blog Platform

一个前后端分离的个人博客系统，包含博客前台展示与后台管理两大模块，支持文章管理、分类标签、媒体资源、角色权限、二维码管理等完整功能。

## 技术栈

### 后端 (server/)

| 技术                                                    | 说明                                     |
| ------------------------------------------------------- | ---------------------------------------- |
| Go 1.22                                                 | 开发语言                                 |
| [Gin](https://github.com/gin-gonic/gin)                 | HTTP Web 框架                            |
| [GORM](https://gorm.io/) + MySQL                        | ORM 与数据库                             |
| [Viper](https://github.com/spf13/viper)                 | 配置管理                                 |
| [golang-jwt](https://github.com/golang-jwt/jwt)         | JWT 鉴权（Access Token + Refresh Token） |
| [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt) | 密码哈希                                 |
| RSA 加密                                                | 登录密码加密传输                         |

### 前端 (webSource/)

| 技术                                                         | 说明                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| React 18 + TypeScript                                        | 核心框架与类型系统                   |
| [Vite 6](https://vitejs.dev/)                                | 构建工具                             |
| [Arco Design React](https://arco.design/)                    | 后台 UI 组件库                       |
| [Tailwind CSS 4](https://tailwindcss.com/)                   | 原子化 CSS 框架                      |
| [React Router v6](https://reactrouter.com/)                  | 路由管理                             |
| [Zustand](https://zustand.docs.pmnd.rs/)                     | 轻量状态管理                         |
| [pnpm workspace](https://pnpm.io/workspaces)                 | Monorepo 包管理                      |
| [axios](https://axios-http.com/)                             | HTTP 请求（拦截器处理 Token 与 401） |
| [dayjs](https://day.js.org/)                                 | 日期处理                             |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown 渲染（博客前台）            |

## 项目结构

```
blog/
├── server/                    # Go 后端
│   ├── config/                # 配置（Viper + YAML）
│   ├── internal/
│   │   ├── dto/               # 数据传输对象
│   │   ├── handler/           # 路由处理器
│   │   ├── middleware/        # 中间件（认证、CORS、RBAC 权限）
│   │   ├── model/             # 数据模型
│   │   ├── pkg/               # 工具包（JWT、RSA、响应、上传）
│   │   ├── repository/        # 数据访问层
│   │   └── service/           # 业务逻辑层
│   ├── migration/             # 数据库迁移与种子数据
│   ├── router/                # 路由定义
│   └── main.go                # 入口
├── web/                       # 构建产物（部署目录）
├── webSource/                 # 前端源码
│   ├── apps/
│   │   ├── admin/             # 后台管理应用
│   │   └── blog/              # 博客前台应用
│   └── packages/
│       └── shared/            # 共享包（类型、工具、请求封装）
└── README.md
```

## 功能模块

### 博客前台

- 文章列表展示与分页
- 文章详情（Markdown 渲染、代码高亮）
- 全文搜索
- 分类 / 标签导航
- 响应式布局

### 后台管理

- **仪表板** — 文章数、分类数、标签数、用户数统计
- **文章管理** — 新建 / 编辑 / 删除文章，支持 Markdown 编辑、草稿 / 发布状态切换
- **分类管理** — 多层分类树形管理
- **标签管理** — 标签 CRUD
- **媒体库** — 图片上传与管理，支持 jpeg/png/gif/webp
- **二维码管理** — 生成、审批、发布流程
- **角色权限** — 基于 RBAC 的角色与权限分配（模块 + 操作粒度）
- **用户管理** — 用户的增删改查与角色分配
- **系统设置** — 站点名称、描述、Logo 等公共配置

### 安全机制

- **RSA 加密登录**：前端使用公钥加密密码，后端使用私钥解密
- **JWT 双 Token**：Access Token（2 小时）+ Refresh Token（7 天）
- **RBAC 权限控制**：接口级别权限校验（角色 → 权限 → 模块·操作）
- **XSS 防护**：博客前台使用 DOMPurify 清理用户内容
- **验证码**：登录接口支持图形验证码

## 快速开始

### 环境要求

- Go 1.22+
- Node.js 18+（推荐 20+）
- pnpm 9+
- MySQL 8.0+

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd blog
```

### 2. 后端配置

编辑 `server/config/config.yaml`：

```yaml
server:
  port: 8080
  mode: debug          # debug / release

database:
  host: 127.0.0.1
  port: 3306
  user: root
  password: 'your-password'
  name: blog
  charset: utf8mb4

jwt:
  secret: change-this-to-a-random-secret
  expire: 7200
  refresh_expire: 604800
```

确保 MySQL 中已创建 `blog` 数据库，启动时 GORM AutoMigrate 会自动建表并写入种子数据。

### 3. 启动后端

```bash
cd server
go run main.go
```

服务默认运行在 `http://localhost:8080`。

### 4. 前端配置

```bash
cd webSource

# 安装依赖
pnpm install
```

前端 API 基础地址和 RSA 公钥请求地址在 `packages/shared/src/utils/constants.ts` 中配置。

### 5. 启动前端开发服务器

```bash
# 仅启动后台管理
pnpm dev:admin

# 仅启动博客前台
pnpm dev:blog

# 同时启动两个前端应用
pnpm dev:frontend
```

### 6. 构建部署

```bash
pnpm build
```

构建产物输出到 `web/` 目录，包括后台管理、博客前台、后端可执行文件及配置文件。

默认管理员账号在 `migration/migrate.go` 的种子数据中定义。

## API 概览

| 模块       | 公开接口                    | 认证接口             |
| ---------- | --------------------------- | -------------------- |
| Auth       | 公钥获取、验证码、登录      | 个人信息、修改密码   |
| Articles   | 文章列表/搜索/详情(按 slug) | CRUD、状态管理       |
| Categories | 列表                        | 创建、修改、删除     |
| Tags       | 列表                        | 创建、修改、删除     |
| Media      | —                           | 上传、列表、删除     |
| QR Codes   | —                           | 列表、创建、审批流程 |
| Roles      | —                           | CRUD、权限列表       |
| Users      | —                           | CRUD                 |
| Settings   | 公开设置                    | 全量读写             |
| Dashboard  | —                           | 统计概览             |

> 所有认证接口需在 Header 中携带 `Authorization: Bearer <access_token>`。

## 国际化

后台管理支持中英文切换（zh-CN / en-US），使用 `react-intl` 风格定义语言包，存放在 `apps/admin/src/locales/`。

## CI/CD 与部署

### 自动化部署架构

- **后端**：GitHub Actions 自动构建和部署（仅 `server/` 目录变更时触发）
- **前端**：本地构建后通过脚本直接上传
- **域名**：zqytg.online

### 快速部署

```bash
# 后端：推送到 main 分支自动部署
git push origin main

# 前端：运行部署脚本
./deploy-frontend.sh
```

详细部署步骤请查看 [DEPLOY.md](DEPLOY.md)。
