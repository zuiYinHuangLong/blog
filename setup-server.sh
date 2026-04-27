#!/bin/bash

# 服务器环境初始化脚本
# 在服务器上执行: sudo bash setup-server.sh

set -e

echo "🚀 开始初始化服务器环境..."

# 1. 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 2. 安装 Nginx
echo "🌐 安装 Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 3. 安装 MySQL
echo "🗄️ 安装 MySQL..."
apt install -y mysql-server
systemctl enable mysql
systemctl start mysql

# 4. 配置 MySQL 安全设置（可选）
echo "🔒 配置 MySQL 安全..."
mysql_secure_installation <<EOF

y
y
y
y
EOF

# 5. 创建博客数据库
echo "📊 创建数据库..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED BY 'your_secure_password';"
mysql -u root -e "GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "⚠️ 请修改 server/config/config.yaml 中的数据库密码！"

# 6. 创建部署目录
echo "📁 创建部署目录..."
mkdir -p /var/www/blog/web/admin
mkdir -p /var/www/blog/web/blog
mkdir -p /var/www/blog/server
mkdir -p /var/www/blog/uploads

# 7. 设置目录权限
echo "🔐 设置目录权限..."
chown -R www-data:www-data /var/www/blog
chmod -R 755 /var/www/blog

# 8. 配置防火墙（如果使用 UFW）
echo "🛡️ 配置防火墙..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

echo ""
echo "✅ 服务器环境初始化完成！"
echo ""
echo "📋 后续步骤："
echo "1. 修改 server/config/config.yaml 中的数据库配置"
echo "2. 将 nginx.conf 复制到 /etc/nginx/sites-available/blog"
echo "3. 启用 Nginx 站点: ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/"
echo "4. 重启 Nginx: systemctl reload nginx"
echo "5. 上传 blog-server 到 /var/www/blog/server/"
echo "6. 使用 blog-server.service 配置 systemd 服务"
echo "7. 启动后端服务: systemctl start blog-server"
echo ""
