
## Go语言

### Go语言脚本

#### 生成差量更新包

1. 代码

```go
package main

import (
 "bytes"
 "crypto/sha256"
 "encoding/hex"
 "encoding/json"
 "flag"
 "fmt"
 "io"
 "io/ioutil"
 "log"
 "os"
 "path/filepath"
 "strings"
 "time"

 "github.com/kr/binarydist" // 确保已安装 go get github.com/kr/binarydist
)

// PatchMetadata 结构体，用于 JSON 输出 (针对单个文件的补丁元数据)
type PatchMetadata struct {
 RelativePath    string `json:"relative_path"`     // 文件在目录中的相对路径 (例如: data/app.so)
 NewFileSHA256   string `json:"new_file_sha256"`   // 新文件的 SHA256 哈希
 PatchFileSHA256 string `json:"patch_file_sha256"` // 补丁文件的 SHA256 哈希

 // 注意：以下字段在 updater.go 中可能不需要，但对 patch_maker 很有用
 OldFilePath      string  `json:"old_file_path,omitempty"`   // 旧文件的绝对路径
 NewFilePath      string  `json:"new_file_path,omitempty"`   // 新文件的绝对路径
 PatchFilePath    string  `json:"patch_file_path,omitempty"` // 生成的补丁文件的绝对路径
 OldFileSize      int64   `json:"old_file_size_bytes,omitempty"`
 NewFileSize      int64   `json:"new_file_size_bytes,omitempty"`
 PatchFileSize    int64   `json:"patch_file_size_bytes,omitempty"`
 OldFileSHA256    string  `json:"old_file_sha256,omitempty"` // 旧文件的 SHA256 哈希
 GenerationTime   string  `json:"generation_time,omitempty"`
 DurationSeconds  float64 `json:"duration_seconds,omitempty"`
 CompressionRatio float64 `json:"compression_ratio_percent,omitempty"` // 补丁大小 / 新文件大小

 NewFileOnly     bool   `json:"new_file_only,omitempty"`     // 表示这个文件是新版本中新增的 (没有旧文件)
 DeletedFileOnly bool   `json:"deleted_file_only,omitempty"` // 表示这个文件在旧版本中存在但新版本中被删除
 ErrorStatus     string `json:"error_status,omitempty"`      // 记录生成补丁时遇到的错误
}

// GlobalPatchManifest 用于汇总所有补丁的元数据
type GlobalPatchManifest struct {
 OldVersionDir    string          `json:"old_version_directory"`
 NewVersionDir    string          `json:"new_version_directory"`
 PatchOutputDir   string          `json:"patch_output_directory"`
 GenerationTime   string          `json:"generation_time"`
 TotalDuration    float64         `json:"total_duration_seconds"`
 NewVersionTag    string          `json:"new_version_tag"` // 新增，用于updater识别
 PatchCount       int             `json:"patch_count"`
 NewFileCount     int             `json:"new_file_count"`
 DeletedFileCount int             `json:"deleted_file_count"`
 Files            []PatchMetadata `json:"files"` // 存储每个文件的补丁元数据
}

// isUninstallerFile 检查文件名是否是需要跳过的卸载器文件
func isUninstallerFile(filename string) bool {
 lowerFilename := strings.ToLower(filename)
 return lowerFilename == "unins000.dat" || lowerFilename == "unins000.exe"
}

func main() {
 // --- 日志配置修改 START ---
 tempDir := os.TempDir()
 logFileName := "render_patch_maker.log"
 logFilePath := filepath.Join(tempDir, logFileName)

 logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
 if err != nil {
  log.Fatalf("错误: 无法打开日志文件 '%s': %v", logFilePath, err)
 }
 defer logFile.Close()

 log.SetOutput(io.MultiWriter(os.Stdout, logFile))
 // --- 日志配置修改 END ---

 log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
 log.Println("Patch Maker: 启动目录差异补丁生成器...")

 // 解析命令行参数
 oldDir := flag.String("old-dir", "", "旧版本应用根目录路径 (例如：old_app_v1.0.0)")
 newDir := flag.String("new-dir", "", "新版本应用根目录路径 (例如：new_app_v1.0.1)")
 outputDir := flag.String("output-dir", "patches", "输出补丁和元数据文件的根目录 (可选，默认 'patches')")
 globalMetaOutput := flag.String("global-meta", "patches/manifest.json", "输出全局元数据清单 JSON 文件路径 (可选，默认 'patches/manifest.json')")
 newVersionTag := flag.String("new-version-tag", "", "新版本标签 (例如: v1.0.1), 将写入 manifest.json")
 flag.Parse()

 // 验证必要参数
 if *oldDir == "" || *newDir == "" {
  log.Fatalf("错误: 请指定 -old-dir 旧版本应用根目录 和 -new-dir 新版本应用根目录。\n用法: %s -old-dir <old_path> -new-dir <new_path> [-output-dir <output_path>] [-global-meta <manifest_path>] [-new-version-tag <tag>]", os.Args[0])
 }

 // 获取绝对路径
 oldAbsDir, err := filepath.Abs(*oldDir)
 if err != nil {
  log.Fatalf("错误: 无法获取旧目录绝对路径 '%s': %v", *oldDir, err)
 }
 newAbsDir, err := filepath.Abs(*newDir)
 if err != nil {
  log.Fatalf("错误: 无法获取新目录绝对路径 '%s': %v", *newDir, err)
 }
 outputAbsDir, err := filepath.Abs(*outputDir)
 if err != nil {
  log.Fatalf("错误: 无法获取输出目录绝对路径 '%s': %v", *outputDir, err)
 }
 globalMetaAbsPath, err := filepath.Abs(*globalMetaOutput)
 if err != nil {
  log.Fatalf("错误: 无法获取全局元数据文件绝对路径 '%s': %v", *globalMetaOutput, err)
 }

 // 创建输出目录
 if err := os.MkdirAll(filepath.Dir(globalMetaAbsPath), 0755); err != nil { // 确保manifest文件目录存在
  log.Fatalf("错误: 无法创建全局元数据文件目录 '%s': %v", filepath.Dir(globalMetaAbsPath), err)
 }
 if err := os.MkdirAll(outputAbsDir, 0755); err != nil {
  log.Fatalf("错误: 无法创建补丁输出目录 '%s': %v", outputAbsDir, err)
 }

 globalManifest := GlobalPatchManifest{
  OldVersionDir:  oldAbsDir,
  NewVersionDir:  newAbsDir,
  PatchOutputDir: outputAbsDir,
  GenerationTime: time.Now().Format(time.RFC3339),
  NewVersionTag:  *newVersionTag, // 写入新版本标签
  Files:          []PatchMetadata{},
 }
 totalStartTime := time.Now()

 log.Printf("信息: 正在比较目录: \n  旧目录: %s\n  新目录: %s\n  输出目录: %s", oldAbsDir, newAbsDir, outputAbsDir)

 // 遍历新目录中的文件，寻找变化和新增
 newFiles := make(map[string]bool) // 记录新目录中处理过的文件
 err = filepath.Walk(newAbsDir, func(path string, info os.FileInfo, err error) error {
  if err != nil {
   log.Printf("警告: 访问文件 '%s' 时出错: %v", path, err)
   return nil // 继续遍历
  }

  if info.IsDir() {
   return nil // 跳过目录
  }

  // --- 添加白名单检查 START ---
  if isUninstallerFile(info.Name()) {
   log.Printf("信息: 白名单文件，跳过处理: %s", info.Name())
   // 修正这里：先获取相对路径，再作为map的键
   relPathForWhitelist, relErr := filepath.Rel(newAbsDir, path)
   if relErr != nil {
    log.Printf("警告: 无法获取白名单文件 '%s' 的相对路径: %v", path, relErr)
    return nil // 如果无法获取相对路径，则跳过
   }
   newFiles[relPathForWhitelist] = true // 标记为已处理，防止在旧文件遍历中被误标记为删除
   return nil
  }
  // --- 添加白名单检查 END ---

  relativePath, err := filepath.Rel(newAbsDir, path)
  if err != nil {
   return fmt.Errorf("无法获取相对路径 '%s' 到 '%s': %w", path, newAbsDir, err)
  }
  newFiles[relativePath] = true // 这里是正确的，因为上面已经处理过 `err`

  oldFilePath := filepath.Join(oldAbsDir, relativePath)
  newFilePath := path // 这是当前正在遍历的新文件路径

  patchMetadata := PatchMetadata{
   RelativePath:   relativePath,
   OldFilePath:    oldFilePath,
   NewFilePath:    newFilePath,
   GenerationTime: time.Now().Format(time.RFC3339),
  }
  startTime := time.Now()

  oldFileInfo, err := os.Stat(oldFilePath)
  if os.IsNotExist(err) {
   // 文件在新版本中新增
   log.Printf("信息: 发现新文件: %s", relativePath)
   patchMetadata.NewFileOnly = true
   newFileBytes, err := ioutil.ReadFile(newFilePath)
   if err != nil {
    patchMetadata.ErrorStatus = fmt.Sprintf("无法读取新文件: %v", err)
    log.Printf("错误: %s", patchMetadata.ErrorStatus)
   } else {
    patchMetadata.NewFileSize = int64(len(newFileBytes))
    patchMetadata.NewFileSHA256 = calculateSHA256(newFileBytes)
   }
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   globalManifest.NewFileCount++
   return nil // 继续遍历
  } else if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法获取旧文件信息: %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil // 继续遍历
  }

  // 比较文件内容是否发生变化
  oldFileHash, err := calculateFileSHA256(oldFilePath)
  if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法计算旧文件哈希: %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil // 继续遍历
  }
  newFileHash, err := calculateFileSHA256(newFilePath)
  if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法计算新文件哈希: %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil // 继续遍历
  }

  if oldFileHash == newFileHash && oldFileInfo.Size() == info.Size() {
   // 文件没有变化，跳过
   log.Printf("信息: 文件未变化，跳过: %s", relativePath)
   return nil
  }

  // 文件有变化，生成补丁
  log.Printf("信息: 发现文件变化，生成补丁: %s", relativePath)

  oldData, err := ioutil.ReadFile(oldFilePath)
  if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法读取旧文件: %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil
  }
  newData, err := ioutil.ReadFile(newFilePath)
  if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法读取新文件: %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil
  }

  patchMetadata.OldFileSize = int64(len(oldData))
  patchMetadata.NewFileSize = int64(len(newData))
  patchMetadata.OldFileSHA256 = oldFileHash
  patchMetadata.NewFileSHA256 = newFileHash

  // 构建补丁文件的相对路径，直接在原始文件相对路径后追加 .patch
  // 例如：data/app.so -> data/app.so.patch
  patchRelativePath := relativePath + ".patch"
  targetPatchDir := filepath.Join(outputAbsDir, filepath.Dir(patchRelativePath))

  if err := os.MkdirAll(targetPatchDir, 0755); err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("无法创建补丁输出子目录 '%s': %v", targetPatchDir, err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil
  }
  outputPatchPath := filepath.Join(outputAbsDir, patchRelativePath) // 确保补丁的完整输出路径
  patchMetadata.PatchFilePath = outputPatchPath

  // 生成差异包
  var patchBuf bytes.Buffer
  err = binarydist.Diff(bytes.NewReader(oldData), bytes.NewReader(newData), &patchBuf)
  if err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("生成差异包失败 (请确保 bzip2 工具已安装并添加到 PATH): %v", err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil
  }
  patchData := patchBuf.Bytes()
  patchMetadata.PatchFileSize = int64(len(patchData))
  patchMetadata.PatchFileSHA256 = calculateSHA256(patchData)

  // 写入补丁文件
  if err := ioutil.WriteFile(outputPatchPath, patchData, 0644); err != nil {
   patchMetadata.ErrorStatus = fmt.Sprintf("写入补丁文件失败 '%s': %v", outputPatchPath, err)
   log.Printf("错误: %s", patchMetadata.ErrorStatus)
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   return nil
  }

  patchMetadata.CompressionRatio = float64(len(patchData)) / float64(len(newData)) * 100
  patchMetadata.DurationSeconds = time.Since(startTime).Seconds()
  log.Printf("成功: 补丁生成完成! %s -> %s (大小: %.2f KB, 压缩率: %.2f%%, 耗时: %.2f 秒)",
   relativePath, patchMetadata.PatchFilePath, float64(len(patchData))/1024, patchMetadata.CompressionRatio, patchMetadata.DurationSeconds)
  globalManifest.Files = append(globalManifest.Files, patchMetadata)
  globalManifest.PatchCount++
  return nil
 })

 if err != nil {
  log.Fatalf("错误: 遍历新目录时发生致命错误: %v", err)
 }

 // 遍历旧目录中的文件，寻找删除的文件
 err = filepath.Walk(oldAbsDir, func(path string, info os.FileInfo, err error) error {
  if err != nil {
   log.Printf("警告: 访问文件 '%s' 时出错: %v", path, err)
   return nil
  }

  if info.IsDir() {
   return nil // 跳过目录
  }

  // --- 添加白名单检查 START ---
  if isUninstallerFile(info.Name()) {
   log.Printf("信息: 白名单文件，跳过删除检查: %s", info.Name())
   return nil // 跳过，不标记为删除
  }
  // --- 添加白名单检查 END ---

  relativePath, err := filepath.Rel(oldAbsDir, path)
  if err != nil {
   return fmt.Errorf("无法获取相对路径 '%s' 到 '%s': %w", path, oldAbsDir, err)
  }

  if _, exists := newFiles[relativePath]; !exists {
   // 文件在旧版本中存在，但在新版本中不存在 -> 标记为删除
   log.Printf("信息: 发现已删除文件: %s", relativePath)
   fileBytes, _ := ioutil.ReadFile(path) // 尝试读取获取大小和哈希
   patchMetadata := PatchMetadata{
    RelativePath:    relativePath,
    OldFilePath:     path,
    OldFileSize:     int64(len(fileBytes)),
    OldFileSHA256:   calculateSHA256(fileBytes),
    DeletedFileOnly: true,
    GenerationTime:  time.Now().Format(time.RFC3339),
   }
   globalManifest.Files = append(globalManifest.Files, patchMetadata)
   globalManifest.DeletedFileCount++
  }
  return nil
 })

 if err != nil {
  log.Fatalf("错误: 遍历旧目录时发生致命错误: %v", err)
 }

 // 写入全局元数据 JSON 文件
 globalManifest.TotalDuration = time.Since(totalStartTime).Seconds()
 log.Printf("信息: 总耗时: %.2f 秒", globalManifest.TotalDuration)
 log.Printf("信息: 共生成 %d 个补丁，新增 %d 个文件，删除 %d 个文件。", globalManifest.PatchCount, globalManifest.NewFileCount, globalManifest.DeletedFileCount)
 log.Printf("信息: 正在写入全局元数据清单 JSON 文件: %s", globalMetaAbsPath)
 jsonData, err := json.MarshalIndent(globalManifest, "", "  ") // 使用两个空格缩进
 if err != nil {
  log.Fatalf("错误: 无法将全局清单编码为 JSON: %v", err)
 }

 if err := ioutil.WriteFile(globalMetaAbsPath, jsonData, 0644); err != nil {
  log.Fatalf("错误: 无法写入全局元数据清单 JSON 文件 '%s': %v", globalMetaAbsPath, err)
 }
 log.Printf("成功: 全局元数据清单 JSON 文件已写入: %s", globalMetaAbsPath)
 log.Println("Patch Maker: 目录差异生成器运行完毕。")
}

// calculateSHA256 计算字节切片的 SHA256 哈希
func calculateSHA256(data []byte) string {
 hash := sha256.Sum256(data)
 return hex.EncodeToString(hash[:])
}

// calculateFileSHA256 计算文件的 SHA256 哈希值
func calculateFileSHA256(filePath string) (string, error) {
 f, err := os.Open(filePath)
 if err != nil {
  return "", fmt.Errorf("无法打开文件 '%s': %w", filePath, err)
 }
 defer f.Close()

 hasher := sha256.New()
 if _, err := io.Copy(hasher, f); err != nil {
  return "", fmt.Errorf("无法计算文件 '%s' 哈希值: %w", filePath, err)
 }
 return hex.EncodeToString(hasher.Sum(nil)), nil
}

// getVersion 从文件名中提取版本号（简单示例，对目录差异生成器不常用）
func getVersion(filepath string) string {
 return "unknown_version"
}


```

