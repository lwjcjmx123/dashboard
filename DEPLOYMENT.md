# 部署指南

本项目支持两种存储模式，可以灵活部署到不同的环境中。

## 🚀 Vercel 部署（推荐）

### 无数据库部署（IndexedDB 模式）

这是最简单的部署方式，适合个人使用：

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
   - 项目会自动检测到没有数据库
   - 使用 IndexedDB 进行客户端存储
   - 数据保存在用户浏览器中

### 有数据库部署

如果你有数据库（MySQL/PostgreSQL）：

1. **设置环境变量**
   在 Vercel 项目设置中添加：
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   ```

2. **部署**
   - Vercel 会自动运行 `prisma generate`
   - 使用数据库进行数据存储

## 🗄️ 存储模式对比

| 特性 | IndexedDB 模式 | 数据库模式 |
|------|----------------|------------|
| 部署复杂度 | 极简 | 中等 |
| 成本 | 免费 | 需要数据库费用 |
| 数据持久性 | 浏览器本地 | 服务器端 |
| 多设备同步 | ❌ | ✅ |
| 数据备份 | 手动导出 | 自动备份 |
| 适用场景 | 个人使用、演示 | 生产环境、多用户 |

## 🔧 本地开发

### IndexedDB 模式
```bash
# 设置环境变量
echo "FORCE_INDEXEDDB=true" > .env.local

# 启动开发服务器
npm run dev
```

### 数据库模式
```bash
# 设置数据库连接
echo "DATABASE_URL=mysql://..." > .env.local

# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 启动开发服务器
npm run dev
```

## 🌐 其他部署平台

### Netlify
1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`.next`
4. 环境变量（可选）：`FORCE_INDEXEDDB=true`

### Railway
1. 连接 GitHub 仓库
2. Railway 会自动检测 Next.js 项目
3. 如需数据库，可在 Railway 中添加 MySQL/PostgreSQL 服务

### DigitalOcean App Platform
1. 创建新应用
2. 连接 GitHub 仓库
3. 选择 Node.js 运行时
4. 设置构建命令：`npm run build`

## 🔍 故障排除

### 构建失败
如果在没有数据库的环境中构建失败：

```bash
# 强制使用 IndexedDB 模式构建
FORCE_INDEXEDDB=true npm run build
```

### Prisma 错误
如果遇到 Prisma 相关错误：

1. 确保设置了正确的环境变量
2. 运行 `npm run db:generate`
3. 检查数据库连接

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

### 数据库模式
- 确保数据库连接字符串安全
- 使用环境变量存储敏感信息
- 定期更新依赖包
- 考虑启用数据库 SSL

## 📈 性能优化

### 客户端优化
- 启用 Next.js 图片优化
- 使用 CDN 加速静态资源
- 启用 gzip 压缩

### 数据库优化
- 添加适当的数据库索引
- 使用连接池
- 考虑使用 Redis 缓存

## 🆙 升级路径

从 IndexedDB 模式升级到数据库模式：

1. 设置数据库
2. 添加 `DATABASE_URL` 环境变量
3. 运行数据库迁移
4. 重新部署
5. 手动迁移现有数据（如需要）

---

需要帮助？请查看项目的 GitHub Issues 或创建新的 Issue。