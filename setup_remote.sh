#!/bin/bash

# 设置GitHub远程仓库脚本
echo "=== 配置GitHub远程仓库地址 ==="
echo ""

# 提示用户输入GitHub仓库URL
echo "请输入您在GitHub上创建的仓库URL："
echo "示例: https://github.com/your-username/shiciAPI.git"
read -p "仓库URL: " GITHUB_URL

# 验证输入是否为空
if [ -z "$GITHUB_URL" ]; then
    echo "错误: 仓库URL不能为空"
    exit 1
fi

# 检查是否已经有origin远程仓库
existing_remote=$(git remote get-url origin 2>/dev/null || echo "")

if [ ! -z "$existing_remote" ]; then
    echo "检测到已存在的远程仓库: $existing_remote"
    read -p "是否要替换现有远程仓库？(y/n): " replace_remote
    
    if [ "$replace_remote" = "y" ] || [ "$replace_remote" = "Y" ]; then
        git remote set-url origin "$GITHUB_URL"
        echo "已更新远程仓库地址"
    else
        echo "已取消操作"
        exit 0
    fi
else
    # 添加新的远程仓库
    git remote add origin "$GITHUB_URL"
    echo "已添加远程仓库: $GITHUB_URL"
fi

# 显示配置结果
echo ""
echo "=== 远程仓库配置完成 ==="
git remote -v

echo ""
echo "接下来可以执行 'git push -u origin main' 推送代码到GitHub"