2. 使用

```shell
//打包成exe文件 
go build -o patch_maker.exe patch_maker.go
// 运行脚本

 .\patch_maker.exe `
  -old-dir 'D:\App\测试静默安装' `
  -new-dir 'D:\code\test_flutter\build\windows\x64\runner\Release' `
  -output-dir "D:\UpdatePatches\v1.0.0_to_v1.0.1" `
  -global-meta "D:\UpdatePatches\v1.0.0_to_v1.0.1\manifest.json"

```

|名称|解释|
|------|------|
|`-old-dir`|旧版本的文件目录|
|`-new-dir`|新版本的文件目录|
|`-output-dir`|输出差异包的目录|
|`-global-meta`|生成差异信息json|

#### 安装差量更新包

以flutter Windows端为例

1. 下载更新包

```dart
 final fileName = Constants.renderDownloadZip;
String fileUrl = await getFileUrl(widget.downloadId.first ?? "");
// 获取临时目录
final tempDir = await getTemporaryDirectory();
final zipPath = path.join(tempDir.path, fileName);
await _downloader.downloadFile(
fileUrl: fileUrl,
fileName: fileName,
savePath: zipPath,
onCancel: () {},
onProgress: (received, total, speed) {
    //下载进度
    setState(() {
    _downloadProgress =
        total > 0 ? received / total : 0;
    _downloadStatus =
        "下载中 ${(_downloadProgress * 100).toStringAsFixed(1)}%";
    _networkSpeed = "${speed.toStringAsFixed(1)}KB/s";
    });
},
onSuccess:(path){}//下载成功之后的回调
)
```

