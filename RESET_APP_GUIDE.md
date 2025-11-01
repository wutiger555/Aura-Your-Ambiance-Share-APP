# 如何重置 App 查看歡迎動畫流程

## 方法 1: 在 App 內使用 Settings 重置（推薦）

1. 打開 App
2. 點擊左上角的 ⚙️ Settings 按鈕
3. 滾動到底部
4. 點擊紅色的 "Reset Locations" 按鈕
5. 確認重置
6. App 會回到歡迎畫面，你就可以看到完整的動畫流程了

## 方法 2: 清除 App 資料（iOS 模擬器）

### 在 iOS 模擬器中：

```bash
# 1. 停止 app
# 在終端按 Ctrl+C 停止 expo

# 2. 清除 AsyncStorage (這會刪除所有儲存的位置資料)
cd "apps/mobile"
npx expo start --clear

# 3. 或者完全重置模擬器
# 在模擬器選單中: Device -> Erase All Content and Settings
```

### 在實體 iPhone 上：

1. 長按 Aura app 圖示
2. 選擇「移除 App」
3. 確認刪除
4. 重新從 Expo Go 或 TestFlight 安裝

## 方法 3: 使用 React Native Debugger 手動清除

```bash
# 在開發模式中
# 1. 搖晃手機或在模擬器中按 Cmd+D (iOS) 或 Cmd+M (Android)
# 2. 選擇 "Debug"
# 3. 在瀏覽器 console 中執行:
AsyncStorage.clear()

# 4. 重新載入 app (Cmd+R)
```

## 動畫流程說明

重置後，你應該會看到這個流程：

### 1. 歡迎畫面 (Intro)
- 顯示 Aura logo
- 標語："Feel your atmosphere, instantly"
- "Get Started" 按鈕

### 2. 輸入你的位置
- 背景有星空
- 輸入城市名稱（例如：Taipei）
- 點擊 Continue
- **第一顆藍綠色星星會在左邊亮起並彈跳** ⭐

### 3. 輸入對方的位置  
- 仍然有星空背景
- **第一顆星星保持發光**
- 輸入第二個城市名稱（例如：Tokyo）
- 點擊 Continue
- **第二顆粉紅色星星會在右邊亮起並彈跳** ⭐

### 4. 星星合併動畫
- 兩顆星星會飛向中間
- 星星消失
- **Aura logo 出現並放大**

### 5. ConnectionIntro 動畫
- 全螢幕的連接動畫
- 持續約 2-3 秒

### 6. 進入主畫面
- 顯示天氣、時間資訊
- 兩個位置的 AuraGlobe
- 可以使用 Settings 和 Time Bridge

## 疑難排解

### 如果看不到星星動畫：

1. **確認你在正確的步驟**
   - 星星只在「輸入位置」步驟顯示
   - 不是在歡迎畫面 (intro)

2. **檢查是否已經設置過**
   - 如果已經設置過位置，不會看到動畫
   - 需要先重置（方法1最簡單）

3. **檢查 console 錯誤**
   ```bash
   # 在終端查看是否有錯誤訊息
   npx expo start
   ```

4. **重新安裝依賴**
   ```bash
   cd apps/mobile
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

### 如果動畫卡住或不完整：

1. **重新載入 app**
   - iOS 模擬器：Cmd+R
   - 實體設備：搖晃手機 -> Reload

2. **檢查動畫設定**
   - 確認 `ANIMATION_DURATIONS` 和 `MARKER_CONFIG` 正確載入

3. **清除快取並重啟**
   ```bash
   npx expo start --clear
   ```

## 開發模式測試

如果你想快速測試動畫，可以在 Settings 中：
1. Reset Locations
2. 立即回到歡迎流程
3. 不需要重新安裝 app
