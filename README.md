自定义网站导航系统 - 带美化后台管理
一个基于 Cloudflare Workers 构建的现代化、可自定义的网站导航系统，具备美观的后台管理界面，所有数据存储在 Cloudflare KV 中。

🚀 功能特性
前端功能
响应式设计：适配各种设备屏幕尺寸

搜索引擎切换：支持多个搜索引擎（Google、百度、Bing、搜狗等）

一言显示：可选的每日一言功能

图片懒加载：优化页面加载速度

运行天数统计：显示网站稳定运行时间

卡片式布局：美观的网站卡片展示

后台管理功能
美观的现代化界面：采用现代UI设计

实时统计面板：显示分类、链接、搜索引擎数量等数据

完整配置管理：

网站基本信息设置

搜索引擎管理

分类和链接管理（支持拖拽排序）

功能开关控制

操作反馈：实时的成功/错误消息提示

快捷键支持：Ctrl+S 保存配置

🛠 技术栈
运行时: Cloudflare Workers

存储: Cloudflare KV

前端框架: Semantic UI + 自定义CSS

图标: Font Awesome 6.4

交互: SortableJS（拖拽排序）

API: 纯 JavaScript 实现

📦 部署步骤
1. 准备工作
注册 Cloudflare 账户

安装 Wrangler CLI：

bash
npm install -g wrangler
登录 Wrangler：

bash
wrangler login
2. 创建项目
创建一个新目录并进入：

bash
mkdir my-navigation
cd my-navigation
创建 wrangler.toml 配置文件：

toml
name = "my-navigation"
main = "index.js"
compatibility_date = "2023-09-04"

[kv_namespaces]
binding = "NAV_CONFIG"
id = "your-kv-namespace-id"
3. 配置 KV 存储
创建 KV 命名空间：

bash
wrangler kv:namespace create "NAV_CONFIG"
复制返回的命名空间 ID，更新到 wrangler.toml 文件中

4. 配置环境变量（可选）
建议在 Workers 环境变量中设置管理员密码：

bash
# 在 Cloudflare Dashboard 中设置
ADMIN_PASSWORD = "your-secure-password"
或者在代码中修改 ADMIN_PASSWORD 常量（不建议用于生产环境）。

5. 部署到 Cloudflare
bash
wrangler deploy
⚙️ 配置说明
默认配置结构
javascript
{
  "title": "网站标题",
  "subtitle": "网站副标题",
  "logo_icon": "child", // Semantic UI 图标类名
  "hitokoto": true,     // 是否显示一言
  "search": true,       // 是否启用搜索
  "startDate": "2023-04-07", // 网站开始运行日期
  "search_engine": [    // 搜索引擎配置
    {
      "name": "谷 歌",
      "template": "https://www.google.com/search?q=$s"
    }
  ],
  "lists": [            // 分类和链接
    {
      "name": "常用网站",
      "icon": "laptop",
      "list": [
        {
          "url": "https://example.com",
          "name": "网站名称",
          "desc": "网站描述"
        }
      ]
    }
  ]
}
🔧 使用方法
访问后台管理
访问您的 Workers 域名

点击页面右下角的齿轮图标（管理员链接）

输入管理员密码（默认：admin123）

添加分类和链接
登录后台管理

在「导航分类管理」部分点击「添加分类」

填写分类名称和图标

在分类中添加网站链接

修改基本设置
在后台的「基本设置」部分

修改标题、副标题、图标等

点击「保存设置」

🎨 自定义样式
系统使用以下 CSS 变量，可在代码中修改：

css
:root {
  --primary-color: #4f46e5;
  --primary-light: #6366f1;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --dark-color: #1f2937;
  --light-color: #f9fafb;
  --border-color: #e5e7eb;
  --radius: 0.75rem;
}
🔒 安全建议
修改默认密码：务必修改默认的 admin123 密码

使用环境变量：将管理员密码设置为环境变量

定期备份：定期导出 KV 中的数据作为备份

HTTPS：确保通过 HTTPS 访问

🚨 故障排除
常见问题
KV 绑定错误

确保 wrangler.toml 中的 KV 命名空间 ID 正确

运行 wrangler kv:namespace list 确认绑定

后台无法登录

检查管理员密码是否正确

清除浏览器 cookie 后重试

配置不生效

点击后台的「清除缓存」按钮

检查 KV 存储中是否有正确的配置数据

日志查看
bash
wrangler tail --format pretty
📁 项目结构
text
├── index.js          # 主程序文件
├── wrangler.toml     # Cloudflare Workers 配置
├── README.md         # 说明文档
└── package.json      # 项目依赖（如果需要）
📄 许可证
本项目基于 MIT 许可证开源。

🤝 贡献
欢迎提交 Issue 和 Pull Request！

📞 支持
如有问题，请：

查看 Cloudflare Workers 文档

在 GitHub 提交 Issue

查看代码注释和本说明文档

提示：首次部署后，请立即登录后台修改管理员密码！
