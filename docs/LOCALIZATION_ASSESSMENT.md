# 中文本地化实施评估
## Aura: 遠距離情侶

**评估日期：** 2025-11-12
**目标市场：** 台湾（繁体中文）、中国大陆（简体中文）

---

## 📊 复杂度评估

### 总体评估：🟡 中等复杂度

**时间估算：** 1-2 周（1 名开发者）
**工作量分布：**
- UI 文案翻译：30%
- 代码适配：20%
- 测试验证：30%
- App Store 配置：20%

**结论：** ✅ **可行且值得投入**

---

## 🎯 需要本地化的内容

### 1. App Store 元数据（简单）⭐

**工作量：** 2-3 小时

#### 繁体中文（台湾）

**App 名稱：**
```
Aura：遠距離情侶
```
✅ 完美长度

**副標題：**
```
共享天空、時差管理、智能鬧鐘
```
✅ 30 字符内

**關鍵詞（100 字符）：**
```
遠距離,異地戀,情侶,時差,戀愛,男友,女友,異國戀,鬧鐘,浪漫,伴侶,國際,視訊,連結
```

**描述（前 200 字）：**
```
❤️ 與遠距離的另一半跨越時差保持連結

Aura 為遠距離情侶打造專屬的數位空間。即時看見對方的天空、
輕鬆管理時差、不錯過重要時刻。

最適合：
✓ 遠距離情侶
✓ 異國戀
✓ 跨時區的伴侶
✓ 軍人情侶
✓ 留學生情侶
✓ 異地戀愛

---

🌍 跨時區連結

共享天空視覺化
• 即時看見雙方天空的美麗融合
• 日夜轉換與實際天氣同步
• 透過看見對方所見而感到更親近

智能時差管理
• 自動時區轉換
• 視覺化時差顯示（例：台北 ✦ 紐約 - 13 小時）
• 自動處理日光節約時間（DST）
• 24 小時時間軸對比

...
```

#### 简体中文（中国大陆）

**App 名称：**
```
Aura：异地恋情侣
```

**副标题：**
```
共享天空、时差管理、情侣闹钟
```

**关键词：**
```
异地恋,远距离,情侣,时差,恋爱,男友,女友,国际恋,闹钟,浪漫,伴侣,异国恋,视频,连接
```

**描述差异：**
- 用词调整：視訊 → 视频、軟體 → 软件
- 标点符号：全形 → 半形（中国大陆习惯）

---

### 2. App 内文案（中等）⭐⭐

**工作量：** 1-2 天

#### 需要翻译的文案文件

**创建本地化文件：**
```
apps/mobile/locales/
├── en.json          (英文 - 已有)
├── zh-TW.json       (繁体中文 - 新增)
└── zh-CN.json       (简体中文 - 新增)
```

#### 繁体中文文案示例（zh-TW.json）

