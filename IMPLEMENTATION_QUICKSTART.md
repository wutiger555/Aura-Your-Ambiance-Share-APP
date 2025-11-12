# 🚀 AlarmKit 整合实施 - 快速开始

## ⚡ 快速实施指南

### 前提条件

- ✅ macOS 14.0+ (运行 Xcode)
- ✅ Xcode 26.0+ (包含 iOS 26 SDK)
- ✅ Node.js 18.0+
- ✅ iPhone with iOS 26+ (用于测试)

---

## 方法 1: 自动化脚本（推荐）

我已经创建了自动化脚本来简化前几个步骤：

```bash
# 在项目根目录运行
cd /home/user/Aura-Your-Ambiance-Share-APP
./scripts/implement-alarmkit.sh
```

脚本会自动完成：
1. ✅ 检查环境依赖
2. ✅ 安装 npm 依赖
3. ✅ 运行 `expo prebuild` 生成原生项目
4. ✅ 准备 Native Module 文件
5. ⚠️ 提示 Xcode 手动步骤
6. ✅ 检查配置完整性

---

## 方法 2: 手动实施步骤

### Step 1: 更新版本和配置

已完成 ✅：
- `app.json` 版本更新至 2.8.0
- 添加 AlarmKit Config Plugin
- 设置 iOS deploymentTarget 为 26.0

### Step 2: 生成原生 iOS 项目

```bash
cd apps/mobile
npx expo prebuild --platform ios --clean
```

这会生成完整的 iOS 项目文件，包括：
- `ios/Aura.xcworkspace`
- `ios/Podfile`
- `ios/Aura/Info.plist`

### Step 3: 在 Xcode 中添加 Native Module

1. **打开 Xcode 项目：**
   ```bash
   cd apps/mobile/ios
   open Aura.xcworkspace
   ```

2. **添加 Swift 文件：**
   - 右键点击 `Aura` 项目 → "Add Files to Aura..."
   - 选择 `ios/Modules/` 文件夹中的文件：
     - `AuraAlarmKitModule.swift`
     - `AuraAlarmKitModule.m`
   - ✅ 勾选 "Copy items if needed"
   - ✅ 勾选 "Create groups"
   - ✅ Target: `Aura`

3. **配置 Bridging Header：**
   - Select `Aura` target → Build Settings
   - 搜索 "Objective-C Bridging Header"
   - 设置为: `Aura/Aura-Bridging-Header.h`
   - Xcode 会自动创建文件

### Step 4: 创建 Widget Extension

1. **创建新 Target：**
   - File → New → Target
   - 选择 "Widget Extension"
   - 配置：
     - Product Name: `AlarmCountdownWidget`
     - Language: Swift
     - ❌ 取消勾选 "Include Configuration Intent"
   - 点击 Finish → Activate

2. **添加 Widget 代码：**
   - 删除默认的 `AlarmCountdownWidget.swift`
   - 添加 `ios/AlarmCountdownWidget/AlarmCountdownWidget.swift`
   - ✅ 确保添加到 `AlarmCountdownWidget` target

3. **配置 Widget Info.plist：**
   - 打开 `ios/AlarmCountdownWidget/Info.plist`
   - 验证包含以下键：
     ```xml
     <key>NSExtension</key>
     <dict>
         <key>NSExtensionPointIdentifier</key>
         <string>com.apple.widgetkit-extension</string>
     </dict>
     <key>MinimumOSVersion</key>
     <string>26.0</string>
     ```

### Step 5: 更新 Podfile

在 `ios/Podfile` 末尾添加：

```ruby
target 'AlarmCountdownWidget' do
  inherit! :search_paths
end
```

然后运行：

```bash
cd apps/mobile/ios
pod install
```

### Step 6: 验证配置

检查 `ios/Aura/Info.plist` 包含：

```xml
<key>NSAlarmKitUsageDescription</key>
<string>Aura schedules alarms to help you connect with your partner across timezones at the perfect moment. These alarms will work even when your device is in Silent Mode or Do Not Disturb.</string>
```

