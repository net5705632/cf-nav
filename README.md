# 自定义网站导航系统 - 带美化后台管理版本

## 📖 项目简介

一个基于 **Cloudflare Workers** 构建的现代化、可自定义的网站导航系统，具备美观的后台管理界面。所有数据存储在 **Cloudflare KV** 中，无需数据库，部署简单，配置灵活。

## ✨ 核心特性

### 🎨 前端展示

- ✅ **响应式设计** - 完美适配各种设备
- ✅ **多搜索引擎** - 支持 Google、百度、Bing、搜狗等
- ✅ **一言功能** - 可选的每日一言显示
- ✅ **运行统计** - 实时显示网站稳定运行天数
- ✅ **图片懒加载** - 提升页面加载性能
- ✅ **卡片式布局** - 美观的网站卡片展示效果
- ✅ **动画效果** - 平滑的页面过渡动画

### ⚙️ 后台管理

- ✅ **现代化UI界面** - 采用最新设计语言
- ✅ **实时统计面板** - 分类、链接、搜索引擎数量一目了然
- ✅ **完整配置管理** - 支持网站所有设置的在线修改
- ✅ **拖拽排序** - 轻松调整链接顺序
- ✅ **批量操作** - 快速添加/删除分类和链接
- ✅ **操作反馈** - 实时提示保存状态
- ✅ **快捷键支持** - Ctrl+S 快速保存

## 🛠 技术架构

| 组件 | 技术选型 |
|------|----------|
| **运行时** | Cloudflare Workers |
| **数据存储** | Cloudflare KV |
| **前端框架** | Semantic UI + 自定义CSS |
| **图标库** | Font Awesome 6.4 |
| **拖拽库** | SortableJS |
| **API交互** | Fetch API + JSON |

## 🚀 快速部署

### 步骤一：环境准备

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 创建项目目录
mkdir my-navigation
cd my-navigation
```

### 步骤二：创建配置文件

创建 wrangler.toml：

```
name = "my-navigation"
main = "index.js"
compatibility_date = "2024-01-01"

[vars]
ADMIN_PASSWORD = "your-secure-password-here"  # 建议在此设置

[kv_namespaces]
binding = "NAV_CONFIG"
id = "your-kv-namespace-id"
```

### 步骤三：配置 KV 存储

```
# 创建 KV 命名空间
wrangler kv:namespace create "NAV_CONFIG"

# 获取命名空间 ID 并更新到 wrangler.toml
# 将返回的 id 填入 wrangler.toml 中
```

### 步骤四：创建主文件

创建 `index.js` 文件，将项目源代码复制到文件中。

### 步骤五：部署项目

```
wrangler deploy
```

## 📝 配置详解

### 基础配置字段

```
{
  "title": "网站标题",           // 网站主标题
  "subtitle": "网站副标题",       // 网站副标题
  "logo_icon": "child",          // Semantic UI 图标名称
  "hitokoto": true,              // 是否启用一言功能
  "search": true,                // 是否启用搜索功能
  "startDate": "2023-04-07",     // 网站开始运行日期
  "search_engine": [             // 搜索引擎配置
    {
      "name": "谷 歌",
      "template": "https://www.google.com/search?q=$s"
    },
    {
      "name": "百 度",
      "template": "https://www.baidu.com/s?wd=$s"
    }
  ],
  "lists": [                     // 网站分类配置
    {
      "name": "常用网站",
      "icon": "laptop",
      "list": [
        {
          "url": "https://example.com",
          "name": "示例网站",
          "desc": "网站描述信息"
        }
      ]
    }
  ]
}
```

### 图标支持

系统支持所有 [Semantic UI 图标](https://semantic-ui.com/elements/icon.html)，常用的有：

* `home` - 首页
* `laptop` - 电脑
* `globe` - 地球
* `code` - 代码
* `book` - 书籍
* `video` - 视频
* `music` - 音乐
* `game` - 游戏

## 🔧 使用方法

### 访问网站

1. 部署完成后，访问您的 Workers 域名（如：`https://my-navigation.your-username.workers.dev/`）
2. 首页将展示默认的导航界面

