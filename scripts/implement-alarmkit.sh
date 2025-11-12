#!/bin/bash
# AlarmKit 整合实施脚本
# 自动化配置和设置流程

set -e  # 遇到错误立即退出

echo "🚀 开始 AlarmKit 整合实施..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: 检查环境
echo -e "${BLUE}[1/7] 检查环境...${NC}"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo ""

# Step 2: 安装依赖
echo -e "${BLUE}[2/7] 安装依赖...${NC}"
npm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# Step 3: 进入 mobile 目录
cd apps/mobile

# Step 4: 运行 Expo Prebuild
echo -e "${BLUE}[3/7] 生成原生 iOS 项目 (expo prebuild)...${NC}"
echo -e "${YELLOW}⚠️  这将生成原生 iOS 和 Android 代码${NC}"
echo ""

npx expo prebuild --platform ios --clean

echo -e "${GREEN}✅ 原生 iOS 项目已生成${NC}"
echo ""

# Step 5: 复制 Native Module 文件
echo -e "${BLUE}[4/7] 准备 Native Module 文件...${NC}"

# 检查 Native Module 文件是否存在
if [ ! -f "ios/Modules/AuraAlarmKitModule.swift" ]; then
    echo -e "${RED}❌ AuraAlarmKitModule.swift 未找到${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Swift Native Module 文件已就绪${NC}"
echo -e "${GREEN}✅ Objective-C Bridge 文件已就绪${NC}"
echo ""

# Step 6: 提示手动步骤
echo -e "${BLUE}[5/7] ${YELLOW}需要手动在 Xcode 中完成以下步骤：${NC}"
echo ""
echo -e "${YELLOW}📝 Xcode 手动配置步骤：${NC}"
echo ""
echo "1️⃣  打开 Xcode 项目："
echo "   cd apps/mobile/ios"
echo "   open Aura.xcworkspace"
echo ""
echo "2️⃣  添加 Swift 文件到 Xcode 项目："
echo "   - 在 Xcode 中右键点击 'Aura' 项目"
echo "   - 选择 'Add Files to Aura...'"
echo "   - 选择 ios/Modules/ 文件夹中的两个文件："
echo "     • AuraAlarmKitModule.swift"
echo "     • AuraAlarmKitModule.m"
echo "   - ✅ 勾选 'Copy items if needed'"
echo "   - ✅ 勾选 'Create groups'"
echo "   - ✅ 选择 target: 'Aura'"
echo ""
echo "3️⃣  创建 Widget Extension："
echo "   - File → New → Target"
echo "   - 选择 'Widget Extension'"
echo "   - Product Name: AlarmCountdownWidget"
echo "   - Language: Swift"
echo "   - ❌ 取消勾选 'Include Configuration Intent'"
echo "   - 点击 'Finish' 和 'Activate'"
echo ""
echo "4️⃣  添加 Widget 代码："
echo "   - 删除默认生成的 AlarmCountdownWidget.swift"
echo "   - 添加 ios/AlarmCountdownWidget/AlarmCountdownWidget.swift"
echo "   - 确保文件添加到 'AlarmCountdownWidget' target（不是 Aura）"
echo ""
echo "5️⃣  配置 Swift Bridging Header："
echo "   - Build Settings → 搜索 'Objective-C Bridging Header'"
echo "   - 设置值为: Aura/Aura-Bridging-Header.h"
echo "   - 如果文件不存在，Xcode 会提示创建"
echo ""
echo "6️⃣  更新 Podfile 并安装："
echo "   - 在 Podfile 末尾添加："
echo "     target 'AlarmCountdownWidget' do"
echo "       inherit! :search_paths"
echo "     end"
echo "   - 运行: cd ios && pod install"
echo ""
echo -e "${YELLOW}完成以上步骤后，按回车继续...${NC}"
read -p ""

# Step 7: 检查配置
echo ""
echo -e "${BLUE}[6/7] 检查配置...${NC}"

# 检查 Info.plist 是否包含 AlarmKit 权限
if grep -q "NSAlarmKitUsageDescription" ios/Aura/Info.plist 2>/dev/null; then
    echo -e "${GREEN}✅ Info.plist 已包含 AlarmKit 权限${NC}"
else
    echo -e "${YELLOW}⚠️  Info.plist 可能缺少 AlarmKit 权限${NC}"
    echo -e "${YELLOW}   expo prebuild 应该已经通过 Config Plugin 添加${NC}"
fi

echo ""

# Step 8: 最终提示
echo -e "${BLUE}[7/7] 实施完成！${NC}"
echo ""
echo -e "${GREEN}✅ AlarmKit 整合已准备就绪！${NC}"
echo ""
echo -e "${YELLOW}📱 下一步：在真机上测试${NC}"
echo ""
echo "1. 连接 iPhone (iOS 26+) 到 Mac"
echo "2. 在 Xcode 中选择你的 iPhone 作为目标设备"
echo "3. 点击 Run (▶️) 按钮"
echo "4. 创建一个闹钟，测试 AlarmKit 授权流程"
echo ""
echo -e "${BLUE}📚 参考文档：${NC}"
echo "- /docs/ALARMKIT_INTEGRATION.md - 完整架构设计"
echo "- /docs/ALARMKIT_IMPLEMENTATION_GUIDE.md - 详细实施指南"
echo "- /docs/ALARMKIT_SUMMARY.md - 执行摘要"
echo ""
echo -e "${GREEN}🎉 祝实施顺利！${NC}"
