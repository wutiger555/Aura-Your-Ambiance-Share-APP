# Aura 個人化增強方案：從工具到情感連結

## 🎯 核心理念

Aura 不應只是「顯示兩地天氣」的工具，而是**異地戀情侶情感連結的數位聖殿**。

### 目前的問題
- ✗ 兩個位置是匿名的「Location A」和「Location B」
- ✗ 除了地點名稱外，沒有任何個人化元素
- ✗ 使用者無法表達「這是我的愛人」的情感
- ✗ 缺少「兩人共同記憶」的元素
- ✗ 主畫面只有冰冷的數據（溫度、時間、距離）

### 我們要創造的體驗
- ✓ 每次打開 App 都能感受到「Ta 在那裡」
- ✓ 不只是天氣，而是「Ta 的天氣」
- ✓ 不只是距離，而是「我們之間的距離」
- ✓ 不只是時間差，而是「什麼時候能跟 Ta 說晚安」

---

## 💡 設計方案：三層個人化

### 第一層：身份個人化（Who Are We?）

#### 1.1 初次設定時收集情侶資訊

**在 LocationInputScreen 之前，新增 `CoupleSetupScreen`：**

```
輸入流程：
1. IntroScreen（現有）
2. 🆕 CoupleSetupScreen - "Tell us about you two"
3. LocationInputScreen（我的位置）
4. LocationInputScreen（對方位置）
5. ConnectionIntro
6. Main Screen
```

**CoupleSetupScreen 收集的資訊：**

```typescript
interface CoupleProfile {
  // 基本身份
  myName: string;           // 例如："Tzu-Hui" 或 "我"
  partnerName: string;      // 例如："Alex" 或 "寶貝"

  // 關係象徵
  relationshipStart?: Date; // 在一起的日期
  meetLocation?: string;    // 第一次見面的地點（可選）

  // 視覺元素
  myEmoji?: string;         // 代表自己的 emoji，例如 🌸
  partnerEmoji?: string;    // 代表對方的 emoji，例如 🌙

  // 自訂連接線名稱
  connectionName?: string;  // 例如："Our Red Thread" "我們的紅線"
}
```

**設計細節：**
- 簡潔的表單，每個欄位都有詩意的 placeholder
- 「可選」欄位不強制填寫，保持流暢體驗
- Emoji 選擇器提供精選的象徵意義選項

---

#### 1.2 主畫面的身份呈現

**AuraGlobe 組件改造：**

**現在（冰冷）：**
```
┌─────────────────┐
│   Taipei        │
│   🌤️ 28°C      │
│   06:30 PM      │
└─────────────────┘
```

**改為（溫暖）：**
```
┌─────────────────────┐
│  🌸 Tzu-Hui         │ ← 名字 + emoji
│  in Taipei          │
│  🌤️ 28°C · 06:30PM │
│  "我這邊天氣很好～"   │ ← 可選的狀態訊息
└─────────────────────┘
```

**技術實現：**
```typescript
interface AuraGlobeProps {
  location: LocationData;
  weather: WeatherData;
  profile: {
    name: string;
    emoji?: string;
    statusMessage?: string; // 新增：自訂狀態
  };
  position: 'top' | 'bottom';
}
```

---

### 第二層：關係象徵化（What We Mean to Each Other）

#### 2.1 Heartline 的命名與意義

**現在：**
- 只是一條線，顯示距離和時差

**改為：**
```
      🌸 ═══════════════ 🌙
         "Our Red Thread"
       ↑ 10,234 km · 13h ↓
```

- 使用者自訂的連接名稱（預設："Our Connection"）
- 兩端顯示各自的 emoji
- 距離和時差依然存在，但不是焦點

---

#### 2.2 在一起天數倒數/計數

**新增組件：`RelationshipMilestone`**

顯示位置：主畫面中央下方（Heartline 下方）

**內容：**
```
╭─────────────────────────╮
│  💕 Together for        │
│     1,247 days          │
│                         │
│  ⏰ Next reunion in     │
│     23 days             │
╰─────────────────────────╯
```

**功能：**
- **在一起天數**：自動從 `relationshipStart` 計算
- **下次見面倒數**：使用者可設定「預計見面日期」
- 點擊可展開看詳細資訊（例如：「我們已經度過了 3 個春夏秋冬」）

**技術實現：**
```typescript
interface RelationshipData {
  startDate: Date;
  nextMeetingDate?: Date;
  lastMetDate?: Date;
}

// 計算天數
const daysToget = differenceInDays(new Date(), startDate);
const daysUntilMeeting = nextMeetingDate
  ? differenceInDays(nextMeetingDate, new Date())
  : null;
```

---

#### 2.3 位置的象徵意義自動判斷

**根據城市名稱，自動顯示文化象徵：**