### 进入后台管理

**方式一：** 点击首页右下角的齿轮图标（⚙️）
**方式二：** 直接访问 `/admin` 路径（如：`https://my-navigation.your-username.workers.dev/admin`）

### 默认登录凭证

* **用户名** ：无需用户名
* **密码** ：`admin123`（ **请务必在首次登录后修改！** ）

## 🎨 后台功能详解

### 1. 统计面板

* 分类数量统计
* 链接总数统计
* 搜索引擎数量
* 运行天数显示

### 2. 基本设置

* 修改网站标题和副标题
* 更改网站图标
* 设置开始日期
* 开启/关闭功能开关

### 3. 搜索引擎管理

* 添加/删除搜索引擎
* 修改搜索引擎名称和模板
* 设置默认搜索引擎

### 4. 分类链接管理

* **添加分类** ：设置分类名称和图标
* **添加链接** ：填写网址、名称和描述
* **拖拽排序** ：按住拖动图标调整顺序
* **批量操作** ：快速编辑多个链接

## 🔒 安全配置

### 1. 修改管理员密码

**方式一：环境变量（推荐）**
在 `wrangler.toml` 中配置：

```
[vars]
ADMIN_PASSWORD = "your-strong-password-here"
```

**方式二：修改源代码**
在 `index.js` 中找到：

```
const ADMIN_PASSWORD = "admin123";
```

修改为您的密码。

### 2. HTTPS 强制

Cloudflare Workers 默认使用 HTTPS，确保数据传输安全。

### 3. Cookie 安全

后台使用 HttpOnly Cookie，防止 XSS 攻击。

## 🚨 故障排除

### 常见问题及解决方案

#### 问题1：KV 绑定失败

**症状** ：页面显示配置错误或空白
**解决** ：

```
# 检查绑定状态
wrangler kv:namespace list

# 重新绑定
wrangler kv:namespace create "NAV_CONFIG"
# 更新 wrangler.toml 中的 id
```

#### 问题2：后台无法登录

**症状** ：密码正确但无法登录
**解决** ：

1. 清除浏览器 Cookie
2. 重启 Workers

```
wrangler deploy --env production
```

#### 问题3：配置修改不生效

**症状** ：保存后页面无变化
**解决** ：

1. 点击后台的「清除缓存」按钮
2. 刷新页面或等待 1-2 分钟
3. 检查 KV 存储：

```
wrangler kv:key get --binding=NAV_CONFIG "site_config"
```

#### 问题4：样式加载失败

**症状** ：页面样式错乱
**解决** ：

1. 检查网络连接
2. 确保 CDN 链接可访问
3. 查看浏览器控制台错误信息

### 日志查看

```
# 查看实时日志
wrangler tail

# 查看特定日志
wrangler tail --format=json | grep "error"

# 停止日志查看
Ctrl + C
```

## 🔄 数据备份与恢复

### 备份配置

```
# 导出配置到文件
wrangler kv:key get --binding=NAV_CONFIG "site_config" > backup.json
```

### 恢复配置

```
# 从文件恢复配置
wrangler kv:key put --binding=NAV_CONFIG "site_config" --path=backup.json
```

### 重置配置


```
# 恢复默认配置
wrangler kv:key delete --binding=NAV_CONFIG "site_config"
```

## 📁 项目结构

```
my-navigation/
├── index.js                    # 主程序文件
├── wrangler.toml              # Cloudflare Workers 配置
├── README.md                  # 说明文档
├── backup.json                # 配置备份（可选）
└── package.json               # Node.js 依赖（如需要）
```

### 文件说明

**index.js** - 主程序文件

* 前端页面渲染
* 后台管理逻辑
* API 接口处理
* KV 数据操作

