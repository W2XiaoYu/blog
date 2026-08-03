
# Ubuntu  安装Nginx

## 安装

```shell
sudo apt update  # 更新软件包列表
sudo apt upgrade # 升级软件包
sudo apt install nginx 
```

验证安装结果

```shell
nginx -v

输出

nginx version: nginx/1.18.0 (Ubuntu)

```

## 检查服务状态

```shell
systemctl status nginx
输出

● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2025-05-09 16:11:03 CST; 4min 14s ago
       Docs: man:nginx(8)
   Main PID: 309033 (nginx)
      Tasks: 3 (limit: 2234)
     Memory: 7.8M
        CPU: 46ms
     CGroup: /system.slice/nginx.service
             ├─309033 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─309036 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             └─309037 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""

May 09 16:11:03 lavm-muvu4r894g systemd[1]: Starting A high performance web server and a reverse proxy server...
May 09 16:11:03 lavm-muvu4r894g systemd[1]: Started A high performance web server and a reverse proxy server.

```

## 启动、停止和重启服务

```shell
sudo systemctl start nginx    # 启动服务
sudo systemctl stop nginx     # 停止服务
sudo systemctl reload nginx   # 重新加载配置文件，不中断服务
sudo systemctl restart nginx  # 重启服务

```

## 设置开机自启

```shell
sudo systemctl enable nginx   # 启用开机自启动
sudo systemctl disable nginx  # 禁止开机自启动
```

## 配置Nginx

在/etc/nginx/nginx.conf<br/>

使用vim编辑器打开,修改一下配置

```shell

events{
   worker_connections 768;
 
}


http {

    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip 设置
    gzip on;  
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/x-javascript
        application/json
        application/xml
        application/rss+xml
        application/atom+xml
        image/svg+xml
        font/ttf
        font/woff
        font/woff2;


    # 正确的 server 块
    server {
        listen 80;
        server_name 117.72.94.xxxx;//服务器IP地址或域名

        root /var/www/html/admin;//web项目文件路径
        index index.html;//入口文件

        location / {
            try_files $uri $uri/ /index.html;
        }
    }

   
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}

```

每次修改配置后需要重启nginx

```shell
# 检测配置文件语法格式
sudo nginx -t
# 重启服务
sudo systemctl reload nginx

```
