---
title: Docker 部署前后端分离项目（Go + React + PostgreSQL）
description: 一次 Go、React 与 PostgreSQL 项目的 Docker Compose 部署记录。
---

# Docker 部署前后端分离项目（Go + React + PostgreSQL）

这是一次真实的上线记录：把 **Go/Gin + React + PostgreSQL** 的后台管理系统装进 Docker Compose，再部署到腾讯云。文中保留最后用下来的配置，也留下 Node 版本、跨平台 lock 文件和数据库约束这些途中碰到的坑。

## 项目架构

```
浏览器 ──:80──► 云服务器
                 frontend (nginx)
                   ├─ /         → React 构建产物
                   ├─ /api/     → 反向代理到 backend:8080
                   └─ /swagger/ → 反向代理到 backend:8080
                 backend (Go/Gin)
                   └─► postgres:5432（仅容器内部访问）
```

- `frontend`：唯一对外暴露 80 端口
- `backend`：不暴露端口，只通过内部网络被 nginx 访问
- `postgres`：不暴露端口，数据持久化到 Docker 命名卷

## 核心配置文件

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:17
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: full_stack
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d full_stack"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PORT: "8080"
      GIN_MODE: release
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_USER: admin
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: full_stack
      DB_SSLMODE: disable
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRE_HOURS: ${JWT_EXPIRE_HOURS:-2}
      JWT_REFRESH_EXPIRE_HOURS: ${JWT_REFRESH_EXPIRE_HOURS:-168}
      TRUSTED_PROXIES: "172.16.0.0/12"
    restart: unless-stopped

  frontend:
    build: ./front-end
    depends_on:
      - backend
    ports:
      - "80:80"
    restart: unless-stopped

volumes:
  pgdata:
```

### 后端 Dockerfile

```dockerfile
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
ENV GOPROXY=https://goproxy.cn,direct
RUN go mod download
RUN go install github.com/swaggo/swag/cmd/swag@latest
COPY . .
RUN swag init -g main.go -o ./docs -d ./,./handlers,./models,./dto,./utils
RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

FROM alpine:3.20
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/backend .
EXPOSE 8080
CMD ["./backend"]
```

### 前端 Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

> 这里使用 `npm install` 而不是 `npm ci`，原因放在后面的实际问题里。

### 前端 nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /swagger/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

## 部署步骤

### 1. 服务器准备

```bash
# 确认 docker compose 插件已安装
docker compose version
```

### 2. 上传代码

国内服务器拉 GitHub 可能会失败，建议：

- 用 Gitee 中转：`git clone https://gitee.com/你的用户名/仓库.git`
- 或者本地压缩后用 `scp` 上传

### 3. 配置环境变量

```bash
cp .env.example .env
vim .env
```

至少修改这两项：

```bash
POSTGRES_PASSWORD=你的强密码
JWT_SECRET=你的随机密钥至少32位
```

### 4. 启动

```bash
docker compose up -d --build
```

### 5. 放行安全组

云服务器安全组放行入站 **TCP 80**。

### 6. 访问

- 系统：`http://<服务器公网IP>`
- Swagger：`http://<服务器公网IP>/swagger/index.html`

## 实际遇到的问题

### 坑 1：PostgreSQL 镜像版本写 `postgres:18` 拉不到

一开始 `docker-compose.yml` 写了 `postgres:18`，但镜像源不一定有。改成 `postgres:17` 后正常。

### 坑 2：前端构建报 Node 版本不够

错误信息：

```
npm warn EBADENGINE Unsupported engine
camera-controls@3.1.2 requires node: '>=22.0.0'
```

解决：前端 Dockerfile 从 `node:20-alpine` 升级到 `node:22-alpine`。

### 坑 3：`npm ci` 失败，lock 文件不同步

错误信息：

```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
Missing: @emnapi/core@1.11.3 from lock file
```

原因：lock 文件是在 Windows 上生成的，缺少 Linux 平台才有的 optional 依赖（如 `@emnapi/*`）。

解决：Dockerfile 里改用 `npm install`，让容器根据实际平台重新解析安装。

### 坑 4：TypeScript 构建报错

三个典型错误：

1. `starry-sky` 组件里 `<line>` 的 ref 被识别成 SVG 元素，不是 THREE.Line
2. `React.ElementType` 渲染图标时 `className` 属性推导成 `never`
3. 未使用的 `Moon` 组件

解决：

- 图标类型改成 `React.ComponentType<{ className?: string }>`
- `<line>` ref 加类型断言：`ref as THREE.Line | null`
- 删除未使用的组件

### 坑 5：管理员账号创建失败，登录 401

后端日志：

```
种子管理员创建失败: ERROR: insert or update on table "users" violates foreign key constraint "fk_users_dept"
```

原因：`users.dept_id` 有外键约束，但代码里默认用 `0` 表示「未分配部门」，数据库不认 `0`。

解决：把 `DeptID` 从 `uint` 改成 `*uint`，未分配时存 `NULL`。

### 坑 6：访问必须是 HTTP，不能用 HTTPS

因为没有域名和备案，浏览器输入 IP 时如果自动加 `https://` 会访问失败。要显式输入：

```
http://124.220.45.229
```

## 常用运维命令

```bash
# 查看状态
docker compose ps

# 看后端日志
docker compose logs -f backend

# 看 nginx 日志
docker compose logs -f frontend

# 数据库备份
docker compose exec postgres pg_dump -U admin full_stack > backup.sql

# 停止并删除容器（保留数据）
docker compose down

# 停止并删除容器 + 清空数据
docker compose down -v

# 只重建后端
docker compose up -d --build backend

# 只重建前端
docker compose up -d --build frontend
```

## 上线后再补几件事

1. **改默认密码**：首次登录 `admin / admin123` 后立即修改
2. **上 HTTPS**：没有域名备案的话，可以买个域名 + 云厂商证书，或者在 nginx 容器里挂证书
3. **数据库备份**：设置定时任务备份 `pgdata` 卷或导出 SQL
4. **资源限制**：compose 里给每个服务加 `deploy.resources.limits`

## 回头看

整套部署最后只剩一条清楚的路径：`docker-compose.yml` 管住数据库、后端和前端三个容器，nginx 站在最外面接住流量。真正耗时间的反而不是 Compose 本身，而是 Node 版本、跨平台 lock 文件、可空字段和外键这些边角。把它们记下来，下次再部署同类项目，就不必重走一遍弯路。