| 城市範例 | 自動象徵 |
|---------|---------|
| Paris | 🗼 "City of Love" |
| Tokyo | 🌸 "Where Cherry Blossoms Bloom" |
| New York | 🗽 "The City That Never Sleeps" |
| Taipei | 🏙️ "Heart of Taiwan" |
| London | 👑 "Across the Thames" |

**顯示方式：**
- 在 AuraGlobe 下方以小字顯示
- 使用者可在設定中自訂覆蓋

```typescript
const getCitySymbol = (cityName: string): { emoji: string, tagline: string } => {
  const symbols = {
    'Paris': { emoji: '🗼', tagline: 'City of Love' },
    'Tokyo': { emoji: '🌸', tagline: 'Where Cherry Blossoms Bloom' },
    'New York': { emoji: '🗽', tagline: 'The City That Never Sleeps' },
    'Taipei': { emoji: '🏙️', tagline: 'Heart of Taiwan' },
    'London': { emoji: '👑', tagline: 'Across the Thames' },
    // ... 更多城市
  };
  return symbols[cityName] || { emoji: '📍', tagline: '' };
};
```

---

### 第三層：互動記憶化（Our Shared Moments）

#### 3.1 每日一句（Daily Message）

**新功能：雙向留言系統**

**位置：** 點擊 Heartline 後，除了 TimeBridge，新增 「Messages」 tab

**功能：**
- 每天可以寫一句話給對方
- 對方打開 App 時會看到
- 歷史訊息可回顧（像日記）

**UI 設計：**
```
╭──────────────────────────────╮
│  💌 Today's Message          │
│                              │
│  From 🌙 Alex:               │
│  "今天下雨了，想你。"          │
│                              │
│  [ Write back... ]           │
╰──────────────────────────────╯
```

**技術考量：**
- **本地存儲版**（MVP）：使用 AsyncStorage，單向留言
- **未來版**（需後端）：即時同步，雙向對話

---

#### 3.2 天氣觸發的自動提醒

**根據對方的天氣自動生成溫馨提示：**

| 對方天氣狀況 | 自動提示 |
|------------|---------|
| 下雨 | "☔ Ta 那邊在下雨，記得提醒 Ta 帶傘" |
| 極冷 (<5°C) | "🧣 Ta 那邊很冷，傳個訊息關心一下吧" |
| 極熱 (>35°C) | "🥵 Ta 那邊很熱，提醒 Ta 多喝水" |
| 雷雨 | "⚡ Ta 那邊有雷雨，也許 Ta 需要陪伴" |
| 日出 | "🌅 Ta 那邊太陽剛升起，要不要傳個早安？" |
| 日落 | "🌇 Ta 那邊的太陽快下山了，記得說晚安" |

**顯示位置：**
- 作為 notification badge 出現在設定按鈕旁
- 點擊後展開完整提示

```typescript
interface WeatherReminder {
  type: 'rain' | 'cold' | 'hot' | 'storm' | 'sunrise' | 'sunset';
  message: string;
  icon: string;
  shouldShow: boolean;
}

const getWeatherReminder = (
  partnerWeather: WeatherData,
  partnerName: string
): WeatherReminder | null => {
  const { weather_code, temperature_2m } = partnerWeather.current;

  // 下雨
  if (weather_code >= 51 && weather_code <= 67) {
    return {
      type: 'rain',
      message: `☔ ${partnerName} 那邊在下雨，記得提醒帶傘`,
      icon: '☔',
      shouldShow: true
    };
  }

  // 極冷
  if (temperature_2m < 5) {
    return {
      type: 'cold',
      message: `🧣 ${partnerName} 那邊很冷（${temperature_2m}°C），傳個訊息關心一下吧`,
      icon: '🧣',
      shouldShow: true
    };
  }

  // ... 其他條件

  return null;
};
```

---

#### 3.3 共享記憶時間軸（Memory Timeline）

**新頁面：`MemoryTimeline`**

**進入方式：** 主畫面右上角新增 📖 圖示

**內容：**
- 自動記錄的里程碑：
  - "First used Aura together" - 第一次使用 App 的日期
  - "1 month together on Aura" - 每個月紀念
  - "Weathered 100 rainy days together" - 一起經歷的天氣統計
- 手動添加的記憶：
  - 使用者可新增照片 + 地點 + 日期 + 描述
  - 例如：「2024.03.15 在巴黎鐵塔下求婚 💍」

**UI 設計：**
```
╭──────────── 📖 Our Story ────────────╮
│                                      │
│  🎉 2024.11.02                       │
│     First used Aura together         │
│                                      │
│  💕 2024.01.14 (Day 1247)            │
│     Started our journey              │
│                                      │
│  📸 2024.03.15                       │
│     Proposed in Paris 💍             │
│     [Photo]                          │
│                                      │
│  [ + Add Memory ]                    │
╰──────────────────────────────────────╯
```

