#!/bin/bash

# 添加远程仓库演示脚本
# 此脚本将帮助您配置Git远程仓库地址

echo "============================================"
echo "        Git远程仓库配置演示脚本            "
echo "============================================"
echo

# 检查是否已经有远程仓库配置
echo "[步骤1] 检查当前远程仓库配置..."
git remote -v

# 询问用户是否要继续
echo
read -p "是否要继续配置远程仓库？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消。"
    exit 0
fi

# 询问用户GitHub仓库URL
echo "[步骤2] 请输入您的GitHub仓库URL："
echo "示例格式："
echo "  HTTPS: https://github.com/用户名/仓库名.git"
echo "  SSH: git@github.com:用户名/仓库名.git"
echo
read -p "请输入仓库URL: " repo_url

# 验证URL格式
if [[ -z "$repo_url" ]]; then
    echo "错误：仓库URL不能为空。"
    exit 1
fi

# 检查是否已经存在origin远程仓库
if git remote | grep -q "origin"; then
    echo
    echo "检测到已存在origin远程仓库。"
    read -p "是否要替换现有远程仓库？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "[步骤3] 更新远程仓库地址..."
        git remote set-url origin "$repo_url"
        if [ $? -eq 0 ]; then
            echo "✓ 远程仓库地址已更新。"
        else
            echo "✗ 更新远程仓库地址失败。"
            exit 1
        fi
    else
        echo "[步骤3] 添加新的远程仓库..."
        read -p "请输入远程仓库名称(默认为'origin2'): " remote_name
        remote_name=${remote_name:-origin2}
        git remote add "$remote_name" "$repo_url"
        if [ $? -eq 0 ]; then
            echo "✓ 新的远程仓库'$remote_name'已添加。"
        else
            echo "✗ 添加远程仓库失败。"
            exit 1
        fi
    fi
else
    echo "[步骤3] 添加远程仓库..."
    git remote add origin "$repo_url"
    if [ $? -eq 0 ]; then
        echo "✓ 远程仓库已添加。"
    else
        echo "✗ 添加远程仓库失败。"
        exit 1
    fi
fi

echo

# 验证远程仓库配置
echo "[步骤4] 验证远程仓库配置..."
git remote -v

echo

# 提供下一步操作建议
echo "============================================"
echo "✅ 远程仓库配置完成！"
echo "============================================"
echo "下一步操作建议："
echo "1. 推送代码到远程仓库: git push -u origin main"
echo "2. 拉取远程仓库内容: git pull origin main"
echo "3. 查看远程仓库信息: git remote show origin"
echo "============================================"
