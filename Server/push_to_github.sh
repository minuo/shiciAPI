#!/bin/bash

# 推送到GitHub仓库脚本
echo "=== 推送代码到GitHub仓库 ==="
echo ""

# 检查是否已配置远程仓库
echo "检查远程仓库配置..."
remote_url=$(git remote get-url origin 2>/dev/null)

if [ -z "$remote_url" ]; then
    echo "错误: 未配置远程仓库！"
    echo "请先运行 './setup_remote.sh' 配置GitHub仓库地址"
    exit 1
fi

echo "已配置的远程仓库: $remote_url"
echo ""

# 检查是否有未提交的更改
echo "检查未提交的更改..."
if ! git diff-index --quiet HEAD --; then
    echo "检测到未提交的更改！"
    read -p "是否要先提交这些更改？(y/n): " commit_changes
    
    if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
        # 添加所有更改
        git add .
        
        # 提示输入提交信息
        read -p "请输入提交信息: " commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="更新代码"
        fi
        
        # 提交更改
        git commit -m "$commit_message"
        echo "已提交更改"
    fi
fi

echo ""

# 推送代码到GitHub
echo "正在推送到GitHub..."
echo "执行命令: git push -u origin main"
echo ""

# 执行推送
git push -u origin main

# 检查推送是否成功
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo "您可以在以下地址查看您的仓库:"
    echo "$remote_url"
    echo ""
    echo "建议: 推送成功后，在GitHub上配置Secrets以启用自动化部署"
else
    echo ""
    echo "❌ 推送失败！"
    echo "常见解决方法:"
    echo "1. 检查您的网络连接"
    echo "2. 确认您有仓库的访问权限"
    echo "3. 如果使用HTTPS，可能需要输入GitHub账号密码或使用个人访问令牌"
    echo "4. 或者考虑配置SSH密钥以避免每次输入密码"
fi