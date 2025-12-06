# 自定义网站导航系统 - 带美化后台管理

一个基于 Cloudflare Workers 构建的现代化、可自定义的网站导航系统，具备美观的后台管理界面，所有数据存储在 Cloudflare KV 中。

## 🚀 功能特性

### 前端功能
- **响应式设计**：适配各种设备屏幕尺寸
- **搜索引擎切换**：支持多个搜索引擎（Google、百度、Bing、搜狗等）
- **一言显示**：可选的每日一言功能
- **图片懒加载**：优化页面加载速度
- **运行天数统计**：显示网站稳定运行时间
- **卡片式布局**：美观的网站卡片展示

### 后台管理功能
- **美观的现代化界面**：采用现代UI设计
- **实时统计面板**：显示分类、链接、搜索引擎数量等数据
- **完整配置管理**：
  - 网站基本信息设置
  - 搜索引擎管理
  - 分类和链接管理（支持拖拽排序）
  - 功能开关控制
- **操作反馈**：实时的成功/错误消息提示
- **快捷键支持**：Ctrl+S 保存配置

## 🛠 技术栈

- **运行时**: Cloudflare Workers
- **存储**: Cloudflare KV
- **前端框架**: Semantic UI + 自定义CSS
- **图标**: Font Awesome 6.4
- **交互**: SortableJS（拖拽排序）
- **API**: 纯 JavaScript 实现

## 📦 部署步骤

### 1. 准备工作
1. 注册 [Cloudflare](https://www.cloudflare.com/) 账户
2. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)：
   ```bash
   npm install -g wrangler
