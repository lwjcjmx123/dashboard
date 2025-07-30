# 部署指南

本项目使用 IndexedDB 进行客户端数据存储，可以轻松部署到任何静态托管平台。

## 🚀 Vercel 部署（推荐）

### IndexedDB 模式部署

这是唯一的部署方式，简单高效，适合个人使用：

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 导入你的 GitHub 仓库
   - 无需设置任何环境变量
   - 点击部署

3. **自动配置**
   - 项目自动使用 IndexedDB 进行客户端存储
   - 数据保存在用户浏览器中
   - 无需任何额外配置

## 🗄️ IndexedDB 存储特性

| 特性 | 说明 |
|------|------|
| 部署复杂度 | 极简，无需配置 |
| 成本 | 完全免费 |
| 数据持久性 | 浏览器本地存储 |
| 隐私保护 | 数据不离开设备 |
| 数据备份 | 支持导出/导入功能 |
| 适用场景 | 个人生产力管理、演示 |

## 🔧 本地开发

### 快速开始
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 可选配置
```bash
# 可选：显式启用 IndexedDB 模式
echo "FORCE_INDEXEDDB=true" > .env.local

# 启动开发服务器
npm run dev
```

## 🌐 其他部署平台

### Netlify
1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`.next`
4. 无需环境变量配置

### Railway
1. 连接 GitHub 仓库
2. Railway 会自动检测 Next.js 项目
3. 无需额外配置，自动使用 IndexedDB

### DigitalOcean App Platform
1. 创建新应用
2. 连接 GitHub 仓库
3. 选择 Node.js 运行时
4. 设置构建命令：`npm run build`

## 🔍 故障排除

### 构建失败
如果构建失败，尝试清理缓存：

```bash
# 清理 Next.js 缓存
npm run clean

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

### IndexedDB 数据丢失
IndexedDB 数据可能在以下情况下丢失：
- 清除浏览器数据
- 隐私模式
- 浏览器存储限制

建议定期导出重要数据。

## 📊 监控和分析

### Vercel Analytics
在 Vercel 项目中启用 Analytics 来监控应用性能。

### 错误追踪
考虑集成 Sentry 或其他错误追踪服务：

```bash
npm install @sentry/nextjs
```

## 🔐 安全考虑

### IndexedDB 模式
- 数据存储在客户端，相对安全
- 不需要处理服务器端安全
- 注意不要在代码中暴露敏感信息

### IndexedDB 模式
- 数据存储在客户端，天然安全
- 定期更新依赖包
- 注意不要在代码中暴露敏感信息

## 📈 性能优化

### 客户端优化
- 启用 Next.js 图片优化
- 使用 CDN 加速静态资源
- 启用 gzip 压缩

### IndexedDB 优化
- 合理使用索引提升查询性能
- 定期清理过期数据
- 考虑数据压缩减少存储空间

## 🆙 数据管理

### 数据备份

1. 使用应用内的导出功能
2. 定期备份重要数据
3. 可以在不同浏览器间导入数据

### 数据迁移

1. 从旧版本导出数据
2. 在新环境中导入数据
3. 验证数据完整性

---

需要帮助？请查看项目的 GitHub Issues 或创建新的 Issue。