---

## 🎨 視覺與互動設計強化

### 主畫面整體佈局重新思考

**現在的問題：**
- 上下兩個 AuraGlobe 佔據空間但資訊單薄
- Heartline 視覺很美但功能性不足
- 大量空白空間沒有被利用

**新佈局提案（3 個方案）：**

---

#### 方案 A：卡片式佈局

```
╔═══════════════════════════════════════╗
║  🌸 Tzu-Hui in Taipei                 ║
║  🌤️ 28°C · 06:30 PM                  ║
║  "我這邊天氣很好～" ·········· [Edit] ║
╠═══════════════════════════════════════╣
║                                       ║
║       🌸 ═══════════════ 🌙           ║
║          "Our Red Thread"             ║
║        ↑ 10,234 km · 13h ↓            ║
║                                       ║
║       💕 Together for 1,247 days      ║
║       ⏰ Next reunion in 23 days      ║
║                                       ║
╠═══════════════════════════════════════╣
║  🌙 Alex in New York                  ║
║  🌧️ 15°C · 05:30 AM                  ║
║  "剛起床，外面在下雨" ········ [Edit] ║
╚═══════════════════════════════════════╝

   [💌 Messages]  [📖 Memories]  [⚙️ Settings]
```

**特點：**
- 卡片式設計，層次清晰
- 狀態訊息可編輯，增加互動
- 底部 Tab 導航，易於擴展新功能

---

#### 方案 B：沉浸式融合（保留現有 BlendedSky）

```
     ┌─────────────────────────────┐
     │  🌸 Tzu-Hui                 │ ← 半透明卡片
     │  Taipei · 🌤️ 28°C         │
     └─────────────────────────────┘

           漸層天空背景（現有設計）
              + 天氣動畫效果

           🌸 ═══════════════ 🌙
              "Our Red Thread"
            ↑ 10,234 km · 13h ↓

         💕 Together for 1,247 days

           ☔ Ta 那邊在下雨，記得提醒帶傘
           [  💌  Send a message  ]

     ┌─────────────────────────────┐
     │  New York · 🌧️ 15°C        │
     │  🌙 Alex                    │
     └─────────────────────────────┘

        [📖 Memories]  [⚙️ Settings]
```

**特點：**
- 保留現有美麗的 BlendedSky 背景
- 資訊以浮動卡片形式疊加
- 天氣提醒更明顯
- 快速發訊息按鈕

---

#### 方案 C：對話式介面

```
╔═══════════════════════════════════════╗
║              Today                     ║
║           Nov 2, 2024                  ║
║        Together Day 1,247              ║
╠═══════════════════════════════════════╣
║                                       ║
║  🌸 You in Taipei                     ║
║  🌤️ It's a sunny evening for you     ║
║  28°C · 06:30 PM                      ║
║                                       ║
║  ─────── 10,234 km apart ──────       ║
║                                       ║
║  🌙 Alex in New York                  ║
║  🌧️ It's a rainy morning for them    ║
║  15°C · 05:30 AM (13h behind)         ║
║                                       ║
║  💭 "剛起床，外面在下雨"               ║
║     2 hours ago                       ║
║                                       ║
╠═══════════════════════════════════════╣
║  ☔ Reminder: Alex's area is rainy    ║
║  💌 Send them a morning message?      ║
║                                       ║
║  [ Write a message... ]               ║
╚═══════════════════════════════════════╝
```

**特點：**
- 像對話框一樣的資訊流
- 自然語言描述（"sunny evening" 而非只有 emoji）
- 整合提醒和快速回覆
- 時間感更強（"2 hours ago"）

---

## 🛠️ 技術實現計畫

### Phase 1: 資料結構擴充 ✅ 簡單

**目標：** 讓系統能夠存儲個人化資訊

#### 1.1 擴充 LocationData 類型

```typescript
// packages/shared/types/index.ts

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  nickname?: string;

  // 🆕 新增
  displayName?: string;      // 使用者的名字（例如："Tzu-Hui"）
  emoji?: string;            // 代表 emoji（例如："🌸"）
  statusMessage?: string;    // 自訂狀態（例如："我這邊天氣很好～"）
  citySymbol?: {
    emoji: string;
    tagline: string;
  };
}
```

#### 1.2 新增 CoupleProfile 類型

```typescript
// packages/shared/types/index.ts

export interface CoupleProfile {
  myName: string;
  partnerName: string;
  myEmoji?: string;
  partnerEmoji?: string;

  relationshipStart?: string; // ISO date string
  nextMeetingDate?: string;
  lastMetDate?: string;

  connectionName?: string; // 例如："Our Red Thread"
}
```

#### 1.3 擴充 Zustand Store

