# SSH密钥配置指南

## 生成SSH密钥对

1. 在本地机器上生成SSH密钥对：
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```
   一路回车，使用默认选项即可。

2. 生成的密钥文件将位于：
   - 私钥：`~/.ssh/id_ed25519`
   - 公钥：`~/.ssh/id_ed25519.pub`

## 配置阿里云服务器

1. 登录阿里云服务器，将公钥添加到`~/.ssh/authorized_keys`文件中：
   ```bash
   mkdir -p ~/.ssh
   echo '你的公钥内容' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

## 配置GitHub Secrets

1. 登录GitHub，打开你的仓库
2. 点击Settings > Secrets and variables > Actions
3. 添加以下密钥：
   - `ALIYUN_HOST`: 阿里云服务器的IP地址
   - `ALIYUN_USERNAME`: 服务器用户名
   - `ALIYUN_PORT`: 22（SSH默认端口）
   - `ALIYUN_SSH_KEY`: 本地生成的私钥内容（复制`~/.ssh/id_ed25519`的全部内容）

## 测试连接

你可以在本地测试SSH连接是否正常：
```bash
ssh -i ~/.ssh/id_ed25519 用户名@服务器IP
```

## 注意事项

1. 妥善保管私钥，不要分享给他人
2. 定期更新SSH密钥以提高安全性
3. 确保阿里云服务器的防火墙开放了22端口