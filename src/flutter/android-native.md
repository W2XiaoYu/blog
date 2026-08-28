---
layout: doc
title: 安卓原生
---

# 安卓原生

有些能力隔着 Flutter 插件并不好处理，直接补一小段 Android 原生代码反而更省事。这里记录 OAID 获取和返回键退出两个例子。

## 获取 OAID

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

Flutter 侧通过同名 MethodChannel 调用：

```dart
class OAID {
  static const MethodChannel _channel = MethodChannel('device_identity');
  static Future<String> getOAID() async {
    return await _channel.invokeMethod('getOAID') ?? "";
  }
}
```

## 连续按两次返回键退出应用

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