```typescript
// apps/mobile/src/stores/useLocationStore.ts

interface LocationStore {
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  coupleProfile: CoupleProfile | null; // 🆕

  hasSetup: boolean;

  setMyLocation: (location: LocationData) => void;
  setPartnerLocation: (location: LocationData) => void;
  setCoupleProfile: (profile: CoupleProfile) => void; // 🆕
  updateStatusMessage: (isMe: boolean, message: string) => void; // 🆕

  updateNicknames: (myNickname: string, partnerNickname: string) => void;
  clearLocations: () => void;
}
```

---

### Phase 2: 初次設定流程 ⭐ 中等

**目標：** 在初次使用時收集情侶資訊

#### 2.1 創建 CoupleSetupScreen 組件

```typescript
// apps/mobile/src/components/aura/CoupleSetupScreen.tsx

interface CoupleSetupScreenProps {
  onComplete: (profile: CoupleProfile) => void;
}

export default function CoupleSetupScreen({ onComplete }: CoupleSetupScreenProps) {
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myEmoji, setMyEmoji] = useState('');
  const [partnerEmoji, setPartnerEmoji] = useState('');
  const [relationshipStart, setRelationshipStart] = useState<Date | null>(null);

  const handleContinue = () => {
    if (!myName || !partnerName) {
      // 顯示錯誤
      return;
    }

    onComplete({
      myName,
      partnerName,
      myEmoji,
      partnerEmoji,
      relationshipStart: relationshipStart?.toISOString(),
      connectionName: "Our Connection" // 預設值
    });
  };

  return (
    <View style={styles.container}>
      {/* 美麗的漸層背景 */}
      <LinearGradient colors={['#0a0118', '#1e1b4b', '#312e81']} style={styles.gradient}>

        <Text style={styles.title}>Tell us about you two</Text>
        <Text style={styles.subtitle}>Make Aura truly yours</Text>

        {/* 我的資訊 */}
        <View style={styles.section}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="How should we call you?"
            value={myName}
            onChangeText={setMyName}
          />

          <Text style={styles.label}>Your emoji</Text>
          <EmojiPicker
            selected={myEmoji}
            onSelect={setMyEmoji}
            suggestions={['🌸', '☀️', '🌊', '🌙', '⭐', '🦋']}
          />
        </View>

        {/* 對方資訊 */}
        <View style={styles.section}>
          <Text style={styles.label}>Your partner's name</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you call them?"
            value={partnerName}
            onChangeText={setPartnerName}
          />

          <Text style={styles.label}>Their emoji</Text>
          <EmojiPicker
            selected={partnerEmoji}
            onSelect={setPartnerEmoji}
            suggestions={['🌙', '⭐', '🌹', '💫', '🦊', '🐱']}
          />
        </View>

        {/* 可選：在一起日期 */}
        <View style={styles.section}>
          <Text style={styles.label}>When did you start? (optional)</Text>
          <DatePicker
            date={relationshipStart}
            onDateChange={setRelationshipStart}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          disabled={!myName || !partnerName}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          You can always change these later in Settings
        </Text>
      </LinearGradient>
    </View>
  );
}
```

#### 2.2 修改 App.tsx 流程

```typescript
// apps/mobile/App.tsx

type SetupStep = 'intro' | 'coupleSetup' | 'inputMy' | 'inputPartner' | 'connecting' | 'done';

export default function App() {
  const [setupStep, setSetupStep] = useState<SetupStep>('intro');
  const { coupleProfile, setCoupleProfile } = useLocationStore();

  // 初次進入檢查
  useEffect(() => {
    if (hasSetup) {
      setSetupStep('done');
    } else if (!coupleProfile) {
      // 如果還沒設定 couple profile，需要先設定
      setSetupStep('intro'); // intro 結束後會到 coupleSetup
    }
  }, [hasSetup, coupleProfile]);

  // Intro 完成後
  const handleIntroComplete = () => {
    if (!coupleProfile) {
      setSetupStep('coupleSetup');
    } else {
      setSetupStep('inputMy');
    }
  };

  // Couple Setup 完成後
  const handleCoupleSetupComplete = (profile: CoupleProfile) => {
    setCoupleProfile(profile);
    setSetupStep('inputMy');
  };

  return (
    <>
      {setupStep === 'intro' && (
        <IntroScreenRedesign onComplete={handleIntroComplete} />
      )}

      {setupStep === 'coupleSetup' && (
        <CoupleSetupScreen onComplete={handleCoupleSetupComplete} />
      )}

      {setupStep === 'inputMy' && (
        <LocationInputScreen
          isPartner={false}
          onComplete={(location) => {
            setMyLocation(location);
            setSetupStep('inputPartner');
          }}
          displayName={coupleProfile?.myName}
          emoji={coupleProfile?.myEmoji}
        />
      )}

      {/* ... 其他步驟 */}
    </>
  );
}
```

