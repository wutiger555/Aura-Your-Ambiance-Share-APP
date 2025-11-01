# 動畫除錯指南

## 快速測試步驟

### 1. 最簡單的方法：使用 Settings 重置

**在 App 中：**
1. 點擊左上角 ⚙️ (Settings 按鈕)
2. 滾動到最底部
3. 點擊 "Reset Locations" (紅色按鈕)
4. 點擊 "Reset" 確認
5. 你會立即回到歡迎畫面

### 2. 檢查動畫流程

**步驟 A - 歡迎畫面：**
- ✅ 你應該看到：
  - Aura logo 圖片
  - "Feel your atmosphere, instantly"
  - "Get Started" 按鈕
- ❌ 這個畫面**不會有**星星動畫

**步驟 B - 輸入第一個地點 (Your Location)：**
1. 點擊 "Get Started"
2. 輸入城市名稱，例如 "Taipei"
3. 點擊 "Continue"
4. ✅ **現在應該會看到左邊有一顆藍綠色星星亮起來**
   - 星星會從小變大再回到正常大小
   - 星星會持續發光
5. 畫面會自動切換到下一步

**步驟 C - 輸入第二個地點 (Partner's Location)：**
1. 你會看到第一顆星星還在左邊發光
2. 輸入第二個城市，例如 "Tokyo"  
3. 點擊 "Continue"
4. ✅ **現在應該會看到右邊有一顆粉紅色星星亮起來**
   - 同樣會有彈跳動畫
5. **等待 1 秒...**

**步驟 D - 星星合併：**
1. ✅ 兩顆星星會縮小並消失
2. ✅ Aura logo 會在中間出現並放大
3. **等待 1.5 秒...**

**步驟 E - ConnectionIntro 動畫：**
1. ✅ 會看到全螢幕的連接動畫
2. 持續約 2 秒

**步驟 F - 主畫面：**
1. ✅ 顯示天氣資訊
2. ✅ 可以看到兩個 AuraGlobe
3. ✅ Settings 按鈕在左上角
4. ✅ DST 指示器在左側

## 常見問題

### Q: 我看不到星星？

**A: 可能的原因：**

1. **你已經在主畫面了**
   - 星星只在初次設置時顯示
   - 解決方法：使用 Settings -> Reset Locations

2. **你在歡迎畫面 (Intro)**
   - Intro 畫面不會有星星
   - 星星只在「輸入位置」時才會出現
   - 解決方法：點擊 "Get Started"

3. **動畫還沒觸發**
   - 星星會在你輸入城市並點擊 Continue **之後**才亮起
   - 不是在你輸入的時候

4. **App 需要重新載入**
   - 在模擬器按 Cmd+R 重新載入
   - 或搖晃手機選擇 Reload

### Q: 星星出現了但沒有動畫？

**A: 檢查以下：**

1. **確認你有等待足夠時間**
   - 動畫需要大約 800ms
   - 不要立即進行下一步

2. **檢查 console 是否有錯誤**
   ```bash
   # 在執行 expo start 的終端查看
   ```

3. **重新啟動 app**
   ```bash
   # 停止當前的 expo (Ctrl+C)
   cd apps/mobile
   npx expo start --clear
   ```

### Q: 動畫卡住了？

**A: 試試這些：**

1. **重新載入 app**
   - iOS: Cmd+R
   - Android: 雙擊 R

2. **完全重啟**
   ```bash
   # 停止 expo
   # Ctrl+C
   
   # 清除並重啟
   npx expo start --clear
   ```

3. **重置到歡迎畫面**
   - 使用 Settings -> Reset Locations

## 驗證動畫是否正常工作

### 檢查清單：

- [ ] 可以看到歡迎畫面的 logo
- [ ] 點擊 Get Started 後可以輸入城市
- [ ] 輸入第一個城市後，左邊出現藍綠色星星
- [ ] 星星有彈跳動畫（變大再變小）
- [ ] 自動切換到第二個輸入畫面，第一顆星星還在
- [ ] 輸入第二個城市後，右邊出現粉紅色星星
- [ ] 兩顆星星縮小並飛向中間
- [ ] Logo 在中間出現並放大
- [ ] 顯示 ConnectionIntro 全螢幕動畫
- [ ] 進入主畫面，顯示天氣資訊

## 詳細的重新開始步驟

### 方法 1: 在 App 內重置（最快）

```
1. 在主畫面
2. 點左上角 ⚙️
3. 滾到底部
4. "Reset Locations" -> "Reset"
5. 完成！回到歡迎畫面
```

### 方法 2: 清除快取重啟

```bash
cd "/Users/tzuhuiwu/Documents/Redmine Dashboard/Redmine-UAT-Dashboard/Aura-Your-Ambiance-Share-APP/apps/mobile"

npx expo start --clear
```

### 方法 3: 如果還是不行

```bash
# 1. 停止 expo (Ctrl+C)

# 2. 完全清除
cd "/Users/tzuhuiwu/Documents/Redmine Dashboard/Redmine-UAT-Dashboard/Aura-Your-Ambiance-Share-APP/apps/mobile"
rm -rf node_modules
npm install

# 3. 重啟
npx expo start --clear
```

## 預期的時間軸

- **Intro 畫面**: 靜態顯示，等待用戶點擊
- **輸入位置 1**: 輸入 → 點擊 Continue → **星星 1 亮起 (800ms)** → 等待 1 秒 → 切換
- **輸入位置 2**: 輸入 → 點擊 Continue → **星星 2 亮起 (800ms)** → 等待 1 秒 → **星星合併 (1000ms)** → **Logo 出現 (800ms)** → 等待 1.5 秒
- **ConnectionIntro**: 全螢幕動畫 (2000ms)
- **主畫面**: 載入完成

總時長大約 **7-8 秒**（不包含用戶輸入時間）

## 如果還是有問題

請檢查終端的錯誤訊息並提供：
1. 你在哪個步驟卡住了？
2. Console 有什麼錯誤訊息？
3. 是否有看到任何動畫？