```json
{
  "common": {
    "save": "儲存",
    "cancel": "取消",
    "delete": "刪除",
    "edit": "編輯",
    "done": "完成",
    "next": "下一步",
    "skip": "跳過"
  },

  "intro": {
    "narrative1": "兩個人。",
    "narrative2": "不同的天空。",
    "narrative3": "一個共享的氛圍。"
  },

  "coupleSetup": {
    "title": "建立你們的連結",
    "myName": "你的名字",
    "partnerName": "伴侶的名字",
    "myEmoji": "你的表情符號",
    "partnerEmoji": "伴侶的表情符號",
    "relationshipStart": "戀愛開始日期",
    "nextMeeting": "下次見面日期"
  },

  "location": {
    "myLocation": "我的位置",
    "partnerLocation": "伴侶的位置",
    "enterCity": "輸入城市名稱",
    "searching": "搜尋中...",
    "notFound": "找不到城市"
  },

  "alarm": {
    "createAlarm": "建立鬧鐘",
    "editAlarm": "編輯鬧鐘",
    "deleteAlarm": "刪除鬧鐘",
    "alarmLabel": "鬧鐘標籤",
    "setInMyTime": "在我的時區設定",
    "setInPartnerTime": "在伴侶的時區設定",
    "repeat": "重複",
    "everyday": "每天",
    "weekdays": "平日",
    "weekends": "週末",
    "oneTime": "單次",
    "alarmPermissionTitle": "啟用系統鬧鐘？",
    "alarmPermissionMessage": "Aura 現在可以建立即使在靜音模式下也能響鈴的鬧鐘。這需要鬧鐘權限。",
    "alarmPermissionEnable": "啟用",
    "alarmPermissionNotNow": "暫時不要",
    "systemAlarmBadge": "系統鬧鐘"
  },

  "timeBridge": {
    "title": "時間橋樑",
    "yourTime": "你的時間",
    "partnerTime": "伴侶的時間",
    "timeDifference": "時差：{hours} 小時",
    "yourSchedule": "你的作息",
    "partnerSchedule": "伴侶的作息",
    "freeTime": "共同空閒時間",
    "bestCallTime": "最佳通話時間"
  },

  "settings": {
    "title": "設定",
    "connection": "連結資訊",
    "distance": "距離",
    "flightTime": "飛行時間",
    "co2Emissions": "碳排放量",
    "editNickname": "編輯暱稱",
    "editSchedule": "編輯作息",
    "resetLocations": "重設位置",
    "resetConfirm": "確定要重設所有位置嗎？",
    "alarmSystem": "鬧鐘系統",
    "systemLevelAlarms": "系統級鬧鐘",
    "enabled": "已啟用（可穿透靜音模式）",
    "notAuthorized": "未授權",
    "openSettings": "前往設定啟用"
  },

  "relationship": {
    "togetherFor": "在一起 {days} 天",
    "nextMeetingIn": "{days} 天後見面",
    "daysSinceLastMet": "上次見面：{days} 天前",
    "milestone": "里程碑",
    "editMilestone": "編輯里程碑",
    "statusMessage": "狀態訊息",
    "editStatus": "編輯狀態"
  },

  "weather": {
    "clear": "晴朗",
    "cloudy": "多雲",
    "rainy": "下雨",
    "snowy": "下雪",
    "thunderstorm": "雷雨",
    "reminder": "天氣提醒",
    "itsRaining": "{location} 正在下雨 - 傳個溫暖的訊息吧！"
  },

  "migration": {
    "bannerTitle": "全新：系統級鬧鐘",
    "bannerMessage": "你的鬧鐘現在可以穿透靜音模式和勿擾模式！點擊升級現有鬧鐘。",
    "upgradeButton": "立即升級",
    "upgrading": "升級中...",
    "successTitle": "升級完成",
    "successMessage": "成功升級 {count} 個鬧鐘為系統級鬧鐘！"
  }
}
```

#### 简体中文差异（zh-CN.json）

主要差异：
```json
{
  "common": {
    "save": "保存",      // 儲存 → 保存
    "delete": "删除",    // 刪除 → 删除
    "edit": "编辑"       // 編輯 → 编辑
  },
  "location": {
    "partnerLocation": "伴侣的位置",  // 伴侶 → 伴侣
    "searching": "搜索中..."         // 搜尋 → 搜索
  },
  "settings": {
    "resetLocations": "重置位置",    // 重設 → 重置
    "openSettings": "前往设置启用"   // 設定 → 设置
  }
}
```

---

### 3. 代码适配（简单）⭐

**工作量：** 半天

#### 安装 i18n 库

```bash
npm install i18next react-i18next
```

#### 创建 i18n 配置

**文件：** `apps/mobile/src/i18n/index.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from '../locales/en.json';
import zhTW from '../locales/zh-TW.json';
import zhCN from '../locales/zh-CN.json';

// 检测用户语言
const deviceLanguage = getLocales()[0]?.languageTag || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
    },
    lng: deviceLanguage, // 自动检测
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

#### 在组件中使用

**修改前：**
```typescript
<Text style={styles.title}>Create Alarm</Text>
```

**修改后：**
```typescript
import { useTranslation } from 'react-i18next';

function AlarmEditModal() {
  const { t } = useTranslation();

  return (
    <Text style={styles.title}>{t('alarm.createAlarm')}</Text>
  );
}
```

#### 需要修改的组件列表

```
apps/mobile/src/components/aura/
├── IntroScreenPremium.tsx      (3 段文案)
├── CoupleSetupScreen.tsx       (8 个字段)
├── LocationInputScreen.tsx     (提示文案)
├── AlarmEditModal.tsx          (10+ 个标签)
├── AlarmCard.tsx               (重复模式文案)
├── Settings.tsx                (20+ 个标签)
├── TimeBridge.tsx              (时间标签)
├── AlarmKitMigrationBanner.tsx (升级文案)
└── RelationshipMilestone.tsx   (里程碑文案)
```

**估算：** ~50 个文案替换点

---

### 4. 日期和数字格式（简单）⭐

**工作量：** 2-3 小时

#### 日期格式本地化

**使用 date-fns 的本地化：**

```typescript
import { format } from 'date-fns';
import { zhTW, zhCN } from 'date-fns/locale';

