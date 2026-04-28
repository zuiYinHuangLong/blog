#!/bin/bash

# 数据库迁移脚本
# 用法: ./migrate-database.sh

set -e

# 配置变量
SERVER_USER="ubuntu"
SERVER_HOST="zqytg.online"
SERVER_PORT="22"
DB_NAME="blog"
DB_USER="blog"
DB_PASSWORD="zhttty01"  # 数据库密码

echo "========================================="
echo "  数据库迁移工具"
echo "  本地 → zqytg.online"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查本地备份文件
BACKUP_FILE="blog_database_backup.sql"
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}📦 正在导出本地数据库...${NC}"
    mysqldump -u root $DB_NAME > $BACKUP_FILE
    echo -e "${GREEN}✅ 数据库导出完成: $BACKUP_FILE${NC}"
else
    echo -e "${GREEN}✅ 找到现有备份文件: $BACKUP_FILE${NC}"
fi

# 检查文件大小
FILE_SIZE=$(ls -lh $BACKUP_FILE | awk '{print $5}')
echo "   文件大小: $FILE_SIZE"
echo ""

# 2. 上传到服务器
echo -e "${YELLOW}📤 上传数据库备份到服务器...${NC}"
scp $BACKUP_FILE ${SERVER_USER}@${SERVER_HOST}:/tmp/
echo -e "${GREEN}✅ 上传完成${NC}"
echo ""

# 3. 在服务器上导入
echo -e "${YELLOW}📥 在服务器上导入数据库...${NC}"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
# 检查 MySQL 是否运行
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL 服务未运行，正在启动..."
    sudo systemctl start mysql
    sleep 2
fi

# 创建数据库（如果不存在）
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 创建数据库用户（如果不存在）
sudo mysql -u root -e "CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -u root -e "GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'localhost';"
sudo mysql -u root -e "FLUSH PRIVILEGES;"

# 导入数据库
echo "正在导入数据..."
sudo mysql -u root blog < /tmp/blog_database_backup.sql

# 清理临时文件
rm /tmp/blog_database_backup.sql

# 验证导入
TABLE_COUNT=$(sudo mysql -u root blog -e "SHOW TABLES;" | wc -l)
echo "✅ 数据库导入完成"
echo "   导入的表数量: $((TABLE_COUNT - 1))"
ENDSSH

echo ""
echo "========================================="
echo -e "${GREEN}✅ 数据库迁移完成！${NC}"
echo "========================================="
echo ""
echo "📋 验证数据："
echo "   SSH 登录服务器: ssh ${SERVER_USER}@${SERVER_HOST}"
echo "   查看表: sudo mysql -u root blog -e 'SHOW TABLES;'"
echo "   查看数据: sudo mysql -u root blog -e 'SELECT COUNT(*) FROM articles;'"
echo ""
