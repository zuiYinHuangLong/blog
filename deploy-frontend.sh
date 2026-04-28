#!/bin/bash

# 前端部署脚本
# 用法: ./deploy-frontend.sh

set -e

# 配置变量
SERVER_USER="ubuntu"
SERVER_HOST="zqytg.online"
SERVER_PORT="22"
DEPLOY_PATH="/var/www/blog"

echo "🚀 开始部署前端..."

# 1. 构建前端
echo "📦 构建前端项目..."
cd webSource
pnpm install --frozen-lockfile
pnpm build:shared
pnpm build:admin
pnpm build:blog
cd ..

echo "✅ 前端构建完成"

# 2. 上传到服务器
echo "📤 上传到服务器..."

# 上传后台管理
scp -r web/admin/* ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/web/admin/

# 上传博客前台
scp -r web/blog/* ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/web/blog/

echo "✅ 前端部署完成"
echo "🌐 博客前台: http://zqytg.online"
echo "🔧 后台管理: http://zqytg.online/admin"
