/**
 * 自定义网站导航系统 - 带美化后台管理版本
 * 数据存储于 Cloudflare KV
 */

// KV 命名空间绑定（需要在 Cloudflare Workers 设置中绑定）
// 绑定名称为: NAV_CONFIG

// 管理员密码（建议在 Workers 环境变量中设置，这里作为演示使用固定值）
const ADMIN_PASSWORD = "admin123";

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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
        /* 后台样式 - 美化版 */
        :root {
            --primary-color: #4f46e5;
            --primary-light: #6366f1;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --dark-color: #1f2937;
            --light-color: #f9fafb;
            --border-color: #e5e7eb;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius: 0.75rem;
        }
        
        body.admin-body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .admin-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .admin-header {
            background: white;
            border-radius: var(--radius);
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }
        
        .admin-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
        }
        
        .admin-header h1 {
            color: var(--dark-color);
            margin: 0 0 10px 0;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .admin-header p {
            color: #6b7280;
            margin: 0 0 25px 0;
            font-size: 1.1rem;
        }
        
        .admin-header .stats {
            display: flex;
            gap: 20px;
            margin-top: 25px;
        }
        
        .stat-card {
            background: var(--light-color);
            padding: 20px;
            border-radius: var(--radius);
            flex: 1;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }
        
        .stat-card .number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            line-height: 1;
        }
        
        .stat-card .label {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .config-form {
            background: white;
            border-radius: var(--radius);
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
        }
        
        .form-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--light-color);
        }
        
        .form-header i {
            background: var(--primary-color);
            color: white;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            margin-right: 15px;
        }
        
        .form-header h3 {
            margin: 0;
            color: var(--dark-color);
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .form-header .subtitle {
            color: #6b7280;
            font-size: 0.95rem;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid var(--border-color);
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
            justify-content: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-light);
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
        
        .btn-success {
            background: var(--success-color);
            color: white;
        }
        
        .btn-success:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        
        .btn-danger {
            background: var(--danger-color);
            color: white;
        }
        
        .list-editor {
            background: var(--light-color);
            border-radius: var(--radius);
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }
        
        .list-editor:hover {
            border-color: var(--primary-light);
            box-shadow: var(--shadow);
        }
        
        .list-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }
        
        .list-item:hover {
            border-color: var(--primary-light);
            box-shadow: var(--shadow-sm);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--dark-color);
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        .form-group input[type="text"],
        .form-group input[type="date"],
        .form-group input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .checkbox-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .custom-checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .custom-checkbox input {
            display: none;
        }
        
        .custom-checkbox .checkmark {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color);
            border-radius: 6px;
            margin-right: 10px;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .custom-checkbox input:checked + .checkmark {
            background: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .custom-checkbox input:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            color: white;
            font-size: 14px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .links-list {
            margin-top: 20px;
        }
        
        .links-list h4 {
            color: var(--dark-color);
            margin: 0 0 15px 0;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .login-container {
            max-width: 440px;
            margin: 80px auto;
            padding: 50px;
            background: white;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            text-align: center;
        }
        
        .login-icon {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 20px;
        }
        
        .message {
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            display: none;
            animation: slideIn 0.3s ease;
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
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .secret-admin-link {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .secret-admin-link:hover {
            transform: scale(1.1) rotate(90deg);
            background: var(--primary-light);
        }
        
        .drag-handle {
            cursor: move;
            color: #9ca3af;
            padding: 5px;
            margin-right: 10px;
        }
        
        .drag-handle:hover {
            color: var(--primary-color);
        }
        
        .sortable-ghost {
            opacity: 0.4;
            background: #f3f4f6;
        }
        
        .sortable-chosen {
            box-shadow: 0 0 0 2px var(--primary-color);
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
async function getConfig() {
  try {
    const config = await NAV_CONFIG.get('site_config');
    if (config) {
      return JSON.parse(config);
    }
  } catch (error) {
    console.error('Error reading config from KV:', error);
  }
  return DEFAULT_CONFIG;
}

// 保存配置到 KV
async function saveConfig(config) {
  try {
    await NAV_CONFIG.put('site_config', JSON.stringify(config));
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
      <div class="login-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 10px;">后台管理登录</h2>
      <p style="color: #6b7280; margin-bottom: 30px;">请输入管理员密码以继续</p>
      <form id="loginForm" style="text-align: left;">
        <div class="form-group">
          <label for="password">
            <i class="fas fa-key"></i> 密码
          </label>
          <input type="password" id="password" name="password" placeholder="请输入管理员密码" required>
        </div>
        <button class="btn btn-primary" type="submit" style="width: 100%; padding: 14px;">
          <i class="fas fa-sign-in-alt"></i> 登录
        </button>
      </form>
      <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const password = document.getElementById('password').value;
          const button = this.querySelector('button');
          const originalText = button.innerHTML;
          
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
          button.disabled = true;
          
          try {
            const response = await fetch('/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            });
            
            if (response.ok) {
              window.location.href = '/admin/dashboard';
            } else {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'message error';
              errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> 密码错误！';
              errorDiv.style.display = 'block';
              this.appendChild(errorDiv);
              setTimeout(() => errorDiv.remove(), 3000);
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
        <div class="label">
          <i class="fas fa-folder"></i> 分类数量
        </div>
      </div>
      <div class="stat-card">
        <div class="number">${stats.totalLinks}</div>
        <div class="label">
          <i class="fas fa-link"></i> 网站链接
        </div>
      </div>
      <div class="stat-card">
        <div class="number">${stats.searchEngines}</div>
        <div class="label">
          <i class="fas fa-search"></i> 搜索引擎
        </div>
      </div>
      <div class="stat-card">
        <div class="number">${daysRunning}</div>
        <div class="label">
          <i class="fas fa-calendar-alt"></i> 运行天数
        </div>
      </div>
    </div>
  `;

  // 生成配置编辑表单的HTML
  const configForm = `
    <div class="config-form">
      <div class="form-header">
        <i class="fas fa-cog"></i>
        <div>
          <h3>基本设置</h3>
          <div class="subtitle">配置网站的基本信息和功能开关</div>
        </div>
      </div>
      
      <form id="basicConfigForm">
        <div class="form-group">
          <label><i class="fas fa-heading"></i> 网站标题</label>
          <input type="text" name="title" value="${config.title || ''}" placeholder="输入网站标题">
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-heading"></i> 副标题</label>
          <input type="text" name="subtitle" value="${config.subtitle || ''}" placeholder="输入副标题">
        </div>
        
        <div class="two-fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="form-group">
            <label><i class="fas fa-icons"></i> 图标类名</label>
            <input type="text" name="logo_icon" value="${config.logo_icon || ''}" placeholder="如：child, home, globe">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-calendar-day"></i> 开始日期</label>
            <input type="date" name="startDate" value="${config.startDate || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-toggle-on"></i> 功能开关</label>
          <div class="checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" name="hitokoto" ${config.hitokoto ? 'checked' : ''}>
              <span class="checkmark"></span>
              一言显示
            </label>
            <label class="custom-checkbox">
              <input type="checkbox" name="search" ${config.search ? 'checked' : ''}>
              <span class="checkmark"></span>
              搜索功能
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> 保存设置
          </button>
          <button type="button" class="btn btn-secondary" onclick="location.reload()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
      </form>
    </div>
  `;

  // 生成搜索引擎配置
  const searchEngineForm = `
    <div class="config-form">
      <div class="form-header">
        <i class="fas fa-search"></i>
        <div>
          <h3>搜索引擎管理</h3>
          <div class="subtitle">配置可用的搜索引擎选项</div>
        </div>
      </div>
      
      <div id="searchEngines">
        ${config.search_engine.map((engine, index) => `
          <div class="list-item" data-index="${index}">
            <div class="two-fields" style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
              <div class="form-group">
                <input type="text" class="engine-name" placeholder="引擎名称" value="${engine.name}">
              </div>
              <div class="form-group">
                <input type="text" class="engine-template" placeholder="搜索模板 ($s为搜索词)" value="${engine.template}">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="addSearchEngine()">
          <i class="fas fa-plus"></i> 添加搜索引擎
        </button>
        <button type="button" class="btn btn-primary" onclick="saveSearchEngines()">
          <i class="fas fa-save"></i> 保存搜索引擎
        </button>
      </div>
    </div>
  `;

  // 生成分类列表编辑
  const listsForm = `
    <div class="config-form">
      <div class="form-header">
        <i class="fas fa-list"></i>
        <div>
          <h3>导航分类管理</h3>
          <div class="subtitle">管理网站分类和链接</div>
        </div>
      </div>
      
      <div id="categoryList">
        ${config.lists.map((category, catIndex) => `
          <div class="list-editor" data-index="${catIndex}">
            <div class="form-header" style="border: none; padding: 0; margin-bottom: 20px;">
              <i class="fas fa-folder" style="background: #f59e0b;"></i>
              <div style="flex: 1;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div class="form-group" style="margin: 0;">
                    <label>分类名称</label>
                    <input type="text" class="category-name" placeholder="输入分类名称" value="${category.name}">
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label>图标类名</label>
                    <input type="text" class="category-icon" placeholder="如：laptop, globe" value="${category.icon}">
                  </div>
                </div>
              </div>
            </div>
            
            <div class="links-list">
              <h4><i class="fas fa-link"></i> 网站列表</h4>
              ${category.list.map((link, linkIndex) => `
                <div class="list-item" data-link-index="${linkIndex}">
                  <i class="fas fa-grip-vertical drag-handle"></i>
                  <div style="flex: 1;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 15px;">
                      <div class="form-group" style="margin: 0;">
                        <input type="text" class="link-url" placeholder="网址 (https://...)" value="${link.url}">
                      </div>
                      <div class="form-group" style="margin: 0;">
                        <input type="text" class="link-name" placeholder="网站名称" value="${link.name}">
                      </div>
                      <div class="form-group" style="margin: 0;">
                        <input type="text" class="link-desc" placeholder="描述" value="${link.desc}">
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-danger" onclick="removeLink(this)" style="margin-left: 10px; padding: 8px 12px;">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>
            
            <div class="form-actions" style="margin-top: 20px;">
              <button type="button" class="btn btn-secondary" onclick="addLink(${catIndex})">
                <i class="fas fa-plus"></i> 添加网站
              </button>
              <button type="button" class="btn btn-danger" onclick="removeCategory(${catIndex})">
                <i class="fas fa-trash"></i> 删除分类
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="form-actions" style="margin-top: 30px;">
        <button type="button" class="btn btn-primary" onclick="addCategory()">
          <i class="fas fa-plus"></i> 添加分类
        </button>
        <button type="button" class="btn btn-success" onclick="saveAllCategories()">
          <i class="fas fa-save"></i> 保存所有配置
        </button>
      </div>
    </div>
  `;

  // 组合完整的后台页面
  return `
    <div class="admin-wrapper">
      <div class="admin-header">
        <h1><i class="fas fa-sliders-h"></i> 导航后台管理系统</h1>
        <p>欢迎回来！在这里管理您的导航网站。所有更改将自动保存到 Cloudflare KV。</p>
        <div style="display: flex; gap: 15px;">
          <a href="/" class="btn btn-secondary">
            <i class="fas fa-home"></i> 返回首页
          </a>
          <button class="btn" onclick="clearCache()" style="background: #e5e7eb; color: #374151;">
            <i class="fas fa-sync-alt"></i> 清除缓存
          </button>
          <button class="btn" onclick="location.reload()" style="background: #f3f4f6; color: #374151;">
            <i class="fas fa-redo"></i> 刷新页面
          </button>
        </div>
        ${statsCards}
      </div>
      
      ${configForm}
      ${searchEngineForm}
      ${listsForm}
      
      <div class="message success" id="successMessage"></div>
      <div class="message error" id="errorMessage"></div>
      
      <script>
        let currentConfig = ${JSON.stringify(config)};
        
        // 初始化排序功能
        document.addEventListener('DOMContentLoaded', function() {
          // 为每个分类的链接列表初始化排序
          document.querySelectorAll('.links-list').forEach(linksList => {
            new Sortable(linksList.querySelectorAll('.list-item')[0]?.parentElement || linksList, {
              animation: 150,
              ghostClass: 'sortable-ghost',
              chosenClass: 'sortable-chosen',
              handle: '.drag-handle',
              onEnd: function() {
                // 更新顺序后可以在这里处理
              }
            });
          });
        });
        
        // 显示消息
        function showMessage(type, text) {
          const message = document.getElementById(type + 'Message');
          message.innerHTML = \`<i class="fas fa-\${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> \${text}\`;
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 3000);
          
          // 滚动到消息位置
          message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // 添加搜索引擎
        function addSearchEngine() {
          const container = document.getElementById('searchEngines');
          const index = container.children.length;
          const html = \`
            <div class="list-item" data-index="\${index}">
              <div class="two-fields" style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
                <div class="form-group">
                  <input type="text" class="engine-name" placeholder="引擎名称">
                </div>
                <div class="form-group">
                  <input type="text" class="engine-template" placeholder="搜索模板 (\$s为搜索词)">
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
            const response = await fetch('/admin/config', {
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
              <div class="form-header" style="border: none; padding: 0; margin-bottom: 20px;">
                <i class="fas fa-folder" style="background: #f59e0b;"></i>
                <div style="flex: 1;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group" style="margin: 0;">
                      <label>分类名称</label>
                      <input type="text" class="category-name" placeholder="输入分类名称">
                    </div>
                    <div class="form-group" style="margin: 0;">
                      <label>图标类名</label>
                      <input type="text" class="category-icon" placeholder="如：laptop, globe">
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="links-list">
                <h4><i class="fas fa-link"></i> 网站列表</h4>
                <!-- 初始为空 -->
              </div>
              
              <div class="form-actions" style="margin-top: 20px;">
                <button type="button" class="btn btn-secondary" onclick="addLink(\${index})">
                  <i class="fas fa-plus"></i> 添加网站
                </button>
                <button type="button" class="btn btn-danger" onclick="removeCategory(\${index})">
                  <i class="fas fa-trash"></i> 删除分类
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
            linksList.innerHTML = '<h4><i class="fas fa-link"></i> 网站列表</h4>';
          }
          
          const html = \`
            <div class="list-item" data-link-index="\${linksList.querySelectorAll('.list-item').length}">
              <i class="fas fa-grip-vertical drag-handle"></i>
              <div style="flex: 1;">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 15px;">
                  <div class="form-group" style="margin: 0;">
                    <input type="text" class="link-url" placeholder="网址 (https://...)" value="">
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <input type="text" class="link-name" placeholder="网站名称" value="">
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <input type="text" class="link-desc" placeholder="描述" value="">
                  </div>
                </div>
              </div>
              <button type="button" class="btn btn-danger" onclick="removeLink(this)" style="margin-left: 10px; padding: 8px 12px;">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          \`;
          
          linksList.insertAdjacentHTML('beforeend', html);
          
          // 为新列表初始化排序
          new Sortable(linksList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            handle: '.drag-handle'
          });
        }
        
        // 删除链接
        function removeLink(button) {
          const listItem = button.closest('.list-item');
          if (listItem && confirm('确定要删除这个链接吗？')) {
            listItem.remove();
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
            
            if (name && icon && links.length > 0) {
              categories.push({ name, icon, list: links });
            }
          });
          
          try {
            const response = await fetch('/admin/config', {
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
            const response = await fetch('/admin/clear-cache', { method: 'POST' });
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
          const formData = new FormData(this);
          const data = {
            title: formData.get('title'),
            subtitle: formData.get('subtitle'),
            logo_icon: formData.get('logo_icon'),
            startDate: formData.get('startDate'),
            hitokoto: this.querySelector('[name="hitokoto"]').checked,
            search: this.querySelector('[name="search"]').checked
          };
          
          try {
            const response = await fetch('/admin/config', {
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
        
        // 添加键盘快捷键
        document.addEventListener('keydown', function(e) {
          // Ctrl + S 保存
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm && activeForm.id === 'basicConfigForm') {
              activeForm.dispatchEvent(new Event('submit'));
            }
          }
        });
      </script>
    </div>
  `;
}

// 处理后台 API 请求
async function handleAdminAPI(request, config) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 登录验证
  if (path === '/admin/login' && request.method === 'POST') {
    try {
      const { password } = await request.json();
      if (password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 
            'Set-Cookie': `admin_auth=${ADMIN_PASSWORD}; HttpOnly; Path=/admin; Max-Age=86400`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      // 忽略错误
    }
    return new Response(JSON.stringify({ error: '密码错误' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 验证管理员身份
  const cookie = request.headers.get('Cookie') || '';
  if (!cookie.includes(`admin_auth=${ADMIN_PASSWORD}`)) {
    return new Response(JSON.stringify({ error: '未授权' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 更新配置
  if (path === '/admin/config' && request.method === 'PUT') {
    try {
      const updates = await request.json();
      const updatedConfig = { ...config, ...updates };
      const saved = await saveConfig(updatedConfig);
      
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
  if (path === '/admin/clear-cache' && request.method === 'POST') {
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
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 获取配置
  const config = await getConfig();

  // 处理后台相关路由
  if (path.startsWith('/admin')) {
    // 后台页面
    if (path === '/admin' || path === '/admin/') {
      const cookie = request.headers.get('Cookie') || '';
      if (cookie.includes(`admin_auth=${ADMIN_PASSWORD}`)) {
        const adminHTML = await renderAdminPanel(config);
        return new Response(adminHTML.replace('{{BODY_CLASS}}', 'admin-body'), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } else {
        return new Response(renderLogin().replace('{{BODY_CLASS}}', 'admin-body'), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
    }

    // 后台仪表板
    if (path === '/admin/dashboard') {
      const adminHTML = await renderAdminPanel(config);
      return new Response(adminHTML.replace('{{BODY_CLASS}}', 'admin-body'), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // 后台 API
    return handleAdminAPI(request, config);
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

// 事件监听
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