---

### Phase 3: 主畫面個人化改造 ⭐⭐ 中等

**目標：** 在主畫面顯示個人化資訊

#### 3.1 改造 AuraGlobe 組件

```typescript
// apps/mobile/src/components/aura/AuraGlobe.tsx

interface AuraGlobeProps {
  location: LocationData;
  weather: WeatherData;
  profile: {
    name: string;
    emoji?: string;
    statusMessage?: string;
  };
  position: 'top' | 'bottom';
  distance?: number;
  onEditStatus?: () => void; // 🆕 可編輯狀態
}

export default function AuraGlobe({
  location,
  weather,
  profile,
  position,
  distance,
  onEditStatus
}: AuraGlobeProps) {
  return (
    <View style={styles.container}>
      {/* Emoji + 名字 */}
      <View style={styles.header}>
        {profile.emoji && (
          <Text style={styles.emoji}>{profile.emoji}</Text>
        )}
        <Text style={styles.name}>{profile.name}</Text>
      </View>

      {/* 城市 */}
      <Text style={styles.city}>in {location.name}</Text>

      {/* 天氣資訊 */}
      <View style={styles.weatherRow}>
        <Text style={styles.weather}>
          {getWeatherEmoji(weather.current.weather_code)} {Math.round(weather.current.temperature_2m)}°C
        </Text>
        <Text style={styles.time}>
          {formatTime(weather.current.time, weather.timezone)}
        </Text>
      </View>

      {/* 🆕 自訂狀態訊息 */}
      {profile.statusMessage && (
        <TouchableOpacity
          style={styles.statusContainer}
          onPress={onEditStatus}
        >
          <Text style={styles.status}>"{profile.statusMessage}"</Text>
          <Text style={styles.editHint}>Tap to edit</Text>
        </TouchableOpacity>
      )}

      {/* 原有的 Sunrise/Sunset */}
      {/* ... */}
    </View>
  );
}
```

#### 3.2 創建 StatusEditModal

```typescript
// apps/mobile/src/components/aura/StatusEditModal.tsx

interface StatusEditModalProps {
  visible: boolean;
  currentStatus: string;
  onSave: (newStatus: string) => void;
  onClose: () => void;
}

export default function StatusEditModal({
  visible,
  currentStatus,
  onSave,
  onClose
}: StatusEditModalProps) {
  const [status, setStatus] = useState(currentStatus);

  const suggestions = [
    "天氣很好～",
    "今天有點冷",
    "剛起床",
    "準備睡了",
    "想你了",
    "工作中...",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Your status</Text>

          <TextInput
            style={styles.input}
            value={status}
            onChangeText={setStatus}
            placeholder="How are you feeling?"
            maxLength={50}
          />

          <Text style={styles.label}>Quick pick:</Text>
          <View style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionButton}
                onPress={() => setStatus(suggestion)}
              >
                <Text>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(status)}>
              <Text>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

### Phase 4: 關係里程碑組件 ⭐⭐ 中等

**目標：** 在主畫面顯示在一起天數和下次見面倒數

#### 4.1 創建 RelationshipMilestone 組件

```typescript
// apps/mobile/src/components/aura/RelationshipMilestone.tsx

interface RelationshipMilestoneProps {
  relationshipStart?: string; // ISO date
  nextMeetingDate?: string;
  onSetMeeting?: () => void;
}

