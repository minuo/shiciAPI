# 诗词API项目文档索引

本文档提供项目所有文档的组织结构和访问路径，方便查阅和使用。

## 文档目录结构

```
docs/
├── INDEX.md              # 文档索引（当前文件）
├── guides/              # 指南文档
│   ├── DEPLOYMENT_GUIDE.md    # 部署指南
│   ├── SSH_SETUP_GUIDE.md     # SSH设置指南
│   └── optimized-guide.md     # 优化指南
├── baota/               # 宝塔面板部署文档
│   ├── BAOTA_DEPLOYMENT_GUIDE.md   # 宝塔部署总览
│   ├── baota_site_config_example.md # 站点配置示例
│   ├── baota_db_config_guide.md     # 数据库配置指南
│   ├── baota_env_deps_guide.md      # 环境变量和依赖安装指南
│   ├── baota_pm2_guide.md           # PM2应用管理指南
│   ├── baota_api_verification_guide.md # API服务验证指南
│   └── baota_nginx_reverse_proxy_guide.md # Nginx反向代理配置指南
├── testing/             # 测试文档
│   └── API_Test_Report.md       # API测试报告
└── configs/             # 配置文档
    ├── tips.md          # 配置提示
    └── tips_ori.md      # 原始配置提示
```

## 文档说明

### 核心文档

- **README.md** - 项目概述、安装说明和基本使用方法（位于项目根目录）
- **docs/INDEX.md** - 文档索引（当前文件）

### 指南文档 (guides/)

- **DEPLOYMENT_GUIDE.md** - 项目部署指南，包括GitHub Actions自动部署配置
- **SSH_SETUP_GUIDE.md** - SSH连接和配置指南
- **optimized-guide.md** - 性能优化和最佳实践指南

### 宝塔面板部署文档 (baota/)

- **BAOTA_DEPLOYMENT_GUIDE.md** - 宝塔面板部署总览和步骤
- **baota_site_config_example.md** - 站点配置示例和详细说明
- **baota_db_config_guide.md** - MongoDB数据库配置指南
- **baota_env_deps_guide.md** - 环境变量配置和依赖安装指南
- **baota_pm2_guide.md** - PM2 Node.js应用管理详细指南
- **baota_api_verification_guide.md** - API服务验证和测试方法
- **baota_nginx_reverse_proxy_guide.md** - Nginx反向代理配置详解

### 测试文档 (testing/)

- **API_Test_Report.md** - API接口测试报告和测试方法

### 配置文档 (configs/)

- **tips.md** - 配置优化和使用提示
- **tips_ori.md** - 原始配置提示文档

## 使用建议

1. **新用户入门**：首先阅读根目录下的 README.md，了解项目基本信息
2. **本地开发**：参考 guides/ 目录下的相关文档进行环境配置
3. **部署项目**：
   - 普通部署：参考 guides/DEPLOYMENT_GUIDE.md
   - 宝塔部署：参考 baota/BAOTA_DEPLOYMENT_GUIDE.md 及其子文档
4. **问题排查**：根据问题类型参考对应目录下的文档
5. **测试API**：参考 testing/API_Test_Report.md

## 文档更新

本文档会随着项目的发展持续更新。如有文档相关的建议或问题，请提交 Issue 或 Pull Request。