**wrangler.toml** - 部署配置

* 项目名称和版本
* KV 命名空间绑定
* 环境变量设置
* 兼容性日期

## 🎯 高级功能

### 自定义样式

您可以通过修改 CSS 变量来自定义主题：

```
:root {
  --primary-color: #4f46e5;      /* 主色调 */
  --primary-light: #6366f1;      /* 浅色调 */
  --success-color: #10b981;      /* 成功色 */
  --warning-color: #f59e0b;      /* 警告色 */
  --danger-color: #ef4444;       /* 危险色 */
  --dark-color: #1f2937;         /* 深色文字 */
  --light-color: #f9fafb;         /* 浅色背景 */
  --border-color: #e5e7eb;       /* 边框颜色 */
  --radius: 0.75rem;             /* 圆角大小 */
}
```

### 添加自定义 JavaScript

在 HTML 模板的 `<script>` 标签中添加您的自定义代码：

```
// 示例：添加页面访问统计
document.addEventListener('DOMContentLoaded', function() {
  console.log('导航页面已加载');
  // 添加您的自定义代码
});
```

### 扩展搜索模板

添加新的搜索引擎：


```
{
  "name": "DuckDuckGo",
  "template": "https://duckduckgo.com/?q=$s"
}
```

## 📊 性能优化

### 已实现的优化

1. **图片懒加载** - 只加载可视区域内的图片
2. **CSS/JS CDN** - 使用公共 CDN 加速资源加载
3. **KV 缓存** - 配置数据缓存减少读取次数
4. **代码压缩** - 内联 CSS/JS 减少请求数

### 进一步优化建议

1. **启用 Cloudflare CDN** - 在 Cloudflare Dashboard 开启
2. **设置缓存策略** - 调整 Workers 缓存时间
3. **优化图片** - 使用 WebP 格式图片

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

1. **Fork 项目**
2. **创建功能分支**
   **bash**
   
   ```
   git checkout -b feature/amazing-feature
   ```
3. **提交更改**
   **bash**
   
   ```
   git commit -m 'Add some amazing feature'
   ```
4. **推送到分支**
   **bash**
   
   ```
   git push origin feature/amazing-feature
   ```
5. **提交 Pull Request**

### 开发规范

* 使用一致的代码风格
* 添加必要的注释
* 更新相关文档
* 测试所有功能

## 📄 许可证

本项目基于 **MIT 许可证** 开源。

```
MIT License

Copyright (c) 2025 杨公子

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 支持与联系

### 问题反馈

如遇问题，请：

1. **查看文档** - 确认是否已有解决方案
2. **检查日志** - 使用 `wrangler tail` 查看错误
3. **提交 Issue** - 提供详细的重现步骤

### 获取帮助

* **Cloudflare Workers 文档** ：[https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)
* **Wrangler CLI 文档** ：[https://developers.cloudflare.com/workers/wrangler/](https://developers.cloudflare.com/workers/wrangler/)
* **KV 存储文档** ：[https://developers.cloudflare.com/kv/](https://developers.cloudflare.com/kv/)

## 🌟 更新日志

### v1.0.0 (2025-12-06)

* ✅ 初始版本发布
* ✅ 完整的前端展示功能
* ✅ 现代化的后台管理界面
* ✅ Cloudflare KV 数据存储
* ✅ 响应式设计适配
* ✅ 搜索引擎切换功能
* ✅ 拖拽排序支持

---

## 💡 使用提示

1. **首次使用必读** ：
   * 部署后立即修改管理员密码
   * 备份初始配置
   * 测试所有功能是否正常
2. **维护建议** ：
   * 定期备份配置数据
   * 关注 Cloudflare Workers 使用量
   * 及时更新依赖库版本
3. **性能监控** ：
   * 在 Cloudflare Dashboard 查看 Workers 性能
   * 监控 KV 存储读写次数
   * 关注页面加载时间