export default function RelationshipMilestone({
  relationshipStart,
  nextMeetingDate,
  onSetMeeting
}: RelationshipMilestoneProps) {
  if (!relationshipStart) return null;

  const daysTogether = differenceInDays(
    new Date(),
    new Date(relationshipStart)
  );

  const daysUntilMeeting = nextMeetingDate
    ? differenceInDays(new Date(nextMeetingDate), new Date())
    : null;

  return (
    <View style={styles.container}>
      {/* 在一起天數 */}
      <View style={styles.milestone}>
        <Text style={styles.emoji}>💕</Text>
        <Text style={styles.label}>Together for</Text>
        <Text style={styles.value}>{daysTogether.toLocaleString()} days</Text>
      </View>

      {/* 下次見面倒數 */}
      {daysUntilMeeting !== null ? (
        <View style={styles.milestone}>
          <Text style={styles.emoji}>⏰</Text>
          <Text style={styles.label}>Next reunion in</Text>
          <Text style={styles.value}>{daysUntilMeeting} days</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.setButton} onPress={onSetMeeting}>
          <Text style={styles.setButtonText}>
            ⏰ Set next meeting date
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

#### 4.2 在 App.tsx 主畫面整合

```typescript
// apps/mobile/App.tsx (setupStep === 'done' 部分)

return (
  <View style={styles.container}>
    <BlendedSky myWeather={myWeather} partnerWeather={partnerWeather}>

      {/* 上方：我的資訊 */}
      <AuraGlobe
        location={myLocation}
        weather={myWeather}
        profile={{
          name: coupleProfile.myName,
          emoji: coupleProfile.myEmoji,
          statusMessage: myLocation.statusMessage
        }}
        position="top"
        onEditStatus={() => setStatusEditVisible(true)}
      />

      {/* 中間：Heartline + 里程碑 */}
      <View style={styles.center}>
        <Heartline
          distance={distance}
          timeDifference={timeDifference}
          onShowDetails={() => setTimeBridgeVisible(true)}
          connectionName={coupleProfile.connectionName}
          myEmoji={coupleProfile.myEmoji}
          partnerEmoji={coupleProfile.partnerEmoji}
        />

        {/* 🆕 關係里程碑 */}
        <RelationshipMilestone
          relationshipStart={coupleProfile.relationshipStart}
          nextMeetingDate={coupleProfile.nextMeetingDate}
          onSetMeeting={() => setMeetingDatePickerVisible(true)}
        />
      </View>

      {/* 下方：對方資訊 */}
      <AuraGlobe
        location={partnerLocation}
        weather={partnerWeather}
        profile={{
          name: coupleProfile.partnerName,
          emoji: coupleProfile.partnerEmoji,
          statusMessage: partnerLocation.statusMessage
        }}
        position="bottom"
      />

    </BlendedSky>

    {/* Modals */}
    <StatusEditModal ... />
    <MeetingDatePicker ... />
  </View>
);
```

---

### Phase 5: 天氣提醒系統 ⭐⭐⭐ 困難

**目標：** 根據對方天氣自動生成溫馨提醒

#### 5.1 創建天氣提醒邏輯

```typescript
// apps/mobile/src/utils/weatherReminders.ts

export interface WeatherReminder {
  type: 'rain' | 'cold' | 'hot' | 'storm' | 'sunrise' | 'sunset';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

export function getWeatherReminders(
  partnerWeather: WeatherData,
  partnerName: string,
  partnerLocation: LocationData
): WeatherReminder[] {
  const reminders: WeatherReminder[] = [];
  const { weather_code, temperature_2m, is_day } = partnerWeather.current;
  const { sunrise, sunset } = partnerWeather.daily;

  // 1. 下雨提醒
  if (weather_code >= 51 && weather_code <= 67) {
    reminders.push({
      type: 'rain',
      title: `It's raining in ${partnerLocation.name}`,
      message: `☔ Remind ${partnerName} to bring an umbrella`,
      icon: '☔',
      priority: 'medium'
    });
  }

  // 2. 暴風雨提醒
  if (weather_code >= 95 && weather_code <= 99) {
    reminders.push({
      type: 'storm',
      title: `Thunderstorm in ${partnerLocation.name}`,
      message: `⚡ ${partnerName} might need some company. Send them a message?`,
      icon: '⚡',
      priority: 'high'
    });
  }

  // 3. 極冷提醒
  if (temperature_2m < 5) {
    reminders.push({
      type: 'cold',
      title: `It's freezing for ${partnerName}`,
      message: `🧣 Only ${Math.round(temperature_2m)}°C. Send a warm message!`,
      icon: '🧣',
      priority: 'medium'
    });
  }

  // 4. 極熱提醒
  if (temperature_2m > 35) {
    reminders.push({
      type: 'hot',
      title: `It's very hot for ${partnerName}`,
      message: `🥵 ${Math.round(temperature_2m)}°C! Remind them to drink water`,
      icon: '🥵',
      priority: 'medium'
    });
  }

  // 5. 日出日落提醒
  const now = new Date();
  const sunriseTime = new Date(sunrise[0]);
  const sunsetTime = new Date(sunset[0]);

  // 日出前後 30 分鐘
  if (Math.abs(differenceInMinutes(now, sunriseTime)) < 30 && !is_day) {
    reminders.push({
      type: 'sunrise',
      title: `Sunrise time for ${partnerName}`,
      message: `🌅 Send them a good morning message?`,
      icon: '🌅',
      priority: 'low'
    });
  }

  // 日落前後 30 分鐘
  if (Math.abs(differenceInMinutes(now, sunsetTime)) < 30 && is_day) {
    reminders.push({
      type: 'sunset',
      title: `Sunset time for ${partnerName}`,
      message: `🌇 Perfect time to say good evening`,
      icon: '🌇',
      priority: 'low'
    });
  }

  return reminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

#### 5.2 創建 WeatherReminderCard 組件

