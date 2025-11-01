# Mobile-Web 同步改善文檔

## 📅 建立日期
2025-11-01

## 🎯 目標
將 Mobile App 的視覺效果和佈局恢復到與 Web App 一致，保留核心動畫和特效，同時優化效能。

---

## 📊 現況分析

### Web App 核心特色（需要保留的元素）

#### 1. 初始畫面 (ConnectionIntro)
- ✅ **Logo 動畫**: SVG logo with draw-ring animation
- ✅ **星空背景**: 動畫星星效果 (parallax scrolling, 200s)
- ✅ **位置標記**: Cyan (我的位置) 和 Pink (對方位置) 的脈衝標記
- ✅ **連接閃光動畫**: 兩個標記之間的連接閃光效果
- ✅ **文字**: "Aura - Reconnecting worlds..."
- ⏱️ **持續時間**: 3 秒

**動畫列表:**
- `starry-sky`: 星空移動動畫
- `marker-appear`: 標記出現動畫
- `connection-flash`: 連接閃光
- `fadeIn`: 文字淡入

#### 2. 主頁面佈局

**Blended Sky System (核心視覺)**
- 上半部: Partner 的天氣漸層
- 下半部: My 的天氣漸層
- CSS mask 實現平滑混合
- 粒子漂浮效果 (優化為 5-10 個粒子)

**AuraGlobe 元件 (位置資訊面板)**
- 位置名稱
- 時鐘 (Clock 元件)
- 溫度 (大字體)
- 天氣圖示 + 描述
- 時間狀態標籤 (Morning, Afternoon 等)
- 日出/日落時間

**CelestialSky (天體動畫)**
- 太陽/月亮動畫路徑
- 根據真實時間計算位置
- Easing function 實現自然移動
- 動態顏色 (太陽: 黃色, 月亮: 銀白色)

**Heartline (連接線)**
- SVG 曲線連接兩個位置
- 互動按鈕顯示:
  - 距離 (公里)
  - 時差 (小時)
- 可點擊開啟 TimeBridge modal

#### 3. 動畫效果清單

**需要實作的動畫:**
- `fadeIn`: 基本淡入 (✅ 優先)
- `fadeInUp`: 淡入 + 上移 (✅ 優先)
- `bobble`: 垂直漂浮效果 (8s) (⚠️ 簡化)
- `pulse-strong`: 脈衝縮放 (2.5s) (✅ 優先)
- `drift`: 粒子移動 (20s, 減少粒子數) (⚠️ 優化)
- `draw-ring`: SVG stroke 動畫 (✅ 優先)
- `marker-appear`: 標記彈出 (✅ 優先)
- `flash-and-fade`: 閃光淡出 (✅ 優先)

**可選的動畫:**
- `shimmer`: 背景位置動畫 (15s) (❌ 跳過)
- `spin-slow`: 慢速旋轉 (30s) (❌ 跳過)
- `move-stars`: 星空視差 (⚠️ 簡化)

### Mobile App 現況

#### 缺少的元素
1. ❌ 動畫 Logo
2. ❌ ConnectionIntro 畫面
3. ❌ 星空背景
4. ❌ 位置標記動畫
5. ❌ 連接閃光效果
6. ❌ 天空混合效果
7. ❌ AuraGlobe 元件
8. ❌ CelestialSky 太陽/月亮動畫
9. ❌ Heartline 連接線
10. ❌ 粒子效果
11. ❌ TimeBridge modal (時間軸視窗)
12. ❌ 天氣圖示動畫

#### 現有的元素
- ✅ 基本漸層背景
- ✅ 位置資訊顯示
- ✅ 時鐘元件
- ✅ 設定功能
- ✅ 重新整理功能
- ✅ Zustand 狀態管理

---

## 🛠️ 實作計劃

### Phase 1: 準備工作
- [x] 建立此文檔
- [x] 安裝必要的套件
  - [x] react-native-reanimated
  - [x] react-native-svg
  - [x] react-native-linear-gradient (已安裝 expo-linear-gradient)
  - [x] @react-native-masked-view/masked-view (for gradient blending)

### Phase 2: 初始畫面重建
- [x] 建立 ConnectionIntro 元件
  - [x] Logo SVG 元件 (AuraLogo)
  - [x] 星空背景動畫
  - [x] 位置標記動畫 (cyan & pink dots)
  - [x] 連接閃光效果
  - [x] 文字淡入動畫
  - [x] 3 秒計時器

