---
layout: doc
title: 打包构建
---

# 打包构建

## 打包&&运行

```bash
# 对应渠道打包
flutter build apk --flavor xxxxx --dart-define=channel=xxxxx 
# 对应渠道运行
flutter run apk --flavor xxxxx --dart-define=channel=xxxxx 

# 更换Java SDK路径
flutter config --jdk-dir "D:\APP\jdk-17.0.12_windows-x64_bin\jdk-17.0.12"
# 拉去远程仓库指定分支到本地并且文件名为分支名字
git clone -b xxxname --single-branch https://gitee.com/test.git xxxname
# 执行生成
flutter packages pub run build_runner build

```

## 生成App图标

```yaml
# 安装依赖
  flutter_launcher_icons: 0.11.0
# 配置信息
  flutter_icons:
    android: true
    ios: true
    image_path_ios: "assets/app/ios.png"
    image_path_android: "assets/app/android.png"
#执行生成
  flutter pub run flutter_launcher_icons

```
