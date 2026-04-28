#!/bin/bash

# 一键部署脚本 - 首次部署使用
# 用法: ./quick-deploy.sh

set -e

echo "========================================="
echo "  博客系统一键部署工具"
echo "  域名: zqytg.online"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置
SERVER_USER="ubuntu"
SERVER_HOST="zqytg.online"
DEPLOY_PATH="/var/www/blog"

# 检查 SSH 连接
echo -e "${YELLOW}📡 检查服务器连接...${NC}"
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'connected'" > /dev/null 2>&1; then
    echo -e "${RED}❌ 无法连接到服务器${NC}"
    echo "请检查："
    echo "1. 服务器地址是否正确: ${SERVER_HOST}"
    echo "2. SSH 密钥是否配置"
    echo "3. 服务器防火墙设置"
    exit 1
fi
echo -e "${GREEN}✅ 服务器连接正常${NC}"
echo ""

# 1. 初始化服务器环境
echo -e "${YELLOW}🔧 步骤 1: 初始化服务器环境${NC}"
echo "这将安装 Nginx、MySQL 等必要软件..."
read -p "是否继续？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    scp setup-server.sh ${SERVER_USER}@${SERVER_HOST}:/tmp/
    ssh ${SERVER_USER}@${SERVER_HOST} "sudo bash /tmp/setup-server.sh"
    echo -e "${GREEN}✅ 服务器环境初始化完成${NC}"
else
    echo "跳过服务器初始化"
fi
echo ""

# 2. 配置 Nginx
echo -e "${YELLOW}🌐 步骤 2: 配置 Nginx${NC}"
scp nginx.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/blog-nginx.conf
ssh ${SERVER_USER}@${SERVER_HOST} "sudo cp /tmp/blog-nginx.conf /etc/nginx/sites-available/blog && sudo ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog && sudo nginx -t && sudo systemctl reload nginx"
echo -e "${GREEN}✅ Nginx 配置完成${NC}"
echo ""

# 3. 配置 Systemd 服务
echo -e "${YELLOW}⚙️  步骤 3: 配置后端服务${NC}"
scp blog-server.service ${SERVER_USER}@${SERVER_HOST}:/tmp/blog-server.service
ssh ${SERVER_USER}@${SERVER_HOST} "sudo cp /tmp/blog-server.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable blog-server"
echo -e "${GREEN}✅ Systemd 服务配置完成${NC}"
echo ""

# 4. 构建并部署前端
echo -e "${YELLOW}📦 步骤 4: 构建并部署前端${NC}"
echo "开始构建前端项目..."

cd webSource
pnpm install --frozen-lockfile
pnpm build:shared
pnpm build:admin
pnpm build:blog
cd ..

echo "上传到服务器..."
scp -r web/admin/* ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/web/admin/
scp -r web/blog/* ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/web/blog/

echo -e "${GREEN}✅ 前端部署完成${NC}"
echo ""

# 5. 首次部署后端
echo -e "${YELLOW}🚀 步骤 5: 部署后端服务${NC}"
echo "请在本地构建后端并上传："
echo "  cd server"
echo "  GOOS=linux GOARCH=amd64 go build -o blog-server ."
echo "  scp blog-server ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/server/"
echo ""
read -p "是否现在构建并上传后端？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd server
    echo "构建后端..."
    GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o blog-server .
    echo "上传到服务器..."
    scp blog-server ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/server/
    cd ..
    
    echo "启动后端服务..."
    ssh ${SERVER_USER}@${SERVER_HOST} "sudo systemctl start blog-server && sleep 3 && sudo systemctl status blog-server --no-pager"
    
    echo -e "${GREEN}✅ 后端部署完成${NC}"
fi
echo ""

# 6. 验证部署
echo "========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "========================================="
echo ""
echo "📍 访问地址："
echo "   博客前台: http://${SERVER_HOST}"
echo "   后台管理: http://${SERVER_HOST}/admin"
echo "   API 接口: http://${SERVER_HOST}/api/v1"
echo ""
echo "📋 后续操作："
echo "   1. 配置 GitHub Secrets 启用 CI/CD 自动部署"
echo "   2. 配置 HTTPS 证书 (certbot)"
echo "   3. 修改数据库密码和 JWT secret"
echo "   4. 查看部署文档: DEPLOY.md"
echo ""
