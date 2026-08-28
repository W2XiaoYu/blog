---
layout: doc
title: 打包构建
---

# 打包构建

Flutter 项目里几条不常用、每次又要重新查的构建命令，统一记在这里。

## 按渠道打包和运行

```bash
# 按渠道打包
flutter build apk --flavor xxxxx --dart-define=channel=xxxxx 
# 按渠道运行
flutter run apk --flavor xxxxx --dart-define=channel=xxxxx 

# 更换 Java SDK 路径
flutter config --jdk-dir "D:\APP\jdk-17.0.12_windows-x64_bin\jdk-17.0.12"
# 只拉取远程仓库的指定分支，并用分支名作为本地目录名
git clone -b xxxname --single-branch https://gitee.com/test.git xxxname
# 运行代码生成
flutter packages pub run build_runner build

```

## 生成 App 图标

```yaml
# 安装依赖
  flutter_launcher_icons: 0.11.0
# 配置信息
  flutter_icons:
    android: true
    ios: true
    image_path_ios: "assets/app/ios.png"
    image_path_android: "assets/app/android.png"
# 执行生成
  flutter pub run flutter_launcher_icons

```
