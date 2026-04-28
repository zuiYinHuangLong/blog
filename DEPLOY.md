# 部署指南

## 架构说明

- **后端**：使用 GitHub Actions CI/CD 自动构建和部署
- **前端**：本地构建后直接上传到服务器
- **域名**：zqytg.online
- **部署路径**：`/var/www/blog`

## 一、服务器环境初始化

### 1. 上传并执行初始化脚本

```bash
scp setup-server.sh ubuntu@zqytg.online:/tmp/
ssh ubuntu@zqytg.online "sudo bash /tmp/setup-server.sh"
```

### 2. 配置 Nginx

在服务器上执行：

```bash
# 上传 nginx 配置
scp nginx.conf ubuntu@zqytg.online:/tmp/blog-nginx.conf
ssh ubuntu@zqytg.online "sudo cp /tmp/blog-nginx.conf /etc/nginx/sites-available/blog && sudo ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog && sudo nginx -t && sudo systemctl reload nginx"
```

### 3. 配置 Systemd 服务

在服务器上执行：

```bash
# 上传服务文件
scp blog-server.service ubuntu@zqytg.online:/tmp/blog-server.service
ssh ubuntu@zqytg.online "sudo cp /tmp/blog-server.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable blog-server && sudo systemctl start blog-server"
```

## 二、配置 GitHub Secrets

进入你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**，添加以下密钥：

| 密钥名称          | 值                                       | 说明             |
| ----------------- | ---------------------------------------- | ---------------- |
| `SERVER_HOST`     | `zqytg.online`                           | 服务器地址       |
| `SERVER_USER`     | `ubuntu`                                 | SSH 用户名       |
| `SERVER_PORT`     | `22`                                     | SSH 端口（可选） |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | SSH 私钥         |
| `DEPLOY_PATH`     | `/var/www/blog`                          | 部署路径         |

### 生成 SSH 密钥对

```bash
# 在本地生成
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub ubuntu@zqytg.online

# 查看私钥（复制到 GitHub Secrets）
cat ~/.ssh/github_actions
```

## 三、配置后端

### 1. 修改配置文件

编辑 `server/config/config.yaml`：

```yaml
server:
  port: 8080
  mode: release  # 生产环境改为 release

database:
  host: 127.0.0.1
  port: 3306
  user: blog  # 使用刚创建的数据库用户
  password: 'your_secure_password'  # 修改为实际密码
  name: blog
  charset: utf8mb4

jwt:
  secret: your-random-secret-key-change-in-production  # 修改为随机字符串
  expire: 7200
  refresh_expire: 604800

upload:
  path: /var/www/blog/uploads  # 修改为服务器路径
  max_size: 10485760
  allowed_types:
    - image/jpeg
    - image/png
    - image/gif
    - image/webp

blog:
  base_url: https://zqytg.online  # 修改为你的域名
```

### 2. 提交并推送代码

```bash
git add server/config/config.yaml
git commit -m "update server config for production"
git push origin main
```

GitHub Actions 会自动构建并部署后端。

## 四、部署前端

### 方法 1：使用部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy-frontend.sh

# 运行部署脚本
./deploy-frontend.sh
```

### 方法 2：手动部署

```bash
# 1. 构建前端
cd webSource
pnpm install
pnpm build:shared
pnpm build:admin
pnpm build:blog
cd ..

# 2. 上传到服务器
scp -r web/admin/* ubuntu@zqytg.online:/var/www/blog/web/admin/
scp -r web/blog/* ubuntu@zqytg.online:/var/www/blog/web/blog/
```

## 五、配置前端 API 地址

编辑 `webSource/packages/shared/src/utils/constants.ts`：

```typescript
export const API_BASE_URL = 'https://zqytg.online/api/v1'
```

修改后需要重新构建并部署前端。

## 六、配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 在服务器上安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取并配置证书
sudo certbot --nginx -d zqytg.online -d www.zqytg.online

# 自动续期
sudo certbot renew --dry-run
```

## 七、验证部署

### 1. 检查后端服务

```bash
# 查看服务状态
systemctl status blog-server

# 查看日志
journalctl -u blog-server -f

# 测试 API
curl http://127.0.0.1:8080/api/v1/settings/public
```

### 2. 检查 Nginx

```bash
# 查看 Nginx 状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. 访问网站

- 博客前台：http://zqytg.online
- 后台管理：http://zqytg.online/admin
- API 接口：http://zqytg.online/api/v1

## 八、日常维护

### 后端更新

```bash
git push origin main  # 自动触发 CI/CD 部署
```

### 前端更新

```bash
./deploy-frontend.sh  # 手动运行部署脚本
```

### 查看日志

```bash
# 后端日志
journalctl -u blog-server -f

# Nginx 日志
tail -f /var/log/nginx/access.log
```

### 重启服务

```bash
# 重启后端
systemctl restart blog-server

# 重启 Nginx
systemctl reload nginx
```

## 目录结构

```
/var/www/blog/
├── web/
│   ├── admin/          # 后台管理静态文件
│   ├── blog/           # 博客前台静态文件
│   └── server/
│       ├── blog-server # 后端可执行文件
│       └── config.yaml # 后端配置
├── uploads/            # 上传文件目录
└── blog-server.log     # 后端日志
```

## 常见问题

### 1. 后端服务启动失败

```bash
# 查看日志
journalctl -u blog-server -n 50

# 检查端口占用
lsof -i :8080

# 检查数据库连接
mysql -u blog -p -h 127.0.0.1 blog
```

### 2. Nginx 502 错误

- 确认后端服务正在运行：`systemctl status blog-server`
- 检查后端是否监听 8080 端口

### 3. 前端页面空白

- 检查浏览器控制台是否有 API 请求错误
- 确认 `constants.ts` 中的 API 地址正确
- 检查 Nginx 配置是否正确

### 4. 文件上传失败

- 检查 uploads 目录权限：`chown -R www-data:www-data /var/www/blog/uploads`
- 检查磁盘空间：`df -h`
