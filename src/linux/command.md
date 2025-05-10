
# Linux常用命令

## 目录操作

|命令|说明|
|------|----|
| `ls -al` | 显示所有文件（包括隐藏），详细信息 |
| `cd /path/to/dir` | 进入指定目录 |
| `pwd` | 显示当前路径 |
| `mkdir dir` | 创建目录 |
| `rm -rf dir_or_file` | 强制删除目录或文件 |
| `cp -r src dest` | 复制文件/目录 |
| `mv old new` | 移动/重命名文件 |
| `touch file` | 创建空文件 |
| `cat file` | 查看文件内容 |
| `tail -n 100 file` | 查看文件最后 100 行 |
| `tail -f file` | 实时查看文件内容（日志） |
| `pwd` | 查看当前目录 |

## 软件包管理

| 命令 | 说明 |
|------|------|
| `sudo apt update` | 更新软件列表 |
| `sudo apt upgrade` | 更新所有已安装软件 |
| `sudo apt install xxx` | 安装软件 |
| `sudo apt remove xxx` | 卸载软件 |

## 系统管理

| 命令 | 说明 |
|------|------|
| `top` / `htop` | 查看系统资源占用 |
| `df -h` | 查看磁盘使用情况 |
| `du -sh dir/` | 查看目录大小 |
| `free -h` | 查看内存使用 |
| `uptime` | 查看系统运行时间 |
| `reboot` | 重启系统 |
| `shutdown -h now` | 立即关机 |

## 网络命令

| 命令 | 说明 |
|------|------|
| `ip a` 或 `ifconfig` | 查看网络地址 |
| `ping baidu.com` | 测试网络连通性 |
| `curl http://localhost:8080` | 请求接口测试 |
| `netstat -tuln` | 查看监听的端口 |
| `ss -lntp` | 查看端口与进程关联 |
| `scp file user@host:/path` | 复制文件到远程服务器 |
| `rsync -avz ./dist/ user@host:/path` | 同步文件到远程服务器 |

## 服务管理

| 命令 | 说明 |
|------|------|
| `systemctl status nginx` | 查看服务状态 |
| `systemctl start nginx` | 启动服务 |
| `systemctl stop nginx` | 停止服务 |
| `systemctl restart nginx` | 重启服务 |
| `systemctl enable nginx` | 开机自启 |
| `systemctl disable nginx` | 取消开机自启 |

## 压缩解压

| 命令 | 说明 |
|------|------|
| `tar -czvf a.tar.gz dir/` | 压缩目录为 tar.gz |
| `tar -xzvf a.tar.gz` | 解压 tar.gz 文件 |
| `zip -r a.zip dir/` | 压缩为 zip |
| `unzip a.zip` | 解压 zip |

## 其他实用

| 命令 | 说明 |
|------|------|
| `alias ll='ls -al'` | 设置快捷命令 |
| `history` | 查看历史命令 |
| `which nginx` | 查看命令路径 |
| `nohup ./app > log.out 2>&1 &` | 后台运行程序 |

## 快捷键

| 快捷键 | 说明 |
|--------|------|
| `Ctrl + C` | 强制终止当前命令 |
| `Ctrl + D` | 退出终端 |
| `Tab` | 自动补全命令或路径 |
| `↑ / ↓` | 查看历史命令 |
