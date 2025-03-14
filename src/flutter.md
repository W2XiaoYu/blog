
# Flutter

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

```

## 安卓端获取OAID问题

```kt

//app\build.gradle 文件添加
dependencies {
    implementation("com.github.gzu-liyujiang:Android_CN_OAID:4.2.7")
}
//在build.gradle添加
repositories {
    google()
    mavenCentral()
    maven { url 'https://developer.huawei.com/repo/' }
    maven { url 'https://jitpack.io' }
}

//kotlin文件夹中的MainActivity文件中加
import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
class MainActivity : FlutterActivity() {
    private val deviceIdentityUtil by lazy { DeviceIdentityUtil(this) }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "device_identity").apply {
            setMethodCallHandler { call, result ->
                when (call.method) {
                    "getOAID" -> {//获取oaid
                        deviceIdentityUtil.getOAID {
                            result.success(it)
                        }
                    }
                    //跳转微信原生方法
                    "startLink" -> {
                        startLink(call.arguments.toString())
                        result.success(null)
                    }
                }
            }
        }
    }

    private fun startLink(link: String?) {
        Intent(Intent.ACTION_VIEW).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            data = Uri.parse(link ?: "")
            startActivity(this)
        }
    }
}

//在上文件同级下 创建DeviceIdentityUtil
import android.content.Context
import com.github.gzuliyujiang.oaid.DeviceID
import com.github.gzuliyujiang.oaid.IGetter


class DeviceIdentityUtil(private val context: Context) {
    fun getOAID(callback: (result: String) -> Unit) {
        DeviceID.getOAID(context, object : IGetter {
            override fun onOAIDGetComplete(result: String?) {
                callback(result ?: "")
            }

            override fun onOAIDGetError(error: Exception) {
                callback("")
            }
        })
    }
}
```

在flutter代码中调用

```dart
class OAID {
  static const MethodChannel _channel = MethodChannel('device_identity');
  static Future<String> getOAID() async {
    return await _channel.invokeMethod('getOAID') ?? "";
  }
}
```

## 安卓端 连续两次返回实现退出应用

```dart
DateTime? _lastPressedAt;
bool canPop = false;

PopScope(
  canPop: canPop,
  onPopInvokedWithResult: (didPop, _) async {
    LoggerUtils.e('返回拦截1111');
    if (AppConfig.isIos()) return;
    if (_currentIndex != 0) {
      setState(() {
        _currentIndex = 0;
      });
      _pageController.jumpToPage(0);
      return;
    }
    if (_lastPressedAt == null ||
        DateTime.now().difference(_lastPressedAt!) >
            const Duration(seconds: 2)) {
      // 两次点击间隔超过 2 秒或者是第一次点击
      _lastPressedAt = DateTime.now();
      showToast(message: '再次按返回键将退出应用');
    } else {
      _lastPressedAt = null;
      // 两次点击间隔小于 2 秒，退出应用
      Commons.exitApp();
    }
  },
  child:....
  )
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