2. 解压安装

此步骤是在上面下载成功的回调内操作

```dart
///存放解压文件夹
final extractDir = Directory(path.join(tempDir.path, Constants.renderUnzipDir));
if (extractDir.existsSync()) {
extractDir.deleteSync(recursive: true); // 清理旧文件
}
extractDir.createSync(recursive: true);
setState(() {
_extractDir = extractDir;
});
///开始解压 
await for (final progress
    in Common.extractFileWithProgress(
zipPath,
extractDir.path,
)) {
setState(() {
    _downloadProgress = progress;
    _downloadStatus =
        "解压中: ${(progress * 100).toStringAsFixed(1)}%";
    if (progress >= 1) {
    _installTarget = true;
    }
});
}
```

3. 安装

```dart
  static void updateRenderer({
    required VoidCallback onSuccess,
    required VoidCallback? onError,
  }) async {
    String? exeFile =
        await getRenderUpdaterPath(exeName: Constants.renderUpdaterExe);
    final appMainDir = Directory(path.dirname(Platform.resolvedExecutable));

    final renderAppInstallDir =
        path.join(appMainDir.path, Constants.renderInstallDir);
    final renderAppExePath =
        path.join(renderAppInstallDir, Constants.renderLauncherExe);
    final tempDir = await getTemporaryDirectory();
    final patchFilePath = path.join(tempDir.path, Constants.renderUnzipDir);
    final manifestFilePath = path.join(patchFilePath, 'manifest.json');

    ///尝试关闭应用
    try {
      final killResult = await Process.run(
          'taskkill', ['/F', '/IM', Constants.renderLauncherExe]);
      if (kDebugMode) {
        print('taskkill stdout: ${killResult.stdout}');
      }
      if (kDebugMode) {
        print('taskkill stderr: ${killResult.stderr}');
      }
      if (killResult.exitCode != 0 && killResult.exitCode != 128) {
        // 128 表示进程未找到
        if (kDebugMode) {
          print(
              '警告: 无法强制关闭 B 应用 (退出码: ${killResult.exitCode})。请确保 ${Constants.renderLauncherExe}已关闭。');
        }
        return;
      }
      await Future.delayed(const Duration(seconds: 2));
      if (kDebugMode) {
        print('B 应用已关闭或未运行，继续更新...');
      }
    } catch (e) {
      if (kDebugMode) {
        print('错误: 尝试关闭进程时发生异常: $e');
      }
      return;
    }

    ///验证 manifest
    try {
      final String manifestContent =
          await File(manifestFilePath).readAsString();
      final GlobalPatchManifest manifest =
          GlobalPatchManifest.fromJson(json.decode(manifestContent));
      if (kDebugMode) {
        print('本地清单文件解析成功，包含 ${manifest.files.length} 个文件更新信息。');
      }
      // 可以在这里进一步验证 manifest 中的文件是否存在于 localPatchSourceDir
    } catch (e) {
      if (kDebugMode) {
        print('错误: 无法解析本地 manifest.json 文件: $e');
        print(
            '请确保 $manifestFilePath 是一个有效的 JSON 文件，并且其结构与 Go PatchMetadata/GlobalPatchManifest 匹配。');
      }
      onError?.call();
      return;
    }

    ///安装
    final arguments = [
      '-install-dir', renderAppInstallDir, // B 应用的安装根目录
      '-manifest', manifestFilePath, // 本地下载的 manifest.json 文件的路径
      '-download-dir', patchFilePath, // 本地补丁和新增文件所在的根目录
    ];
    // 以管理员权限运行
    try {
      final psCommand = "Start-Process -FilePath '${exeFile ?? ''}' "
          "-ArgumentList '${arguments.join(' ')}' "
          "-Verb RunAs -WindowStyle Hidden -Wait";

      if (kDebugMode) {
        print('执行命令: powershell -Command "$psCommand"');
      }

      final result = await Process.run('powershell.exe',
          ['-ExecutionPolicy', 'Bypass', '-Command', psCommand]);

      if (result.exitCode != 0) {
        if (kDebugMode) {
          print('stderr: ${result.stderr}');
          print('stdout: ${result.stdout}');
        }
        onError?.call();
        throw Exception('更新失败 (代码 ${result.exitCode})');
      }
      onSuccess.call();
      infoManager.toast("更新成功！");
    } catch (e) {
      onError?.call();
      if (kDebugMode) {
        print('更新错误: $e');
      }
    }
  }

```
