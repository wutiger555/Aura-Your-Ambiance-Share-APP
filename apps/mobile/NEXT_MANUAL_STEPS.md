# ✅ Expo Prebuild 完成！下一步操作

## 🎉 已自动完成

- ✅ iOS 项目已生成（`ios/Aura.xcodeproj`）
- ✅ AlarmKit 权限已添加到 Info.plist
- ✅ Native Module 文件已创建
  - `ios/Aura/Modules/AuraAlarmKitModule.swift`
  - `ios/Aura/Modules/AuraAlarmKitModule.m`
- ✅ Bridging Header 已自动创建
- ✅ Podfile 已生成

## 🔧 需要在 Mac/Xcode 中完成的步骤

### ⚠️ 重要提醒
以下步骤**必须在 macOS 上的 Xcode 中完成**。这是一次性配置，完成后就可以继续用 React Native 开发了。

---

### Step 1: 打开 Xcode 项目

```bash
cd /home/user/Aura-Your-Ambiance-Share-APP/apps/mobile/ios
open Aura.xcodeproj
```

（如果有 `Aura.xcworkspace`，优先打开 workspace）

---

### Step 2: 添加 Native Module 文件到 Xcode

1. **在 Xcode 左侧项目导航器中**：
   - 找到 `Aura` 项目（蓝色图标）
   - 右键点击 `Aura` 文件夹（黄色文件夹图标）
   - 选择 `Add Files to "Aura"...`

2. **选择文件**：
   - 导航到 `ios/Aura/Modules/` 目录
   - 选中以下两个文件：
     - ✅ `AuraAlarmKitModule.swift`
     - ✅ `AuraAlarmKitModule.m`

3. **配置选项**：
   - ✅ **勾选** "Copy items if needed"
   - ✅ **勾选** "Create groups"
   - ✅ **Target:** 确保 "Aura" 被选中
   - 点击 **Add**

---

### Step 3: 验证 Bridging Header

1. 选择 `Aura` target（顶部）
2. 点击 `Build Settings` 标签
3. 搜索框输入 "bridging"
4. 找到 `Objective-C Bridging Header`
5. 确认值为：`Aura/Aura-Bridging-Header.h`

（Expo 应该已经自动配置好了）

---

### Step 4: 设置 iOS Deployment Target

1. 选择 `Aura` target
2. `General` 标签
3. **Minimum Deployments** → `iOS 26.0`

（这确保可以使用 AlarmKit framework）

---

### Step 5: 安装 CocoaPods 依赖（在 Mac 上）

```bash
cd ios
pod install
```

完成后，关闭 Xcode，重新打开：
```bash
open Aura.xcworkspace  # 注意是 .xcworkspace，不是 .xcodeproj
```

---

### Step 6: 构建项目

1. 在 Xcode 中选择一个模拟器或真机
2. 点击 ▶️ Run 按钮
3. **首次构建可能需要几分钟**

**预期结果：**
- ✅ 构建成功
- ✅ App 启动
- ✅ 控制台显示：`"AlarmKit capabilities: ..."`

---

## 🧪 测试 AlarmKit（需要真机）

### ⚠️ 重要：AlarmKit 只能在真机上完整测试

iOS Simulator 限制：
- ❌ 无法穿透 Silent Mode
- ❌ 无法显示全屏闹钟
- ❌ 无法测试 Dynamic Island

**真机测试步骤：**

1. **连接 iPhone (iOS 26+)** 到 Mac
2. **在 Xcode 中**：
   - 顶部选择你的 iPhone 设备
   - 配置签名：`Signing & Capabilities` → 选择你的 Team
   - 点击 ▶️ Run

3. **创建测试闹钟**：
   - 启动 App
   - 进入闹钟功能
   - 创建新闹钟
   - **应该看到系统提示："Aura Would Like to Schedule Alarms"**
   - 点击 **Allow**

4. **测试系统级能力**：
   - 设置闹钟为 1-2 分钟后
   - **开启 Silent Mode**
   - 锁定 iPhone
   - 等待闹钟触发
   - ✅ **验证：闹钟应该在 Silent Mode 下响铃**
   - ✅ **验证：显示全屏 Aura 品牌闹钟界面**

---

## 📱 可选：创建 Widget Extension（Live Activities）

如果你想要 Dynamic Island 倒数计时功能：

### 在 Xcode 中创建 Widget Extension

1. **File** → **New** → **Target**
2. 选择 **Widget Extension**
3. 配置：
   - Product Name: `AlarmCountdownWidget`
   - Language: **Swift**
   - ❌ 取消勾选 "Include Configuration Intent"
4. 点击 **Finish** → **Activate**

### 添加 Widget 代码

1. 删除自动生成的 `AlarmCountdownWidget.swift`
2. 创建 Widget 代码文件（见 `/docs/ALARMKIT_INTEGRATION.md`）
3. 配置 Widget Info.plist

**注意：** Widget Extension 是可选的，核心闹钟功能不需要它。

---

## ✅ 完成后

### 如何验证集成成功？

1. **App 成功构建并运行** ✅
2. **控制台输出：** `"AlarmKit capabilities: { isAvailable: true, ...}"` ✅
3. **创建闹钟时看到系统授权提示** ✅
4. **闹钟在 Silent Mode 下能响** ✅

### 接下来做什么？

**恭喜！🎉 AlarmKit 集成完成！**

现在你可以：
1. **继续用 React Native 开发**：99% 的工作量仍然是 TypeScript
2. **开发闹钟功能**：修改 `apps/mobile/src/components/aura/` 中的组件
3. **测试业务逻辑**：使用 `npm run mobile` 和 Hot Reload

**Native 代码基本不需要再动了**，除非要添加新的 AlarmKit API 接口。

---

## 🐛 常见问题

### Q: "AlarmKit module not found"

**解决方案：**
1. 确认 Swift 文件已添加到 Xcode 项目
2. Clean Build Folder: `Cmd+Shift+K`
3. 重新构建

### Q: "Undefined symbol: _AlarmManager"

**解决方案：**
1. 检查 iOS Deployment Target = 26.0
2. 确认使用的是支持 iOS 26 SDK 的 Xcode 版本

### Q: 构建失败："No such module 'AlarmKit'"

**解决方案：**
- AlarmKit 只在 iOS 26+ SDK 中可用
- 确保使用 Xcode 16+ (包含 iOS 26 SDK)
- 如果 SDK 不可用，代码会自动降级到 expo-notifications

### Q: 我不想在 Simulator 上测试，可以跳过吗？

**可以！**
- 完成 Xcode 配置后
- 直接在真机上测试
- Simulator 上的基础构建测试是可选的

---

## 📚 参考文档

- **详细实施指南：** `/docs/ALARMKIT_IMPLEMENTATION_GUIDE.md`
- **完整架构文档：** `/docs/ALARMKIT_INTEGRATION.md`
- **快速开始：** `/IMPLEMENTATION_QUICKSTART.md`

---

## 💡 温馨提示

### 这是一次性配置
完成这些步骤后，你不需要每次都用 Xcode。日常开发流程：

```bash
# 像往常一样开发
npm run mobile
# Hot reload 正常工作
# 修改 TypeScript 代码
# 测试业务逻辑
```

只有在以下情况才需要回到 Xcode：
- 添加新的 Native API
- 更新 Widget UI
- 修改 Xcode 项目配置

**99% 的开发仍然是 React Native/TypeScript！** 🎉

---

**当前状态：** ✅ 准备好在 Xcode 中配置
**下一步：** 在 Mac 上打开 Xcode 并按照上述步骤操作
**预计时间：** 30-60 分钟（首次配置）
