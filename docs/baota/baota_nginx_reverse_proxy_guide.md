# Nginx反向代理配置指南

本文档详细介绍如何在宝塔面板中配置Nginx反向代理，将用户请求转发到运行中的诗词API服务。通过正确配置反向代理，可以实现域名访问、SSL加密、负载均衡和请求缓存等功能。

## 1. Nginx反向代理基础知识

### 1.1 什么是反向代理

反向代理（Reverse Proxy）是一种服务器架构设计，它位于客户端和后端服务器之间，接收客户端的请求并转发到适当的后端服务器，然后将后端服务器的响应返回给客户端。

### 1.2 使用反向代理的好处

- **域名访问**：使用域名代替IP:端口访问服务
- **SSL加密**：支持HTTPS，提高数据传输安全性
- **负载均衡**：在多台服务器之间分发请求
- **请求缓存**：缓存静态资源，提高访问速度
- **安全防护**：隐藏后端服务器的真实信息
- **统一入口**：多个服务可以通过一个域名的不同路径访问

## 2. 宝塔面板中的Nginx配置

### 2.1 进入网站配置界面

1. 登录宝塔面板
2. 点击左侧菜单「网站」
3. 找到您之前创建的诗词API网站，点击「设置」

### 2.2 配置反向代理

在网站设置页面，找到并点击「反向代理」选项卡：

#### 2.2.1 添加反向代理

1. 点击「添加反向代理」
2. 填写以下信息：
   - **代理名称**：建议填写有意义的名称，如`shiciapi`
   - **目标URL**：填写Node.js应用的地址，通常是`http://127.0.0.1:3000`
   - **发送域名**：建议勾选，保持与网站域名一致
   - **获取真实IP**：建议勾选，以便在应用中获取真实的客户端IP

#### 2.2.2 反向代理配置参数

除了基本配置外，还可以根据需要调整以下参数：

- **缓存设置**：可以设置缓存时间，加速API响应
- **URL重写**：可以配置URL重写规则，修改请求路径
- **WebSocket**：如果API支持WebSocket，需要启用此选项
- **SSL**：如果配置了SSL证书，可以在此配置HTTPS代理

## 3. 高级Nginx配置

### 3.1 编辑Nginx配置文件

对于更复杂的配置需求，可以直接编辑Nginx配置文件：

1. 在网站设置页面，点击「配置文件」选项卡
2. 编辑配置文件，添加或修改反向代理相关配置

### 3.2 反向代理配置示例

以下是一个完整的反向代理配置示例：

```nginx
upstream shiciapi {
    # 后端应用地址
    server 127.0.0.1:3000;
    # 如果有多个后端服务器，可以在这里添加
    # server 127.0.0.1:3001;
    # server 127.0.0.1:3002;
    
    # 负载均衡策略
    # 可选：round-robin(默认), least_conn, ip_hash, hash $request_uri consistent
    ip_hash;
}

server {
    listen 80;
    # 如果配置了SSL，请取消下面这行的注释
    # listen 443 ssl http2;
    server_name api.shici.example.com; # 替换为您的域名
    
    # 根目录配置（静态文件）
    root /www/wwwroot/shiciapi/public;
    index index.html index.htm;
    
    # SSL配置（如果需要）
    # ssl_certificate    /www/server/panel/vhost/cert/api.shici.example.com/fullchain.pem;
    # ssl_certificate_key    /www/server/panel/vhost/cert/api.shici.example.com/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    # ssl_prefer_server_ciphers on;
    # ssl_session_cache shared:SSL:10m;
    # ssl_session_timeout 10m;
    
    # 访问日志配置
    access_log  /www/wwwlogs/api.shici.example.com.log;
    error_log  /www/wwwlogs/api.shici.example.com.error.log;
    
    # 静态资源处理
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        proxy_pass http://shiciapi;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API请求代理
    location / {
        # 代理到后端服务
        proxy_pass http://shiciapi;
        
        # 代理头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-NginX-Proxy true;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        
        # 缓冲区设置
        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 4 32k;
        proxy_busy_buffers_size 64k;
        proxy_temp_file_write_size 64k;
        
        # 压缩设置
        gzip on;
        gzip_comp_level 2;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    
    # API路径代理（可选）
    location /api/ {
        proxy_pass http://shiciapi/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 错误页面配置
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /www/server/nginx/html;
    }
}
```

