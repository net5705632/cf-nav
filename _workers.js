/**
 * 自定义网站导航系统 - 带美化后台管理版本
 * 数据存储于 Cloudflare KV
 */

// KV 命名空间绑定（需要在 Cloudflare Workers 设置中绑定）
// 绑定名称为: NAV_CONFIG

// 管理员密码（需要在 Workers 环境变量中设置 ADMIN_PASSWORD）
// 如果没有设置环境变量，则使用默认值 "admin123"
let ADMIN_PASSWORD = "admin123";

// 默认配置
const DEFAULT_CONFIG = {
  title: "杨公子的导航",
  subtitle: "Yang's Navigation",
  logo_icon: "child",
  hitokoto: true,
  search: true,
  startDate: '2023-04-07',
  search_engine: [
    {
      name: "谷 歌",
      template: "https://www.google.com/search?q=$s"
    },
    {
      name: "百 度",
      template: "https://www.baidu.com/s?wd=$s"
    },
    {
      name: "必 应",
      template: "https://www.bing.com/search?q=$s"
    },
    {
      name: "搜 狗",
      template: "https://www.sogou.com/web?query=$s"
    }
  ],
  lists: []
};

// HTML 模板
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/semantic-ui-css@2.4.1/semantic.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/gh/sleepwood/cf-worker-dir@0.1.1/style.css" rel="stylesheet">
    <style>
        .ui.left.corner.label {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
        }
        .ui.left.corner.label img {
            margin: 0 !important;
            display: block !important;
        }
        #searchinput {
            padding-left: 40px !important;
        }
        .card, .segment, .menu {
            opacity: 0;
            animation: fadeIn 0.3s ease-in forwards;
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        .avatar.ui.image {
            transition: opacity 0.2s;
        }
        .avatar.ui.image[src] {
            opacity: 1;
        }
        /* 后台样式 - 参考简洁美化版 */
        body.admin-body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .admin-wrapper {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .admin-header {
            background: white;
            border-radius: 0.75rem;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        
        .config-form {
            background: white;
            border-radius: 0.75rem;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input[type="text"],
        .form-group input[type="date"],
        .form-group input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: #4f46e5;
            color: white;
        }
        
        .btn-primary:hover {
            background: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .btn-success {
            background: #10b981;
            color: white;
        }
        
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        
        .btn-logout {
            background: #6b7280;
            color: white;
        }
        
        .btn-logout:hover {
            background: #4b5563;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .list-editor {
            background: #f9fafb;
            border-radius: 0.75rem;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .list-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border: 1px solid #e5e7eb;
        }
        
        .message {
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            display: none;
        }
        
        .message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .login-container {
            max-width: 400px;
            margin: 80px auto;
            padding: 40px;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .two-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
        }
        
        .form-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f9fafb;
        }
        
        .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .header-right {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .stats {
            display: flex;
            gap: 20px;
            margin-top: 25px;
            flex-wrap: wrap;
        }
        
        .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            flex: 1;
            min-width: 150px;
            border: 1px solid #e5e7eb;
        }
        
        .stat-card .number {
            font-size: 2rem;
            font-weight: 700;
            color: #4f46e5;
        }
        
        .stat-card .label {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .checkbox-group {
            display: flex;
            gap: 20px;
        }
        
        .custom-checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .custom-checkbox input {
            margin-right: 8px;
        }
        
        .drag-handle {
            cursor: move;
            color: #9ca3af;
            padding: 5px;
            margin-right: 10px;
        }
        
        .links-list h4 {
            margin-bottom: 15px;
            color: #374151;
        }
    </style>
</head>
<body class="{{BODY_CLASS}}">
    {{CONTENT_PLACEHOLDER}}
    
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <script>
        // 基础功能立即执行
        (function() {
            // 搜索功能
            var activeEngine = '{{SEARCH_ENGINE_TEMPLATE}}';
            var searchFavicon = 'https://www.google.com/favicon.ico';
            
            // 事件委托处理点击
            document.addEventListener('click', function(e) {
                // 搜索引擎切换
                if (e.target.closest('#sengine a')) {
                    const engineLink = e.target.closest('a');
                    const engineLinks = document.querySelectorAll('#sengine a');
                    engineLinks.forEach(link => link.classList.remove('active'));
                    engineLink.classList.add('active');
                    activeEngine = engineLink.dataset.url;
                    try {
                        searchFavicon = activeEngine.match(/https{0,1}:\\/\\/[^\\/]+/)[0] + '/favicon.ico';
                        document.getElementById('search-fav').src = searchFavicon;
                    } catch (err) {
                        searchFavicon = 'https://www.google.com/favicon.ico';
                    }
                }
                
                // 搜索按钮点击
                if (e.target.closest('.search')) {
                    const searchInput = document.getElementById('searchinput');
                    const searchValue = searchInput ? searchInput.value.trim() : '';
                    if (searchValue) {
                        const url = activeEngine.replace('\\$s', encodeURIComponent(searchValue));
                        window.open(url);
                    }
                }
            });
            
            // 回车搜索
            const searchInput = document.getElementById('searchinput');
            if (searchInput) {
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        const searchValue = this.value.trim();
                        if (searchValue) {
                            const url = activeEngine.replace('\\$s', encodeURIComponent(searchValue));
                            window.open(url);
                        }
                    }
                });
            }
            
            // 延迟加载一言
            {{HITOKOTO_SCRIPT}}
            
            // 图片加载优化
            document.addEventListener('DOMContentLoaded', function() {
                const images = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            });
        })();
    </script>
</body>
</html>`;

// 工具函数
const el = (tag, attrs, content) => `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;

// 从 KV 获取配置
async function getConfig(env) {
  try {
    const config = await env.NAV_CONFIG.get('site_config');
    if (config) {
      return JSON.parse(config);
    }
  } catch (error) {
    console.error('Error reading config from KV:', error);
  }
  return DEFAULT_CONFIG;
}

// 保存配置到 KV
async function saveConfig(config, env) {
  try {
    await env.NAV_CONFIG.put('site_config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving config to KV:', error);
    return false;
  }
}

// 计算运行天数
function getDaysRunning(startDate) {
  try {
    const start = new Date(startDate);
    const current = new Date();
    if (isNaN(start.getTime())) return 0;
    const timeDifference = current - start;
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch (error) {
    console.error('Error calculating days running:', error);
    return 0;
  }
}

// 统计分类和链接数量
function getStats(config) {
  const totalCategories = config.lists.length;
  const totalLinks = config.lists.reduce((sum, category) => sum + category.list.length, 0);
  const searchEngines = config.search_engine.length;
  
  return { totalCategories, totalLinks, searchEngines };
}

// 获取 favicon URL
function getFavicon(url) {
  try {
    const domain = url.match(/https{0,1}:\/\//) ? url : `http://${url}`;
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain.split('/')[0] + '//' + domain.split('/')[2])}`;
  } catch (err) {
    return 'https://www.google.com/favicon.ico';
  }
}

// 渲染头部
function renderHeader(config) {
  const item = (template, name, isActive = false) => 
    el('a', ['class="item' + (isActive ? ' active' : '') + '"', `data-url="${template}"`], name);
  
  const nav = config.hitokoto ? 
    el('div', ['class="ui large secondary inverted menu"'], 
      el('div', ['class="item"'], 
        el('p', ['id="hitokoto"'], '条条大路通罗马')
      )
    ) : '';
  
  const title = el('h1', ['class="ui inverted header"'], 
    el('i', [`class="${config.logo_icon} icon"`], '') + 
    el('div', ['class="content"'], 
      config.title + 
      el('div', ['class="sub header"'], config.subtitle)
    )
  );
  
  const menu = config.search ? el('div', ['id="sengine"', 'class="ui bottom attached tabular inverted secondary menu"'], 
    el('div', ['class="header item"'], '&nbsp;') + 
    config.search_engine.map((link, key) => 
      item(link.template, link.name, key === 0)
    ).join('')
  ) : '';
  
  const input = config.search ? el('div', ['class="ui left corner labeled right icon fluid large input"', 'style="position: relative;"'], 
    el('div', ['class="ui left corner label"'], 
      el('img', ['id="search-fav"', 'class="left floated avatar ui image"', 'src="https://www.google.com/favicon.ico"', 'alt="搜索引擎"'], '')
    ) + 
    el('input', ['id="searchinput"', 'type="search"', 'placeholder="搜索你想要知道的……"', 'autocomplete="off"'], '') + 
    el('i', ['class="inverted circular search link icon"'], '')
  ) : '';
  
  return el('header', [], 
    el('div', ['id="head"', 'class="ui inverted vertical masthead center aligned segment"'], 
      nav + 
      el('div', ['id="title"', 'class="ui text container"'], 
        title + input + menu
      )
    )
  );
}

// 渲染主体内容
function renderMain(config) {
  const card = (url, name, desc) => 
    el('a', ['class="card"', `href="${url}"`, 'target="_blank"', 'rel="noopener"'], 
      el('div', ['class="content"'], 
        el('img', ['class="left floated avatar ui image"', `src="${getFavicon(url)}"`, 'loading="lazy"', 'alt="网站图标"', 'width="32"', 'height="32"'], '') + 
        el('div', ['class="header"'], name) + 
        el('div', ['class="meta"'], desc)
      )
    );
  
  return config.lists.map((item) => {
    const divider = el('h4', ['class="ui horizontal divider header"'], 
      el('i', [`class="${item.icon} icon"`], '') + item.name
    );
    
    const content = el('div', ['class="ui four stackable cards"'], 
      item.list.map(link => card(link.url, link.name, link.desc)).join('')
    );
    
    return el('div', ['class="ui basic segment"'], divider + content);
  }).join('');
}

// 渲染首页
function renderIndex(config, daysRunning) {
  const runningDaysFooter = el('footer', ['style="text-align: center; padding: 18px; color: #666; font-size: 15px; line-height: 1.8;"'], 
    el('div', [], `本站已稳定运行 ${daysRunning} 天`) +
    el('div', [], '本导航基于 ' + 
      el('a', ['style="color: #2185d0;"', 'href="https://www.cloudflare-cn.com"', 'target="_blank"', 'rel="noopener"'], 
        el('i', ['class="cloud icon"'], '') + 'Cloudflare Workers') + 
      ' 构建')
  );
  
  return renderHeader(config) + el('main', [], el('div', ['class="ui container"'], renderMain(config))) + runningDaysFooter;
}

// 后台登录页面
function renderLogin() {
  return `
    <div class="login-container">
      <h2>后台管理登录</h2>
      <p style="color: #6b7280; margin-bottom: 30px;">请输入管理员密码</p>
      <form id="loginForm">
        <div style="margin-bottom: 20px;">
          <input type="password" id="password" name="password" placeholder="请输入管理员密码" required style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
        </div>
        <button class="btn-primary" type="submit" style="width: 100%; padding: 14px;">
          登录
        </button>
      </form>
      <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const password = document.getElementById('password').value;
          const button = this.querySelector('button');
          const originalText = button.innerHTML;
          
          button.innerHTML = '登录中...';
          button.disabled = true;
          
          try {
            const response = await fetch('/yanghao/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: password })
            });
            
            if (response.ok) {
              window.location.href = '/yanghao/dashboard';
            } else {
              alert('密码错误！');
            }
          } catch (error) {
            console.error('Login error:', error);
          } finally {
            button.innerHTML = originalText;
            button.disabled = false;
          }
        });
      </script>
    </div>
  `;
}

// 后台管理面板
async function renderAdminPanel(config) {
  const stats = getStats(config);
  const daysRunning = getDaysRunning(config.startDate);
  
  // 统计数据卡片
  const statsCards = `
    <div class="stats">
      <div class="stat-card">
        <div class="number">${stats.totalCategories}</div>
        <div class="label">分类数量</div>
      </div>
      <div class="stat-card">
        <div class="number">${stats.totalLinks}</div>
        <div class="label">网站链接</div>
      </div>
      <div class="stat-card">
        <div class="number">${stats.searchEngines}</div>
        <div class="label">搜索引擎</div>
      </div>
      <div class="stat-card">
        <div class="number">${daysRunning}</div>
        <div class="label">运行天数</div>
      </div>
    </div>
  `;

  // 基本配置表单
  const basicConfig = `
    <div class="config-form">
      <div class="form-header">
        <h3>基本设置</h3>
      </div>
      
      <form id="basicConfigForm">
        <div class="form-group">
          <label>网站标题</label>
          <input type="text" name="title" value="${config.title || ''}">
        </div>
        
        <div class="form-group">
          <label>副标题</label>
          <input type="text" name="subtitle" value="${config.subtitle || ''}">
        </div>
        
        <div class="two-fields">
          <div class="form-group">
            <label>图标类名</label>
            <input type="text" name="logo_icon" value="${config.logo_icon || ''}" placeholder="child, home, globe">
          </div>
          <div class="form-group">
            <label>开始日期</label>
            <input type="date" name="startDate" value="${config.startDate || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>功能设置</label>
          <div class="checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" name="hitokoto" ${config.hitokoto ? 'checked' : ''}>
              一言显示
            </label>
            <label class="custom-checkbox">
              <input type="checkbox" name="search" ${config.search ? 'checked' : ''}>
              搜索功能
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            保存设置
          </button>
          <button type="button" class="btn-secondary" onclick="location.reload()">
            重置
          </button>
        </div>
      </form>
    </div>
  `;

  // 搜索引擎配置
  const searchEngineForm = `
    <div class="config-form">
      <div class="form-header">
        <h3>搜索引擎管理</h3>
      </div>
      
      <div id="searchEngines">
        ${config.search_engine.map((engine, index) => `
          <div class="list-item" data-index="${index}">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
              <div style="margin: 0;">
                <input type="text" class="engine-name" placeholder="引擎名称" value="${engine.name}" style="width: 100%;">
              </div>
              <div style="margin: 0;">
                <input type="text" class="engine-template" placeholder="搜索模板 (\$s为搜索词)" value="${engine.template}" style="width: 100%;">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="addSearchEngine()">
          添加搜索引擎
        </button>
        <button type="button" class="btn-primary" onclick="saveSearchEngines()">
          保存搜索引擎
        </button>
      </div>
    </div>
  `;

  // 分类管理
  const listsForm = `
    <div class="config-form">
      <div class="form-header">
        <h3>导航分类管理</h3>
      </div>
      
      <div id="categoryList">
        ${config.lists.map((category, catIndex) => `
          <div class="list-editor" data-index="${catIndex}">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="margin: 0;">
                <label>分类名称</label>
                <input type="text" class="category-name" value="${category.name}" style="width: 100%;">
              </div>
              <div style="margin: 0;">
                <label>图标类名</label>
                <input type="text" class="category-icon" value="${category.icon}" style="width: 100%;">
              </div>
            </div>
            
            <div class="links-list">
              <h4>网站列表</h4>
              ${category.list.map((link, linkIndex) => `
                <div class="list-item" data-link-index="${linkIndex}">
                  <i class="fas fa-grip-vertical drag-handle"></i>
                  <div style="flex: 1;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr auto; gap: 15px; align-items: center;">
                      <div style="margin: 0;">
                        <input type="text" class="link-url" value="${link.url}" placeholder="网址" style="width: 100%;">
                      </div>
                      <div style="margin: 0;">
                        <input type="text" class="link-name" value="${link.name}" placeholder="网站名称" style="width: 100%;">
                      </div>
                      <div style="margin: 0;">
                        <input type="text" class="link-desc" value="${link.desc}" placeholder="描述" style="width: 100%;">
                      </div>
                      <button type="button" class="btn-danger" onclick="removeLink(this)" style="padding: 8px 12px;">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 15px;">
              <button type="button" class="btn-secondary" onclick="addLink(${catIndex})">
                添加网站
              </button>
              <button type="button" class="btn-danger" onclick="removeCategory(${catIndex})">
                删除分类
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-primary" onclick="addCategory()">
          添加分类
        </button>
        <button type="button" class="btn-success" onclick="saveAllCategories()">
          保存所有配置
        </button>
      </div>
    </div>
  `;

  // 组合完整后台页面
  const adminScript = `
    <script>
      // 显示消息
      function showMessage(type, text) {
        const message = document.getElementById(type + 'Message');
        if (message) {
          message.innerHTML = text;
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 3000);
          message.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // 退出登录函数
      function logout() {
        if (confirm('确定要退出登录吗？')) {
          document.cookie = 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/yanghao;';
          window.location.href = '/yanghao';
        }
      }
      
      // 添加搜索引擎
      function addSearchEngine() {
        const container = document.getElementById('searchEngines');
        const index = container.children.length;
        const html = \`
          <div class="list-item" data-index="\${index}">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
              <div style="margin: 0;">
                <input type="text" class="engine-name" placeholder="引擎名称" style="width: 100%;">
              </div>
              <div style="margin: 0;">
                <input type="text" class="engine-template" placeholder="搜索模板 (\$s为搜索词)" style="width: 100%;">
              </div>
            </div>
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      }
      
      // 保存搜索引擎
      async function saveSearchEngines() {
        const engines = [];
        document.querySelectorAll('#searchEngines .list-item').forEach(item => {
          const name = item.querySelector('.engine-name').value;
          const template = item.querySelector('.engine-template').value;
          if (name && template) {
            engines.push({ name, template });
          }
        });
        
        try {
          const response = await fetch('/yanghao/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search_engine: engines })
          });
          
          if (response.ok) {
            showMessage('success', '搜索引擎配置已保存！');
          } else {
            throw new Error('保存失败');
          }
        } catch (error) {
          showMessage('error', '保存失败：' + error.message);
        }
      }
      
      // 添加分类
      function addCategory() {
        const container = document.getElementById('categoryList');
        const index = container.children.length;
        const html = \`
          <div class="list-editor" data-index="\${index}">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="margin: 0;">
                <label>分类名称</label>
                <input type="text" class="category-name" placeholder="新分类" style="width: 100%;">
              </div>
              <div style="margin: 0;">
                <label>图标类名</label>
                <input type="text" class="category-icon" placeholder="laptop" style="width: 100%;">
              </div>
            </div>
            <div class="links-list">
              <h4>网站列表</h4>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 15px;">
              <button type="button" class="btn-secondary" onclick="addLink(\${index})">
                添加网站
              </button>
              <button type="button" class="btn-danger" onclick="removeCategory(\${index})">
                删除分类
              </button>
            </div>
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      }
      
      // 添加网站链接
      function addLink(catIndex) {
        const categories = document.querySelectorAll('.list-editor');
        if (catIndex >= categories.length) return;
        
        const category = categories[catIndex];
        const linksList = category.querySelector('.links-list');
        
        // 确保有 h4 标题
        if (!linksList.querySelector('h4')) {
          linksList.innerHTML = '<h4>网站列表</h4>';
        }
        
        const html = \`
          <div class="list-item" data-link-index="\${linksList.querySelectorAll('.list-item').length}">
            <i class="fas fa-grip-vertical drag-handle"></i>
            <div style="flex: 1;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr auto; gap: 15px; align-items: center;">
                <div style="margin: 0;">
                  <input type="text" class="link-url" placeholder="网址" style="width: 100%;">
                </div>
                <div style="margin: 0;">
                  <input type="text" class="link-name" placeholder="网站名称" style="width: 100%;">
                </div>
                <div style="margin: 0;">
                  <input type="text" class="link-desc" placeholder="描述" style="width: 100%;">
                </div>
                <button type="button" class="btn-danger" onclick="removeLink(this)" style="padding: 8px 12px;">
                  删除
                </button>
              </div>
            </div>
          </div>
        \`;
        
        linksList.insertAdjacentHTML('beforeend', html);
        
        // 为新列表初始化排序
        if (linksList.querySelectorAll('.list-item').length > 0) {
          new Sortable(linksList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            handle: '.drag-handle'
          });
        }
      }
      
      // 删除链接
      function removeLink(button) {
        if (confirm('确定要删除这个链接吗？')) {
          button.closest('.list-item').remove();
        }
      }
      
      // 删除分类
      function removeCategory(index) {
        if (confirm('确定要删除这个分类吗？该分类下的所有链接也将被删除。')) {
          const categories = document.querySelectorAll('.list-editor');
          if (index < categories.length) {
            categories[index].remove();
          }
        }
      }
      
      // 保存所有分类
      async function saveAllCategories() {
        const categories = [];
        document.querySelectorAll('#categoryList .list-editor').forEach(category => {
          const name = category.querySelector('.category-name').value;
          const icon = category.querySelector('.category-icon').value;
          const links = [];
          
          category.querySelectorAll('.links-list .list-item').forEach(link => {
            const url = link.querySelector('.link-url').value;
            const name = link.querySelector('.link-name').value;
            const desc = link.querySelector('.link-desc').value;
            if (url && name) {
              links.push({ url, name, desc: desc || '' });
            }
          });
          
          if (name && icon) {
            categories.push({ name, icon, list: links });
          }
        });
        
        try {
          const response = await fetch('/yanghao/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lists: categories })
          });
          
          if (response.ok) {
            showMessage('success', '分类配置已保存！页面将在3秒后刷新...');
            setTimeout(() => location.reload(), 3000);
          } else {
            throw new Error('保存失败');
          }
        } catch (error) {
          showMessage('error', '保存失败：' + error.message);
        }
      }
      
      // 清除缓存
      async function clearCache() {
        try {
          const response = await fetch('/yanghao/clear-cache', { method: 'POST' });
          if (response.ok) {
            showMessage('success', '缓存已清除！');
          }
        } catch (error) {
          showMessage('error', '清除缓存失败');
        }
      }
      
      // 基本配置表单提交
      document.getElementById('basicConfigForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
          title: this.querySelector('[name="title"]').value,
          subtitle: this.querySelector('[name="subtitle"]').value,
          logo_icon: this.querySelector('[name="logo_icon"]').value,
          startDate: this.querySelector('[name="startDate"]').value,
          hitokoto: this.querySelector('[name="hitokoto"]').checked,
          search: this.querySelector('[name="search"]').checked
        };
        
        try {
          const response = await fetch('/yanghao/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            showMessage('success', '基本配置已保存！');
          } else {
            throw new Error('保存失败');
          }
        } catch (error) {
          showMessage('error', '保存失败：' + error.message);
        }
      });
    </script>
  `;
  
  return `
    <div class="admin-wrapper">
      <div class="admin-header">
        <div class="header-actions">
          <div>
            <h1>导航后台管理系统</h1>
            <p>管理员，您好！当前配置：${stats.totalCategories} 个分类，${stats.totalLinks} 个链接，已运行 ${daysRunning} 天</p>
          </div>
          <div class="header-right">
            <button class="btn-logout" onclick="logout()">
              退出登录
            </button>
          </div>
        </div>
        <div style="display: flex; gap: 15px; margin-top: 20px;">
          <a href="/" class="btn-secondary" style="background: #e5e7eb; color: #374151; text-decoration: none;">
            返回首页
          </a>
          <button class="btn-secondary" onclick="clearCache()" style="background: #e5e7eb; color: #374151;">
            清除缓存
          </button>
          <button class="btn-secondary" onclick="location.reload()" style="background: #e5e7eb; color: #374151;">
            刷新页面
          </button>
        </div>
        ${statsCards}
      </div>
      
      ${basicConfig}
      ${searchEngineForm}
      ${listsForm}
      
      <div class="message success" id="successMessage"></div>
      <div class="message error" id="errorMessage"></div>
      
      ${adminScript}
    </div>
  `;
}

// 处理后台 API 请求
async function handleAdminAPI(request, config, env, adminPassword) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 登录验证
  if (path === '/yanghao/login' && request.method === 'POST') {
    try {
      const { password } = await request.json();
      if (password === adminPassword) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 
            'Set-Cookie': `admin_auth=${adminPassword}; HttpOnly; Path=/yanghao; Max-Age=86400`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return new Response(JSON.stringify({ error: '密码错误' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 退出登录
  if (path === '/yanghao/logout' && request.method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 302,
      headers: { 
        'Location': '/yanghao',
        'Set-Cookie': 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/yanghao; HttpOnly'
      }
    });
  }

  // 验证管理员身份（除了登录和退出请求）
  if (path !== '/yanghao/login' && path !== '/yanghao/logout') {
    const cookie = request.headers.get('Cookie') || '';
    if (!cookie.includes(`admin_auth=${adminPassword}`)) {
      return new Response(JSON.stringify({ error: '未授权' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 更新配置
  if (path === '/yanghao/config' && request.method === 'PUT') {
    try {
      const updates = await request.json();
      const updatedConfig = { ...config, ...updates };
      const saved = await saveConfig(updatedConfig, env);
      
      if (saved) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 清除缓存
  if (path === '/yanghao/clear-cache' && request.method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: '未找到' }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 主请求处理函数
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 获取管理员密码（环境变量优先）
  const adminPassword = env.ADMIN_PASSWORD || ADMIN_PASSWORD;

  // 获取配置
  const config = await getConfig(env);

  // 处理后台相关路由
  if (path.startsWith('/yanghao')) {
    // 后台登录页面
    if (path === '/yanghao' || path === '/yanghao/') {
      const cookie = request.headers.get('Cookie') || '';
      if (cookie.includes(`admin_auth=${adminPassword}`)) {
        const adminHTML = await renderAdminPanel(config);
        const html = HTML_TEMPLATE
          .replace('{{TITLE}}', '后台管理 - ' + config.title)
          .replace('{{BODY_CLASS}}', 'admin-body')
          .replace('{{CONTENT_PLACEHOLDER}}', adminHTML)
          .replace('{{SEARCH_ENGINE_TEMPLATE}}', '')
          .replace('{{HITOKOTO_SCRIPT}}', '');
        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } else {
        const html = HTML_TEMPLATE
          .replace('{{TITLE}}', '后台登录')
          .replace('{{BODY_CLASS}}', 'admin-body')
          .replace('{{CONTENT_PLACEHOLDER}}', renderLogin())
          .replace('{{SEARCH_ENGINE_TEMPLATE}}', '')
          .replace('{{HITOKOTO_SCRIPT}}', '');
        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
    }

    // 后台仪表板
    if (path === '/yanghao/dashboard') {
      const cookie = request.headers.get('Cookie') || '';
      if (cookie.includes(`admin_auth=${adminPassword}`)) {
        const adminHTML = await renderAdminPanel(config);
        const html = HTML_TEMPLATE
          .replace('{{TITLE}}', '后台管理 - ' + config.title)
          .replace('{{BODY_CLASS}}', 'admin-body')
          .replace('{{CONTENT_PLACEHOLDER}}', adminHTML)
          .replace('{{SEARCH_ENGINE_TEMPLATE}}', '')
          .replace('{{HITOKOTO_SCRIPT}}', '');
        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } else {
        return Response.redirect(new URL('/yanghao', request.url), 302);
      }
    }

    // 后台 API
    return handleAdminAPI(request, config, env, adminPassword);
  }

  // 首页
  if (path === '/' || path === '') {
    const daysRunning = getDaysRunning(config.startDate);
    const htmlContent = HTML_TEMPLATE
      .replace('{{TITLE}}', config.title + ' - ' + config.subtitle)
      .replace('{{BODY_CLASS}}', '')
      .replace('{{CONTENT_PLACEHOLDER}}', renderIndex(config, daysRunning))
      .replace('{{SEARCH_ENGINE_TEMPLATE}}', config.search_engine[0]?.template || '')
      .replace('{{HITOKOTO_SCRIPT}}', config.hitokoto ? `
        setTimeout(() => {
          const hitokotoScript = document.createElement('script');
          hitokotoScript.src = 'https://v1.hitokoto.cn/?encode=js&select=%23hitokoto';
          document.head.appendChild(hitokotoScript);
        }, 1500);
      ` : '');
    
    return new Response(htmlContent, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff',
      },
    });
  }

  // 404 页面
  return new Response('页面未找到', {
    status: 404,
    headers: { 'content-type': 'text/plain;charset=UTF-8' }
  });
}

// 事件监听 - 使用 Workers 模块格式
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