```typescript
// apps/mobile/src/components/aura/WeatherReminderCard.tsx

interface WeatherReminderCardProps {
  reminder: WeatherReminder;
  onDismiss: () => void;
  onSendMessage: () => void;
}

export default function WeatherReminderCard({
  reminder,
  onDismiss,
  onSendMessage
}: WeatherReminderCardProps) {
  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{reminder.icon}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.message}>{reminder.message}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismiss}>×</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={onSendMessage}>
        <Text style={styles.actionText}>💌 Send a message</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

#### 5.3 在主畫面整合提醒

```typescript
// apps/mobile/App.tsx

const [weatherReminders, setWeatherReminders] = useState<WeatherReminder[]>([]);

// 當天氣數據更新時，檢查提醒
useEffect(() => {
  if (partnerWeather && coupleProfile) {
    const reminders = getWeatherReminders(
      partnerWeather,
      coupleProfile.partnerName,
      partnerLocation
    );
    setWeatherReminders(reminders);
  }
}, [partnerWeather, coupleProfile]);

return (
  <View>
    {/* ... BlendedSky and other components ... */}

    {/* 🆕 天氣提醒卡片 */}
    {weatherReminders.length > 0 && (
      <View style={styles.remindersContainer}>
        {weatherReminders.slice(0, 2).map((reminder, index) => (
          <WeatherReminderCard
            key={`${reminder.type}-${index}`}
            reminder={reminder}
            onDismiss={() => {
              setWeatherReminders(prev =>
                prev.filter((_, i) => i !== index)
              );
            }}
            onSendMessage={() => {
              // 未來：打開訊息編輯器
              // 目前：複製到剪貼板或分享
              Share.share({
                message: `Hey! ${reminder.message}`
              });
            }}
          />
        ))}
      </View>
    )}
  </View>
);
```

---

### Phase 6: 訊息系統（簡化版）⭐⭐⭐ 困難

**目標：** 讓情侶可以留言給對方（本地版本）

#### 6.1 創建訊息資料結構

```typescript
// packages/shared/types/index.ts

export interface DailyMessage {
  id: string;
  date: string; // YYYY-MM-DD
  from: 'me' | 'partner';
  text: string;
  timestamp: string; // ISO datetime
}
```

#### 6.2 訊息 Store

```typescript
// apps/mobile/src/stores/useMessageStore.ts

interface MessageStore {
  messages: DailyMessage[];
  addMessage: (from: 'me' | 'partner', text: string) => void;
  getMessagesForDate: (date: string) => DailyMessage[];
  getTodayMessages: () => DailyMessage[];
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (from, text) => {
        const now = new Date();
        const message: DailyMessage = {
          id: `${Date.now()}-${Math.random()}`,
          date: format(now, 'yyyy-MM-dd'),
          from,
          text,
          timestamp: now.toISOString()
        };

        set((state) => ({
          messages: [...state.messages, message]
        }));
      },

      getMessagesForDate: (date) => {
        return get().messages.filter(m => m.date === date);
      },

