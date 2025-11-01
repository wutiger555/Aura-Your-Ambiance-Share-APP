# 🚀 快速重置 App 的 3 種方法

## 方法 1: 重新啟動 Expo (最簡單！)

在終端執行：

```bash
# 進入 mobile 目錄
cd "/Users/tzuhuiwu/Documents/Redmine Dashboard/Redmine-UAT-Dashboard/Aura-Your-Ambiance-Share-APP/apps/mobile"

# 停止當前的 expo (Ctrl+C)
# 然後執行：
npx expo start --clear
```

然後在 app 中：
1. 搖晃設備（或在模擬器按 Cmd+D）
2. 選擇 "Reload"

## 方法 2: 在 App 開發選單中清除

1. **打開開發選單：**
   - iOS 模擬器：按 `Cmd + D`
   - 實體 iPhone：搖晃手機
   - Android 模擬器：按 `Cmd + M`

2. **選擇 "Debug"**

3. **在瀏覽器 Console 中執行：**
   ```javascript
   AsyncStorage.clear().then(() => {
     console.log('Storage cleared!');
   });
   ```

4. **回到 app，重新載入：**
   - 搖晃設備 -> "Reload"
   - 或模擬器按 `Cmd + R`

## 方法 3: 使用修復後的 Settings (現在應該可以滾動了)

Settings 已經修復，現在應該可以滾動了：

1. 打開 App
2. 點左上角 ⚙️ Settings
3. **向下滾動**（現在可以滾動了！）
4. 點擊紅色的 "Reset Locations"
5. 確認 "Reset"

## 方法 4: 完全重置模擬器（最徹底）

### iOS 模擬器：
```
模擬器選單 -> Device -> Erase All Content and Settings
```

### Android 模擬器：
```
模擬器選單 -> Settings -> Apps -> Aura -> Storage -> Clear Data
```

## ⚡ 推薦順序

1. **先試方法 1**（清除快取重啟）- 最快最簡單
2. 如果不行，試**方法 3**（Settings 現在可以滾動了）
3. 還是不行，試**方法 2**（開發選單清除）
4. 最後才用**方法 4**（完全重置）

## 驗證是否成功重置

重置後，你應該會看到：
✅ Aura logo 的歡迎畫面
✅ "Feel your atmosphere, instantly"
✅ "Get Started" 按鈕

如果看到這個畫面，代表重置成功！