### Phase 3: 主頁面佈局重構
- [x] 建立 BlendedSky 系統
  - [x] 雙層漸層設置
  - [x] Masked gradient 混合效果
  - [x] 粒子系統 (8 個粒子，優化版)
- [x] 建立 AuraGlobe 元件
  - [x] 位置名稱顯示
  - [x] 整合 Clock 元件 (支援時區)
  - [x] 溫度顯示
  - [x] 天氣圖示 + 描述
  - [x] 時間狀態標籤
  - [x] 日出/日落時間
- [x] 建立 CelestialSky 元件
  - [x] SVG 路徑繪製
  - [x] 太陽/月亮位置計算
  - [x] 動畫實作 (Reanimated)
  - [x] 顏色切換邏輯
- [x] 建立 Heartline 元件
  - [x] SVG 曲線繪製
  - [x] 距離顯示
  - [x] 時差顯示
  - [x] 點擊事件處理

### Phase 4: 動畫系統
- [x] 設置 Reanimated 動畫
  - [x] fadeIn 動畫
  - [x] fadeInUp 動畫 (FadeInUp from Reanimated)
  - [x] pulse 動畫 (標記脈衝)
  - [x] drift 動畫 (粒子)
  - [x] draw-ring 動畫 (SVG Logo)

### Phase 5: 互動功能
- [x] TimeBridge Modal (時間軸視窗)
  - [x] Modal 容器
  - [x] 24 小時視覺化時間軸
  - [x] 日出/日落標記
  - [x] 關閉按鈕
  - [x] 距離和時差顯示

### Phase 6: 整合與測試
- [x] 整合所有元件到 App.tsx
  - [x] ConnectionIntro 作為初始動畫
  - [x] BlendedSky 作為主背景
  - [x] AuraGlobe 顯示兩地資訊
  - [x] Heartline 互動連接
  - [x] TimeBridge Modal 時間軸
- [ ] 效能優化 (後續步驟)
  - [ ] 減少不必要的重新渲染
  - [ ] 使用 useMemo/useCallback
  - [ ] 動畫使用 native driver (已部分實作)
- [ ] 測試不同裝置
- [ ] 調整動畫參數

---

## 📦 需要安裝的套件

```bash
# React Native Reanimated (動畫庫)
npx expo install react-native-reanimated

# React Native SVG (SVG 支援)
npx expo install react-native-svg

# Masked View (漸層混合)
npx expo install @react-native-masked-view/masked-view
```

---

## 📝 實作進度追蹤

### 2025-11-01

#### ✅ 已完成
- 建立此文檔
- 完成現況分析

#### 🔄 進行中
- 準備開始實作

#### ⏳ 待辦
- 安裝必要套件
- 開始 Phase 2 實作

---

## 🎨 設計決策

### 效能優化考量
1. **粒子數量**: Web 20+ → Mobile 5-10
2. **動畫複雜度**: 簡化 CSS 複雜動畫，使用 native driver
3. **背景效果**: 保留核心視覺，移除過度複雜的效果

### 技術選擇
1. **動畫庫**: react-native-reanimated (效能最佳)
2. **SVG**: react-native-svg (與 web 最接近)
3. **狀態管理**: 保持 Zustand (已實作)

---

## 🔧 技術細節

### Web → Mobile 對應關係

| Web 技術 | Mobile 替代方案 |
|---------|----------------|
| CSS Animation | Reanimated.withTiming/withSpring |
| CSS Keyframes | Reanimated.withRepeat + withSequence |
| CSS Gradient | LinearGradient (expo) |
| CSS Mask | MaskedView |
| SVG (HTML) | react-native-svg |
| div | View |
| span | Text |
| localStorage | AsyncStorage (已實作) |

### 動畫對應

```typescript
// Web CSS
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Mobile Reanimated
const opacity = useSharedValue(0);
opacity.value = withTiming(1, { duration: 1000 });
```

---

## 📄 檔案結構規劃

```
apps/mobile/
├── src/
│   ├── components/
│   │   ├── aura/
│   │   │   ├── Clock.tsx (已存在)
│   │   │   ├── AuraLogo.tsx (新增)
│   │   │   ├── ConnectionIntro.tsx (新增)
│   │   │   ├── BlendedSky.tsx (新增)
│   │   │   ├── AuraGlobe.tsx (新增)
│   │   │   ├── CelestialSky.tsx (新增)
│   │   │   ├── Heartline.tsx (新增)
│   │   │   ├── TimeBridge.tsx (新增)
│   │   │   ├── DailyTimeline.tsx (新增)
│   │   │   └── ParticleSystem.tsx (新增)
│   │   └── animations/
│   │       └── AnimatedComponents.tsx (新增)
│   ├── stores/ (已存在)
│   ├── constants/
│   │   ├── Gradients.ts (已存在)
│   │   └── Animations.ts (新增)
│   └── utils/
│       └── animationUtils.ts (新增)
└── App.tsx (重構)
```

