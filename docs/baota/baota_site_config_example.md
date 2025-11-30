# 宝塔面板站点配置示例

本文档提供了在宝塔面板中创建诗词API网站站点的详细配置示例和参数说明。

## 1. 站点创建参数

### 基本信息

| 参数项 | 建议值 | 说明 |
|--------|--------|------|
| 网站域名 | `shiciapi.您的域名.com` 或服务器IP | 用于访问API的域名或IP地址 |
| 备注 | `诗词API项目` | 方便区分站点的描述 |
| 根目录 | `/www/wwwroot/shiciapi` | 项目文件存放位置 |
| 创建数据库 | 不勾选 | MongoDB数据库稍后单独配置 |
| FTP | 可选 | 如果需要文件上传功能 |
| PHP版本 | 纯静态 | 由于是Node.js项目，不需要PHP环境 |

### 网站目录设置

创建站点后，建议进行以下目录设置：

- **运行目录**：`/www/wwwroot/shiciapi`
- **防跨站攻击(open_basedir)**：开启
- **PHP运行模式**：Nginx代理模式（虽然是Node.js项目，但保持默认设置）

## 2. 站点配置文件示例

### Nginx配置参考

如果需要手动修改Nginx配置文件，可以参考以下内容（位于`/www/server/nginx/conf/vhost/您的域名.conf`）：

```nginx
server
{
    listen 80;
    server_name shiciapi.您的域名.com;
    index index.html index.htm index.php;
    root /www/wwwroot/shiciapi;

    #SSL-START SSL相关配置，请勿删除或修改下一行带注释的404规则
    #error_page 404/404.html;
    #SSL-END

    #ERROR-PAGE-START 错误页配置，可以注释、删除或修改
    #error_page 404 /404.html;
    #error_page 502 /502.html;
    #ERROR-PAGE-END

    #反向代理配置示例
    #location ~* \.(php|jsp|cgi|asp|aspx|flv|swf|xml)$ {
    #    proxy_pass http://127.0.0.1:8888;
    #    proxy_set_header Host $host;
    #    proxy_set_header X-Real-IP $remote_addr;
    #    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #    proxy_set_header REMOTE-HOST $remote_addr;
    #}

    #禁止访问的文件或目录
    location ~ ^/\.(?!well-known).* {
        deny all;
    }

    #一键申请SSL证书验证目录相关设置
    location ~ \.well-known {
        allow all;
    }

    #访问日志设置
    access_log /www/wwwlogs/shiciapi.您的域名.com.log;
    error_log /www/wwwlogs/shiciapi.您的域名.com.error.log;
}
```

## 3. 文件权限设置

站点创建后，建议设置以下文件权限：

- **目录权限**：755
- **文件权限**：644
- **运行用户**：www

可以通过宝塔面板文件管理界面或SSH命令设置：

```bash
# 命令行设置权限
sudo chmod -R 755 /www/wwwroot/shiciapi
sudo chown -R www:www /www/wwwroot/shiciapi
```

## 4. 安全配置

### 防火墙设置

确保在宝塔面板的防火墙中开放以下端口：

- 80端口：HTTP访问
- 443端口：HTTPS访问（如果配置SSL）
- 3000端口：Node.js应用运行端口
- 27017端口：MongoDB数据库端口

设置步骤：
1. 点击左侧菜单「安全」
2. 点击「添加规则」
3. 输入端口号和备注信息
4. 点击「放行」

### 防盗链设置

如果需要防止API接口被盗用，可以在站点设置中配置防盗链：

1. 点击左侧菜单「网站」
2. 进入您的站点设置
3. 点击「防盗链」选项卡
4. 设置白名单域名，如您的前端域名

## 5. SSL证书配置（可选）

如果您想使用HTTPS，可以在宝塔面板中一键申请SSL证书：

1. 点击左侧菜单「网站」
2. 进入您的站点设置
3. 点击「SSL」选项卡
4. 选择「Let's Encrypt」或其他证书提供商
5. 输入域名并验证
6. 点击「申请」

申请成功后，系统会自动配置SSL并启用HTTPS访问。

## 6. 日志管理

宝塔面板提供了日志查看功能，可以方便地监控站点运行状态：

1. 点击左侧菜单「网站」
2. 找到您的站点
3. 点击「日志」
4. 选择「访问日志」或「错误日志」查看

## 7. 站点管理操作

### 站点备份

为了防止数据丢失，建议定期备份站点：

1. 点击左侧菜单「网站」
2. 找到您的站点
3. 点击「备份」
4. 选择备份类型（网站文件/配置文件/数据库）
5. 点击「备份」按钮

### 站点监控

可以在宝塔面板中启用站点监控功能：

1. 点击左侧菜单「监控」
2. 可以查看CPU、内存、磁盘IO等系统资源使用情况

## 8. 常见问题

### 站点访问出现404错误

1. 检查站点根目录是否正确
2. 确认Node.js应用是否正常运行
3. 检查反向代理配置是否正确

### 站点无法启动

1. 检查域名是否已正确解析
2. 确认服务器防火墙已开放80/443端口
3. 验证Nginx配置是否正确

### 文件上传权限问题

1. 确认站点根目录权限设置正确
2. 检查PHP运行用户是否与文件所有者一致

---

通过以上配置，您应该能够在宝塔面板中成功创建诗词API项目的网站站点。后续步骤请参考主部署文档中的数据库配置和应用部署部分。