      getTodayMessages: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().messages.filter(m => m.date === today);
      }
    }),
    {
      name: 'aura-messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

#### 6.3 訊息編輯器組件

```typescript
// apps/mobile/src/components/aura/MessageComposer.tsx

interface MessageComposerProps {
  visible: boolean;
  recipientName: string;
  onSend: (message: string) => void;
  onClose: () => void;
}

export default function MessageComposer({
  visible,
  recipientName,
  onSend,
  onClose
}: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const suggestions = [
    "Good morning! ☀️",
    "Thinking of you 💭",
    "Miss you 💕",
    "How's your day?",
    "Sweet dreams 🌙",
    "Stay safe ☔",
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Message to {recipientName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Write your message..."
            multiline
            maxLength={200}
          />

          <Text style={styles.hint}>
            This will be saved locally. They'll see it next time they open the app.
          </Text>

          <Text style={styles.label}>Quick messages:</Text>
          <View style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => setMessage(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.disabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Text style={styles.sendText}>💌 Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
```

#### 6.4 訊息顯示（在 TimeBridge 旁邊新增 Tab）

```typescript
// apps/mobile/src/components/aura/MessagesTab.tsx

interface MessagesTabProps {
  myName: string;
  partnerName: string;
}

export default function MessagesTab({ myName, partnerName }: MessagesTabProps) {
  const todayMessages = useMessageStore(state => state.getTodayMessages());
  const [composerVisible, setComposerVisible] = useState(false);
  const addMessage = useMessageStore(state => state.addMessage);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Messages</Text>

      {todayMessages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>💌</Text>
          <Text style={styles.emptyMessage}>
            No messages yet today
          </Text>
        </View>
      ) : (
        <View style={styles.messagesList}>
          {todayMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.from === 'me' ? styles.myMessage : styles.partnerMessage
              ]}
            >
              <Text style={styles.messageFrom}>
                {msg.from === 'me' ? myName : partnerName}
              </Text>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>
                {format(new Date(msg.timestamp), 'hh:mm a')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.composeButton}
        onPress={() => setComposerVisible(true)}
      >
        <Text style={styles.composeText}>✍️ Write a message</Text>
      </TouchableOpacity>

      <MessageComposer
        visible={composerVisible}
        recipientName={partnerName}
        onSend={(text) => addMessage('me', text)}
        onClose={() => setComposerVisible(false)}
      />
    </ScrollView>
  );
}
```

---

## 📊 實施優先順序建議

| Phase | 功能 | 難度 | 影響力 | 建議順序 |
|-------|-----|------|--------|---------|
| Phase 1 | 資料結構擴充 | ⭐ 簡單 | 🔥🔥🔥 必需 | **1st** |
| Phase 2 | 初次設定流程 | ⭐⭐ 中等 | 🔥🔥🔥 高 | **2nd** |
| Phase 3 | 主畫面個人化 | ⭐⭐ 中等 | 🔥🔥🔥 高 | **3rd** |
| Phase 4 | 關係里程碑 | ⭐⭐ 中等 | 🔥🔥 中 | **4th** |
| Phase 5 | 天氣提醒系統 | ⭐⭐⭐ 困難 | 🔥🔥 中 | 5th |
| Phase 6 | 訊息系統 | ⭐⭐⭐ 困難 | 🔥 低（本地版）| 6th |

**建議實施順序：**
1. **Phase 1-3**：先完成基本個人化（名字、emoji、狀態訊息）
2. **Phase 4**：新增里程碑功能
3. **Phase 5-6**：進階功能（提醒、訊息）

---

## 🎨 最終效果預覽

完成所有 Phase 後，使用者體驗將是：

### 初次使用
```
1. IntroScreen（8秒動畫）
   ↓
2. CoupleSetupScreen
   "Tell us about you two"
   - 輸入：我叫 Tzu-Hui 🌸
   - 輸入：Ta 叫 Alex 🌙
   - 輸入：我們從 2023.01.14 在一起
   ↓
3. LocationInputScreen
   "Where are you, Tzu-Hui?"
   ↓
4. LocationInputScreen
   "Where is Alex?"
   ↓
5. ConnectionIntro（10秒動畫）
   "Taipei ✦ New York"
   ↓
6. Main Screen（個人化的主畫面）
```

### 主畫面
```
╔════════════════════════════════════════╗
║  🌸 Tzu-Hui in Taipei                  ║
║  🌤️ 28°C · 06:30 PM                   ║
║  "天氣很好，剛下班～" ········· [Edit] ║
╠════════════════════════════════════════╣
║                                        ║
║     ☔ Alex's area is rainy             ║
║     💌 Send them a message?            ║
║     [ Write a message... ]             ║
║                                        ║
║      🌸 ═══════════════ 🌙             ║
║         "Our Red Thread"               ║
║       ↑ 10,234 km · 13h ↓              ║
║                                        ║
║       💕 Together for 1,247 days       ║
║       ⏰ Next reunion in 23 days       ║
║                                        ║
╠════════════════════════════════════════╣
║  🌙 Alex in New York                   ║
║  🌧️ 15°C · 05:30 AM                   ║
║  "剛起床，外面在下雨" ········· [Edit] ║
╚════════════════════════════════════════╝

    [💌 Messages]  [📖 Memories]  [⚙️]
```

---

## 💭 我的建議

根據你的需求「讓兩個人之間不是只有地點、天氣、時間」，我建議：

### 最小可行版本（MVP）
**Phase 1-3**：實現基本個人化
- 讓使用者輸入彼此的名字和 emoji
- 在主畫面顯示「🌸 Tzu-Hui in Taipei」而非只有「Taipei」
- 可編輯狀態訊息

**預計時間：** 1-2 天
**效果：** 立即讓 App 有溫度，從工具變成「我們的 App」

### 完整版本
**Phase 1-4**：加上關係里程碑
- 顯示在一起天數
- 下次見面倒數

**預計時間：** 3-4 天
**效果：** App 變成「我們關係的見證」

### 進階版本
**Phase 1-6**：完整個人化體驗
- 天氣提醒
- 留言系統

**預計時間：** 5-7 天
**效果：** App 成為「日常連結的工具」

---

## ❓ 需要你的決策

1. **你希望實施哪些 Phase？**
   - 只要 MVP（Phase 1-3）？
   - 完整版本（Phase 1-4）？
   - 全部實施（Phase 1-6）？

2. **主畫面佈局偏好？**
   - 方案 A：卡片式佈局（清晰分層）
   - 方案 B：沉浸式融合（保留現有 BlendedSky）
   - 方案 C：對話式介面（像聊天）

3. **訊息系統的需求？**
   - 只要本地版本（離線可用，但不同步）？
   - 還是需要同步版本（需要後端，可即時傳遞）？

請告訴我你的偏好，我就可以開始實施！🚀