// 根据当前语言选择 locale
const locale = i18n.language === 'zh-TW' ? zhTW :
               i18n.language === 'zh-CN' ? zhCN :
               undefined;

// 格式化日期
format(new Date(), 'PPP', { locale });
// 英文：November 12, 2025
// 繁中：2025年11月12日
// 简中：2025年11月12日
```

#### 时间格式

**中文用户偏好 24 小时制：**

```typescript
// 英文：9:00 AM
// 中文：09:00

const formatTime = (hour: number, minute: number) => {
  if (i18n.language.startsWith('zh')) {
    // 中文用 24 小时制
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else {
    // 英文用 12 小时制
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }
};
```

---

### 5. 特殊考虑（中等）⭐⭐

**工作量：** 1 天

#### 城市名称本地化

**问题：** 用户搜索 "台北" 还是 "Taipei"？

**解决方案：** 支持双语搜索

```typescript
// geocodingService.ts 增强
const CITY_NAME_MAPPING = {
  // 繁体中文
  '台北': 'Taipei',
  '高雄': 'Kaohsiung',
  '台中': 'Taichung',
  '紐約': 'New York',
  '倫敦': 'London',
  '東京': 'Tokyo',

  // 简体中文
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '纽约': 'New York',
  '伦敦': 'London',
  '东京': 'Tokyo',
};

async function searchCity(query: string) {
  // 如果是中文，先映射到英文
  const searchQuery = CITY_NAME_MAPPING[query] || query;

  // 搜索
  const results = await geocodingService.search(searchQuery);

  // 如果当前语言是中文，显示中文名（如果有）
  if (i18n.language.startsWith('zh')) {
    results.forEach(result => {
      result.displayName = getChineseName(result.name) || result.name;
    });
  }

  return results;
}
```

#### 表情符号和 Unicode

**好消息：** React Native 完美支持 Unicode 和表情符号
- ✅ 繁体中文字符显示正常
- ✅ 简体中文字符显示正常
- ✅ 表情符号混合使用无问题

#### 字体考虑

**默认系统字体即可：**
- iOS：苹方（PingFang）- 完美支持中文
- Android：思源黑体（Noto Sans CJK）

**无需额外字体文件** ✅

---

## 📊 工作量汇总

### 开发任务清单

| 任务 | 复杂度 | 预计时间 |
|------|--------|----------|
| **1. 翻译文案** | 简单 | 1-2 天 |
| - 创建 zh-TW.json | - | 4 小时 |
| - 创建 zh-CN.json | - | 2 小时（基于繁中调整）|
| - App Store 描述翻译 | - | 3 小时 |
| **2. 集成 i18n** | 简单 | 半天 |
| - 安装和配置 i18next | - | 1 小时 |
| - 创建 i18n 配置文件 | - | 1 小时 |
| - 语言自动检测 | - | 1 小时 |
| **3. 组件适配** | 中等 | 2 天 |
| - 替换硬编码文案（~50 处）| - | 1 天 |
| - 日期/时间格式本地化 | - | 3 小时 |
| - 城市名称双语支持 | - | 4 小时 |
| **4. 测试** | 中等 | 1-2 天 |
| - 繁中界面测试 | - | 半天 |
| - 简中界面测试 | - | 半天 |
| - 语言切换测试 | - | 2 小时 |
| - 截图准备（中文版）| - | 半天 |
| **5. App Store 配置** | 简单 | 半天 |
| - 繁中元数据配置 | - | 2 小时 |
| - 简中元数据配置 | - | 1 小时 |

**总计：** 5-7 个工作日（1 名开发者）

---

## 🎯 实施建议

### 分阶段推进（推荐）

#### Phase 1：繁体中文（优先）

**原因：**
- 台湾市场对 LDR app 需求大
- 繁体中文用户付费意愿高
- 竞争相对较小

**时间：** 3-4 天

**包含：**
- ✅ 繁体中文 App 内文案
- ✅ App Store 繁中元数据
- ✅ 台湾地区截图（繁中）
- ✅ 基础测试

#### Phase 2：简体中文（次要）

**时间：** 2-3 天（基于繁中快速调整）

**包含：**
- ✅ 简体中文 App 内文案（从繁中转换）
- ✅ App Store 简中元数据
- ✅ 大陆地区截图（简中）

#### Phase 3：日韩语（可选）

**时间：** 需要专业翻译

---

### 一次性完成（如果时间充裕）

**优点：**
- ✅ 上架时就支持多语言
- ✅ 扩大市场覆盖

**缺点：**
- ⚠️ 需要更多前期投入
- ⚠️ 测试工作量翻倍

**总时间：** 1-2 周

---

## 🚨 潜在挑战

### 1. 文案长度差异

**问题：** 中文通常比英文短

**例子：**
- 英文："Long Distance Couples" (23 字符)
- 繁中："遠距離情侶" (5 字符)
- 简中："异地恋情侣" (5 字符)

**影响：**
- UI 布局可能需要调整
- 某些按钮文字可能太短显得空

**解决方案：**
```typescript
// 动态调整 padding
const buttonStyle = {
  paddingHorizontal: i18n.language.startsWith('zh') ? 24 : 16,
};
```

### 2. 换行和排版

**问题：** 中文不使用空格分词

**解决方案：**
- 使用 `numberOfLines` 控制多行文本
- 中文字体 `letterSpacing` 调整

```typescript
<Text
  style={{
    letterSpacing: i18n.language.startsWith('zh') ? 0.5 : 0,
  }}
  numberOfLines={2}
>
  {t('description')}
</Text>
```

### 3. App Store 审核

**中国大陆特殊要求：**
- 需要 ICP 备案（如果有服务器）
- 可能需要内容审查

**Aura 的情况：**
- ✅ 无服务器（纯本地数据）
- ✅ 无社交功能
- ✅ 无敏感内容
- **风险：极低**

---

## 💡 最佳实践

### 1. 翻译质量

**不要用机器翻译直接上线**

**建议流程：**
1. 机器翻译初稿（Google Translate / DeepL）
2. 母语者审核和润色
3. 在实际设备上测试阅读体验

### 2. 文化适配

**台湾用户偏好：**
- 使用繁体字（非简体）
- "伴侶" 比 "对象" 更正式
- "視訊" 比 "视频" 更常用

**大陆用户偏好：**
- "异地恋" 是流行词汇
- "男朋友/女朋友" 比 "男友/女友" 更口语

### 3. 测试设备

**至少测试：**
- ✅ iOS 繁中系统（台湾地区设置）
- ✅ iOS 简中系统（大陆地区设置）
- ✅ 不同字体大小设置

---

## 📋 实施清单

### 准备阶段

- [ ] 决定优先级（繁中 vs 简中 vs 同时）
- [ ] 准备翻译文案（初稿）
- [ ] 找母语者审核翻译

### 开发阶段

- [ ] 安装 i18next 和依赖
- [ ] 创建语言文件（en.json, zh-TW.json, zh-CN.json）
- [ ] 配置 i18n 初始化
- [ ] 替换所有硬编码文案（~50 处）
- [ ] 适配日期/时间格式
- [ ] 实现城市名称双语搜索
- [ ] 调整 UI 布局（如需要）

### 测试阶段

- [ ] 繁中全流程测试
- [ ] 简中全流程测试
- [ ] 语言切换测试
- [ ] 不同字体大小测试
- [ ] 长文本/短文本边界测试

### 发布阶段

- [ ] 准备中文截图（5 张 x 2 语言）
- [ ] App Store Connect 繁中配置
- [ ] App Store Connect 简中配置
- [ ] 提交审核

---

## 🎯 结论

### 总体评估

**复杂度：** 🟡 **中等**

**推荐策略：** ✅ **值得投入**

**理由：**
1. **技术难度低** - i18n 是成熟方案
2. **工作量可控** - 1-2 周即可完成
3. **市场价值高** - 台湾 LDR 市场需求大
4. **后续维护简单** - 新功能只需翻译文案

### 时间线建议

**如果现在开始（英文版上架后）：**

```
Week 1: 繁体中文开发和测试
Week 2: 简体中文开发和测试
Week 3: App Store 配置和上线
```

**如果现在就要多语言（首发同时）：**

```
Week 1-2: 英文版开发（AlarmKit 等功能）
Week 3: 繁简中文开发
Week 4: 测试和 App Store 准备
Week 5: 提交审核
```

### 我的建议

**首发专注英文版** ✅

**原因：**
1. 验证核心功能和市场反应
2. 收集英文用户反馈
3. 迭代优化后再本地化
4. 避免同时维护多语言版本

**3 个月后加入中文版** ⏰

**原因：**
1. 核心功能已稳定
2. 有用户反馈指导翻译
3. 扩大市场时机成熟

---

**需要我立即开始中文本地化实施吗？还是先完成英文版上架？** 🚀