---

## 🚨 注意事項

1. **效能監控**: 使用 React DevTools Profiler 監控效能
2. **記憶體管理**: 確保動畫在元件卸載時清理
3. **裝置測試**: 在不同效能的裝置上測試
4. **漸進式實作**: 一次實作一個功能，確保穩定

---

## 📚 參考資料

- Web App: `/apps/web/App.tsx`
- Web CSS: `/apps/web/index.html`
- Mobile App: `/apps/mobile/App.tsx`
- Shared Utils: `/packages/shared/`

---

## 🔄 更新日誌

### 2025-11-01 - 初始建立
- 建立文檔結構
- 完成現況分析
- 規劃實作階段

### 2025-11-01 - 完成主要實作
- ✅ 安裝所有必要套件 (react-native-reanimated, react-native-svg, @react-native-masked-view/masked-view)
- ✅ 建立動畫常數和工具函式
- ✅ 實作所有核心元件：
  - AuraLogo (SVG Logo with draw-ring animation)
  - ConnectionIntro (星空背景 + 位置標記 + 連接動畫)
  - ParticleSystem (8 個優化粒子)
  - CelestialSky (太陽/月亮動畫)
  - AuraGlobe (位置資訊面板 with Clock)
  - Heartline (SVG 連接曲線 + 互動按鈕)
  - BlendedSky (漸層混合系統)
  - TimeBridge (時間軸 Modal)
- ✅ 整合所有元件到 App.tsx
- ✅ 更新 Clock 元件支援時區和自定義樣式

---

## ✅ 已實作的功能

### 初始畫面
- ✅ Logo 動畫 (SVG stroke animation)
- ✅ 星空背景 (50 顆隨機星星)
- ✅ 位置標記 (Cyan & Pink 脈衝動畫)
- ✅ 連接閃光效果
- ✅ 3 秒自動過場

### 主頁面
- ✅ BlendedSky 漸層混合系統 (使用 MaskedView)
- ✅ 太陽/月亮動畫 (基於真實時間)
- ✅ 粒子漂浮效果 (8 個優化粒子)
- ✅ AuraGlobe 資訊面板 (位置、時鐘、溫度、天氣、日出/日落)
- ✅ Heartline 連接線 (SVG 曲線)
- ✅ 互動統計按鈕 (距離 + 時差)

### 互動功能
- ✅ TimeBridge Modal (24 小時時間軸視覺化)
- ✅ Settings 按鈕 (重置位置)
- ✅ Refresh 按鈕 (更新天氣)

### 動畫
- ✅ Reanimated 動畫 (fade, scale, translate)
- ✅ SVG 動畫 (stroke, path)
- ✅ 粒子系統 (drift with repeat)
- ✅ 脈衝效果 (標記、按鈕)

---

## 📋 待優化項目

1. **效能優化**
   - 使用 useMemo/useCallback 減少重新渲染
   - 確保所有動畫使用 native driver
   - 監控記憶體使用

2. **天氣圖示**
   - 目前 AuraGlobe 使用簡化的表情符號
   - 可以實作完整的 lucide-react-native 圖示對應

3. **漸層顏色對應**
   - BlendedSky 使用簡化的 Tailwind 顏色對應
   - 可以實作更精確的顏色轉換

4. **動畫參數調整**
   - 根據實際裝置測試調整動畫速度
   - 可能需要根據裝置效能動態調整粒子數量

5. **錯誤處理**
   - 加強網路錯誤處理
   - 加入重試機制

---

## 🎯 實作成果

Mobile App 現在已經擁有與 Web App 一致的視覺效果和動畫：

### 相同的元素
- ✅ Logo 動畫
- ✅ 星空背景
- ✅ 連接動畫
- ✅ 天空漸層混合
- ✅ 太陽/月亮動畫
- ✅ 粒子效果
- ✅ 位置資訊面板
- ✅ 連接線
- ✅ 時間軸視窗

### 優化的部分
- 粒子數量: 20+ → 8 (效能考量)
- 動畫複雜度: 簡化但保持視覺效果
- 使用 native driver 提升效能

---

**最後更新**: 2025-11-01
**狀態**: 主要功能已完成，待測試和優化
**下一步**: 在實際裝置上測試並根據需要調整效能