### 3.3 缓存配置

为了提高API性能，可以配置Nginx缓存：

```nginx
# 定义缓存路径
proxy_cache_path /var/cache/nginx/api_cache levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

# 在server或location块中使用缓存
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://shiciapi;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3.4 限流配置

为了防止API被滥用，可以配置Nginx限流：

```nginx
# 定义限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在location块中使用限流
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    
    proxy_pass http://shiciapi;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 4. 配置SSL证书

### 4.1 在宝塔面板中申请SSL证书

1. 在网站设置页面，点击「SSL」选项卡
2. 选择「Let's Encrypt」
3. 填写域名信息并勾选「自动续期」
4. 点击「申请」

### 4.2 配置HTTPS

申请成功后，需要配置反向代理以支持HTTPS：

1. 在反向代理配置中，确保勾选了「SSL」选项
2. 或者直接编辑Nginx配置文件，添加SSL相关配置

## 5. 配置WebSocket支持

如果诗词API需要支持WebSocket（例如实时通知功能），需要在Nginx配置中添加WebSocket支持：

```nginx
location /ws/ {
    proxy_pass http://shiciapi;
    
    # WebSocket支持
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 长连接超时设置
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}
```

## 6. 配置多个API服务

如果需要在同一域名下部署多个API服务，可以通过不同的路径进行区分：