（应该由 Config Plugin 自动添加）

---

## 🧪 测试实施

### 在 iOS Simulator 测试（基础功能）

```bash
cd apps/mobile
npm run mobile
# 按 'i' 打开 iOS Simulator
```

**注意：** AlarmKit 在 Simulator 中功能有限，需要真机测试完整功能。

### 在 iPhone 真机测试（完整功能）

1. **连接 iPhone (iOS 26+)** 到 Mac via USB

2. **在 Xcode 中配置签名：**
   - Select `Aura` target
   - Signing & Capabilities → Team: 选择你的开发团队
   - 对 `AlarmCountdownWidget` target 重复

3. **选择设备并运行：**
   - Xcode 顶部选择你的 iPhone
   - 点击 Run (▶️)

4. **测试 AlarmKit 功能：**
   - ✅ 启动 app，检查控制台输出 AlarmKit capabilities
   - ✅ 创建新闹钟
   - ✅ 应该看到系统提示："Aura Would Like to Schedule Alarms"
   - ✅ 点击 "Allow"
   - ✅ 验证闹钟创建成功（检查 `alarmKitID` 字段）
   - ✅ 设置闹钟为 1-2 分钟后
   - ✅ 锁定 iPhone
   - ✅ 验证全屏闹钟显示（带 Aura 品牌）
   - ✅ 测试 Silent Mode：开启静音，闹钟仍应响铃
   - ✅ 测试 Do Not Disturb：开启勿扰，闹钟仍应响铃

---

## 🔍 故障排除

### "AlarmKit module not found"

**解决方案：**
1. 确认 Swift 文件已添加到 Xcode 项目
2. Clean build folder: Cmd+Shift+K
3. 重新构建

### "Undefined symbol: _AlarmManager"

**解决方案：**
1. 检查 iOS Deployment Target = 26.0
2. 确认使用 Xcode 26+
3. 验证 `import AlarmKit` 在 Swift 文件中

### Widget Extension 不显示

**解决方案：**
1. 确认 Widget target 已激活
2. 检查 Widget deployment target = 26.0
3. 在真机上测试（Simulator 支持有限）

### Config Plugin 没有添加权限

**解决方案：**
```bash
cd apps/mobile
npx expo prebuild --clean
```

---

## 📊 实施检查清单

在继续之前，确认以下所有步骤：

### 自动化步骤 ✅
- [x] app.json 更新至 v2.8.0
- [x] 添加 AlarmKit Config Plugin
- [x] 设置 iOS deploymentTarget: 26.0
- [x] 创建所有 TypeScript 代码文件
- [x] 创建所有 Native Swift 代码文件
- [x] 创建 Widget 代码
- [x] 创建实施脚本

### 手动步骤（需要在 Xcode 中完成）⏳
- [ ] 运行 `expo prebuild`
- [ ] 在 Xcode 中添加 Swift Native Module 文件
- [ ] 配置 Bridging Header
- [ ] 创建 Widget Extension target
- [ ] 添加 Widget 代码
- [ ] 更新 Podfile
- [ ] 运行 `pod install`
- [ ] 在真机上测试

---

## 🎯 下一步

完成实施后：

1. **测试所有功能**（见上方测试清单）
2. **创建 Pull Request**
3. **更新 CHANGELOG.md**
4. **准备 TestFlight Build**
5. **收集用户反馈**

---

## 📚 相关文档

- **完整架构设计：** `/docs/ALARMKIT_INTEGRATION.md`
- **详细实施指南：** `/docs/ALARMKIT_IMPLEMENTATION_GUIDE.md`
- **执行摘要：** `/docs/ALARMKIT_SUMMARY.md`

---

## 💬 需要帮助？

如果遇到问题：
1. 查看 `/docs/ALARMKIT_IMPLEMENTATION_GUIDE.md` 的故障排除部分
2. 检查 Xcode 控制台错误信息
3. 验证所有步骤都已完成

---

**预计完成时间：** 2-4 小时（首次配置）

**祝实施顺利！** 🚀
