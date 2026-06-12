# SecurePass - 密码管理器

MI SecurePass 密码管理器，使用 Vite + ES Modules 重构后的现代化版本。

## 项目概述

本项目将原有的单文件 HTML 密码管理器重构为模块化的 Vite + ES Modules 项目，界面和功能完全不变，只重构代码结构方便后期维护。

### 技术栈

- **构建工具**: Vite 5.x
- **模块化**: ES Modules (原生 JavaScript，无框架)
- **加密**: CryptoJS 4.1.1 (AES 加密)
- **图标**: Font Awesome 6.4.0
- **样式**: CSS Modules (组件化拆分)

## 功能特性

### 核心功能
- ✅ 主密码认证（登录/设置主密码）
- ✅ 密码列表（分类展示、搜索过滤）
- ✅ 密码编辑（新增/编辑/删除密码条目）
- ✅ AES 加密引擎（CryptoJS 加解密）
- ✅ 书签管理（URL 书签的增删改查）
- ✅ 导入导出（JSON 格式，含冲突处理）
- ✅ 设置（自动锁定、备份提醒等）
- ✅ 密码生成器（随机密码生成）
- ✅ 收藏夹 & 最近使用
- ✅ 安全审计（弱密码检测、泄露检测等）
- ✅ 历史版本（Git 同步）
- ✅ GitHub/Gitee/Gitea/GitLab 多点存储

## 项目结构

```
mi-refactored/
├── index.html              # 入口 HTML
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
├── src/
│   ├── main.js             # 主入口 JS
│   ├── modules/
│   │   ├── auth.js         # 主密码认证
│   │   ├── password-list.js # 密码列表展示
│   │   ├── password-editor.js # 密码编辑
│   │   ├── crypto.js       # 加密/解密引擎
│   │   ├── bookmark.js     # 书签管理
│   │   ├── import-export.js # 导入导出
│   │   ├── settings.js     # 设置管理
│   │   └── generator.js    # 密码生成器
│   ├── utils/
│   │   └── storage.js      # localStorage 封装
│   └── styles/
│       ├── main.css        # @import 所有子 CSS
│       ├── variables.css   # CSS 变量
│       ├── base.css        # 基础重置
│       ├── layout.css      # 整体布局
│       ├── sidebar.css     # 侧边导航
│       ├── forms.css       # 表单输入
│       ├── modals.css      # 模态框
│       ├── password-list.css # 密码列表
│       ├── password-detail.css # 密码详情
│       ├── generator.css   # 密码生成器
│       ├── import-export.css # 导入导出
│       ├── bookmarks.css   # 书签管理
│       └── responsive.css  # 响应式
└── public/
    └── img/
        └── fa-lock.svg     # favicon
```

## 快速开始

### 安装依赖

```bash
cd mi-refactored
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## CDN 依赖

- CryptoJS 4.1.1: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
- Font Awesome 6.4.0: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

## 使用说明

### 首次使用
1. 打开应用后，输入主密码并确认
2. 点击"解锁密码库"创建新的密码保险箱
3. 开始添加你的密码

### 添加密码
1. 点击侧边栏的"所有密码"
2. 点击右上角的"+"按钮
3. 填写网站名称、用户名、密码等信息
4. 点击"保存"

### 生成安全密码
1. 在密码输入框旁边点击生成按钮
2. 或点击侧边栏的"生成密码"工具
3. 调整密码长度和字符类型
4. 点击"复制"复制生成的密码

### 导入/导出
- **导出**: 点击下载图标，选择导出格式（加密或明文）
- **导入**: 点击上传图标，选择 JSON 文件导入

### 同步到 Git
1. 点击侧边栏的"存储设置"
2. 选择存储类型（GitHub/多点存储）
3. 配置 Token 和仓库路径
4. 保存后点击同步按钮

## 重构说明

### 为什么重构？
- 原代码为 6434 行的单文件 HTML，难以维护
- 功能和样式混杂在一起
- 没有模块化，难以扩展

### 重构目标
- ✅ 界面和功能完全不变
- ✅ CSS 组件化拆分
- ✅ JS 模块化
- ✅ 加密功能完整性保留
- ✅ CDN 依赖保留

### 模块划分

| 模块 | 职责 |
|------|------|
| crypto.js | 加密/解密、密码强度计算 |
| auth.js | 主密码认证 |
| password-list.js | 密码列表渲染和搜索 |
| password-editor.js | 密码增删改 |
| bookmark.js | 书签管理 |
| import-export.js | 导入导出功能 |
| settings.js | 偏好设置和存储设置 |
| generator.js | 密码生成器 |
| storage.js | localStorage 封装 |

## 注意事项

1. **数据安全**: 请务必记住主密码，丢失后将无法恢复数据
2. **备份**: 定期导出密码数据作为备份
3. **同步**: 使用 Git 同步时请妥善保管 Token
4. **本地存储**: 浏览器 localStorage 可能有存储限制

## License

MIT License