```nginx
# 诗词API服务
location /shici-api/ {
    proxy_pass http://shiciapi/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 另一个API服务
location /user-api/ {
    proxy_pass http://userapi/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 7. 性能优化配置

### 7.1 Gzip压缩配置

启用Gzip压缩可以减小响应大小，提高传输速度：

```nginx
# 在http块中添加
http {
    # Gzip设置
    gzip on;
    gzip_comp_level 2;
    gzip_min_length 1024;
    gzip_buffers 4 16k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_disable "msie6";
    gzip_vary on;
    
    # 其他配置...
}
```

### 7.2 客户端缓存配置

设置合理的缓存策略，减少重复请求：

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

## 8. 安全配置

### 8.1 隐藏Nginx版本信息

在Nginx配置文件中隐藏版本信息：

```nginx
# 在http块中添加
http {
    server_tokens off;
    
    # 其他配置...
}
```

### 8.2 添加安全响应头

添加安全相关的HTTP响应头：

```nginx
server {
    # 其他配置...
    
    # 安全响应头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
    
    # 其他配置...
}
```

### 8.3 配置访问控制

限制特定IP访问API：

```nginx
location /api/admin/ {
    # 只允许特定IP访问
    allow 192.168.1.100;
    deny all;
    
    proxy_pass http://shiciapi/admin/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 9. 反向代理配置验证

### 9.1 测试Nginx配置

配置完成后，应该测试Nginx配置是否正确：

1. 在宝塔面板中，点击左侧菜单「软件商店」
2. 找到「Nginx」并点击「设置」
3. 点击「服务」选项卡
4. 点击「验证配置」

或者使用命令行：

```bash
nginx -t
```

### 9.2 重载Nginx配置

验证通过后，需要重载Nginx配置：

1. 在宝塔面板中，点击「重载配置」按钮

或者使用命令行：

```bash
nginx -s reload
```

### 9.3 测试API访问

使用curl或浏览器测试API访问：

```bash
# 通过域名访问
curl http://api.shici.example.com/

# 如果配置了HTTPS
curl https://api.shici.example.com/
```

## 10. 常见问题排查

### 10.1 502 Bad Gateway错误

**可能原因：**
- 后端服务未启动或端口错误
- 防火墙阻止了Nginx访问后端服务
- 后端服务响应超时

**解决方案：**
- 检查Node.js应用是否运行：`pm2 list`
- 验证应用端口：`netstat -tlnp | grep 3000`
- 检查防火墙设置，确保允许127.0.0.1访问3000端口
- 增加Nginx超时设置：`proxy_connect_timeout 60s;`

### 10.2 403 Forbidden错误

**可能原因：**
- 文件权限问题
- Nginx配置中的访问控制规则

**解决方案：**
- 检查网站目录权限：`chmod -R 755 /www/wwwroot/shiciapi`
- 检查Nginx配置中的访问控制规则

### 10.3 504 Gateway Timeout错误

**可能原因：**
- 后端服务处理请求时间过长
- Nginx超时设置过短

**解决方案：**
- 增加Nginx超时设置：
  ```nginx
  proxy_connect_timeout 60s;
  proxy_read_timeout 60s;
  proxy_send_timeout 60s;
  ```
- 优化后端服务，减少处理时间

### 10.4 SSL证书问题

**可能原因：**
- 证书过期
- 证书配置错误
- 证书链不完整

**解决方案：**
- 检查证书是否过期
- 验证证书配置路径是否正确
- 重新申请SSL证书

### 10.5 WebSocket连接失败

**可能原因：**
- Nginx未正确配置WebSocket支持
- 后端服务WebSocket端口错误

**解决方案：**
- 确保在Nginx配置中添加了WebSocket相关设置
- 验证后端服务WebSocket功能是否正常

## 11. 创建Nginx配置备份和恢复脚本

### 11.1 创建备份脚本

在项目根目录创建`backup_nginx_config.sh`文件：

```bash
#!/bin/bash

# 定义变量
WEBSITE_DOMAIN="api.shici.example.com" # 替换为您的域名
BACKUP_DIR="/www/backup/nginx"
DATE=$(date +"%Y%m%d_%H%M%S")
CONFIG_FILE="/www/server/panel/vhost/nginx/${WEBSITE_DOMAIN}.conf"
BACKUP_FILE="${BACKUP_DIR}/${WEBSITE_DOMAIN}_${DATE}.conf"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份配置文件
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "✅ 已备份Nginx配置文件到: $BACKUP_FILE"
    
    # 保留最近10个备份，删除旧备份
    cd "$BACKUP_DIR"
    ls -t ${WEBSITE_DOMAIN}_*.conf | tail -n +11 | xargs rm -f
    echo "✅ 已清理10天前的旧备份文件"
else
    echo "❌ 未找到Nginx配置文件: $CONFIG_FILE"
    exit 1
fi
```

### 11.2 创建恢复脚本

在项目根目录创建`restore_nginx_config.sh`文件：

```bash
#!/bin/bash

# 定义变量
WEBSITE_DOMAIN="api.shici.example.com" # 替换为您的域名
BACKUP_DIR="/www/backup/nginx"
CONFIG_FILE="/www/server/panel/vhost/nginx/${WEBSITE_DOMAIN}.conf"

# 列出可用的备份文件
echo "可用的Nginx配置备份文件："
ls -l "$BACKUP_DIR"/${WEBSITE_DOMAIN}_*.conf | sort -r

# 询问用户选择哪个备份文件
read -p "请输入要恢复的备份文件名称（包括路径）: " BACKUP_FILE

# 验证备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 未找到指定的备份文件: $BACKUP_FILE"
    exit 1
fi

# 备份当前配置文件作为额外安全措施
CURRENT_BACKUP="${BACKUP_DIR}/current_${WEBSITE_DOMAIN}_${DATE}.conf"
cp "$CONFIG_FILE" "$CURRENT_BACKUP"
echo "✅ 已创建当前配置的额外备份: $CURRENT_BACKUP"

# 恢复配置文件
cp "$BACKUP_FILE" "$CONFIG_FILE"
echo "✅ 已恢复Nginx配置文件: $BACKUP_FILE -> $CONFIG_FILE"

# 验证Nginx配置
nginx -t
if [ $? -eq 0 ]; then
    # 重载Nginx配置
    nginx -s reload
    echo "✅ Nginx配置已重载，恢复完成！"
else
    echo "❌ Nginx配置验证失败，请检查恢复的配置文件"
    # 恢复到原始配置
    cp "$CURRENT_BACKUP" "$CONFIG_FILE"
    echo "⚠️  已回滚到原始配置"
    exit 1
fi
```

### 11.3 设置执行权限

```bash
chmod +x backup_nginx_config.sh
chmod +x restore_nginx_config.sh
```

---

通过以上配置，您应该能够成功在宝塔面板中设置Nginx反向代理，使诗词API服务可以通过域名正常访问。正确的反向代理配置不仅可以提高API的可用性和安全性，还能显著改善用户体验。