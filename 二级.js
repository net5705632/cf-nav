/**
 * 加密频道导航系统 - 带后台管理版本
 * 数据存储于 Cloudflare KV（需要绑定 KV 命名空间：NAV_CONFIG）
 */

// HTML 模板
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link href="https://cdn.jsdelivr.net/npm/semantic-ui-css@2.4.1/semantic.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/gh/sleepwood/cf-worker-dir@0.1.1/style.css" rel="stylesheet">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .password-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            min-width: 300px;
        }
        .error-message {
            color: #db2828;
            margin-top: 0.5rem;
            display: none;
        }
        .admin-body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
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
        }
        .form-group input[type="text"],
        .form-group input[type="password"],
        .form-group input[type="date"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
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
        /* 导航页面样式 */
        #head {
            padding: 1rem 0 !important;
            min-height: 200px !important;
        }
        #nav {
            text-align: center;
            padding: 0.5rem 0;
        }
        #nav .item {
            justify-content: center;
        }
        #hitokoto {
            font-size: 1.1rem;
            font-style: italic;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
        }
        .title-container {
            text-align: center;
            margin-top: 1rem;
        }
        /* 标题样式保持原有大小 */
        .ui.inverted.header {
            font-size: clamp(2.5em, 8vw, 4.5em) !important;
            margin-bottom: 0.2em !important;
        }
    </style>
</head>
<body class="{{BODY_CLASS}}">
    {{CONTENT}}
</body>
</html>`;

// 工具函数
const el = (tag, attrs, content) => `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;

// 主请求处理函数
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 从环境变量获取管理员密码
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "admin123";

  // 获取配置
  const config = await getConfig(env);

  // 处理后台相关路由
  if (path.startsWith('/admin')) {
    // 后台登录页面
    if (path === '/admin' || path === '/admin/') {
      return new Response(HTML_TEMPLATE
        .replace('{{TITLE}}', '后台登录')
        .replace('{{BODY_CLASS}}', 'admin-body')
        .replace('{{CONTENT}}', renderAdminLogin()), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // 后台仪表板
    if (path === '/admin/dashboard') {
      const cookie = request.headers.get('Cookie') || '';
      if (cookie.includes(`admin_auth=${ADMIN_PASSWORD}`)) {
        const adminHTML = renderAdminPanel(config);
        return new Response(HTML_TEMPLATE
          .replace('{{TITLE}}', '后台管理')
          .replace('{{BODY_CLASS}}', 'admin-body')
          .replace('{{CONTENT}}', adminHTML), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } else {
        return Response.redirect(new URL('/admin', request.url), 302);
      }
    }

    // 后台 API
    return handleAdminAPI(request, config, env, ADMIN_PASSWORD);
  }

  // 首页
  if (path === '/' || path === '') {
    // 检查访问密码
    if (config.enable_password) {
      const cookie = request.headers.get('Cookie') || '';
      const isAuthenticated = cookie.includes('nav_access=true');
      
      if (!isAuthenticated) {
        return new Response(HTML_TEMPLATE
          .replace('{{TITLE}}', config.title)
          .replace('{{BODY_CLASS}}', '')
          .replace('{{CONTENT}}', renderPasswordPage(config)), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
    }
    
    // 渲染主页面
    const navScript = `
      <script src="https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/semantic-ui-css@2.4.1/semantic.min.js"></script>
      <script>
        // 一言功能
        ${config.hitokoto ? `
          setTimeout(() => {
            const hitokotoScript = document.createElement('script');
            hitokotoScript.src = 'https://v1.hitokoto.cn/?encode=js&select=%23hitokoto';
            document.head.appendChild(hitokotoScript);
          }, 1500);
        ` : ''}
        
        // 退出登录功能
        ${config.enable_password ? `
          document.addEventListener('DOMContentLoaded', function() {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
              logoutBtn.addEventListener('click', function() {
                if (confirm('确定要退出登录吗？')) {
                  document.cookie = 'nav_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.reload();
                }
              });
            }
          });
        ` : ''}
      </script>
    `;
    
    return new Response(HTML_TEMPLATE
      .replace('{{TITLE}}', config.title)
      .replace('{{BODY_CLASS}}', '')
      .replace('{{CONTENT}}', renderIndex(config) + navScript), {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=300'
      }
    });
  }

  // 404 页面
  return new Response('页面未找到', {
    status: 404,
    headers: { 'content-type': 'text/plain;charset=UTF-8' }
  });
}

// 默认配置（当 KV 中没有配置时使用）
const DEFAULT_CONFIG = {
  title: "加密频道",
  logo_icon: "child",
  hitokoto: true,
  enable_password: true,
  password: "admin",
  password_hint: "请输入访问密码",
  password_error: "密码错误，请重试",
  startDate: new Date().toISOString().split('T')[0],
  lists: [
    {
      name: "加密频道",
      icon: "laptop",
      list: []
    }
  ]
};

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

// 获取 favicon URL
function getFavicon(url) {
  try {
    if (url.match(/https{0,1}:\/\//)) {
      return "https://www.google.com/s2/favicons?sz=64&domain_url=" + url;
    } else {
      return "https://www.google.com/s2/favicons?sz=64&domain_url=http://" + url;
    }
  } catch (err) {
    return 'https://www.google.com/favicon.ico';
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

// 渲染密码页面
function renderPasswordPage(config) {
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div class="password-container">
        <h2 style="margin-bottom: 20px;">
          <i class="lock icon"></i>
          ${config.title}
        </h2>
        <p>${config.password_hint}</p>
        <div style="margin-bottom: 20px;">
          <input type="password" id="passwordInput" placeholder="请输入密码" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
        </div>
        <button class="btn-primary" onclick="checkPassword()" style="width: 100%; padding: 14px;">
          进入导航
        </button>
        <div class="error-message" id="errorMessage">${config.password_error}</div>
        <div style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
          <i class="shield alternate icon"></i> 访问密码功能已启用
        </div>
      </div>
    </div>
    <script>
      function checkPassword() {
        const password = document.getElementById('passwordInput').value;
        const errorElement = document.getElementById('errorMessage');
        
        if (password === '${config.password.replace(/'/g, "\\'")}') {
          document.cookie = 'nav_access=true; max-age=' + (30 * 24 * 60 * 60) + '; path=/';
          window.location.reload();
        } else {
          errorElement.style.display = 'block';
          document.getElementById('passwordInput').value = '';
          setTimeout(() => {
            errorElement.style.display = 'none';
          }, 3000);
        }
      }
      
      document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          checkPassword();
        }
      });
    </script>
  `;
}

// 渲染导航首页
function renderIndex(config) {
  const daysRunning = getDaysRunning(config.startDate);
  
  // 密码状态标签
  const passwordStatus = config.enable_password ? 
    '<div class="ui tiny green label" style="margin-left: 10px;"><i class="shield alternate icon"></i>密码保护</div>' : 
    '<div class="ui tiny blue label" style="margin-left: 10px;"><i class="unlock alternate icon"></i>公开访问</div>';
  
  // 管理员链接（浮动按钮）
  const adminLink = '<a href="/admin/dashboard" class="ui mini basic button" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"><i class="cog icon"></i> 管理</a>';
  
  // 退出登录按钮
  const logoutButton = config.enable_password ? 
    '<button id="logoutBtn" class="ui mini basic button" style="margin-left: 10px;">退出登录</button>' : '';
  
  // 导航头部 - 保持原有标题样式
  const header = el('header', [], 
    el('div', ['id="head"', 'class="ui inverted vertical masthead center aligned segment"', 'style="padding: 1rem 0 !important; min-height: 200px !important;"'], 
      (config.hitokoto ? el('div', ['id="nav"', 'class="ui container"'], 
        el('div', ['class="ui large secondary inverted menu"'], 
          el('div', ['class="item"', 'style="justify-content: center;"'], el('p', ['id="hitokoto"'], '条条大路通罗马'))
        )
      ) : '') + 
      el('div', ['id="title"', 'class="ui text container"'], 
        // 标题 - 保持原有大小
        el('h1', ['class="ui inverted header"', 'style="font-size: clamp(2.5em, 8vw, 4.5em); margin-bottom: 0.2em;"'], 
          el('i', [`class="${config.logo_icon} icon"`], '') + 
          el('div', ['class="content"'], config.title)
        ) +
        // 密码状态标签 - 保持原有位置
        passwordStatus
      )
    )
  );
  
  // 主要内容 - 保持原有卡片布局
  const main = el('main', [], 
    el('div', ['class="ui container"'], 
      config.lists.map((item) => {
        const cards = item.list.map(link => 
          el('a', ['class="card"', 'href="' + link.url + '"', 'target="_blank"', 'rel="noopener"'], 
            el('div', ['class="content"'], 
              el('img', ['class="left floated avatar ui image"', 'src="' + getFavicon(link.url) + '"', 'loading="lazy"', 'alt="网站图标"'], '') + 
              el('div', ['class="header"'], link.name) + 
              el('div', ['class="meta"'], link.desc)
            )
          )
        ).join('');
        
        return el('div', ['class="ui basic segment"'], 
          el('h4', ['class="ui horizontal divider header"'], 
            el('i', ['class="' + item.icon + ' icon"'], '') + item.name
          ) + 
          el('div', ['class="ui four stackable cards"'], cards)
        );
      }).join('')
    )
  );
  
  // 页脚
  const footer = el('footer', [], 
    el('div', ['class="footer"'], 
      '本页面用' + el('a', ['class="ui label"', 'href="https://www.cloudflare-cn.com"', 'target="_blank"'], 
        el('i', ['class="cloud"'], '') + 'Cloudflare Workers'
      ) + ' 搭建 • 已运行 ' + daysRunning + ' 天' + logoutButton
    )
  );
  
  return header + main + footer + adminLink;
}

// 后台登录页面
function renderAdminLogin() {
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
    </div>
    <script>
      document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const button = this.querySelector('button');
        const originalText = button.innerHTML;
        
        button.innerHTML = '登录中...';
        button.disabled = true;
        
        try {
          const response = await fetch('/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
          });
          
          if (response.ok) {
            window.location.href = '/admin/dashboard';
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
  `;
}

// 后台管理面板
function renderAdminPanel(config) {
  const stats = {
    totalCategories: config.lists.length,
    totalLinks: config.lists.reduce((sum, category) => sum + category.list.length, 0)
  };
  const daysRunning = getDaysRunning(config.startDate);
  
  // 基本配置表单
  const basicConfig = `
    <div class="config-form">
      <div class="form-header">
        <h3>基本设置</h3>
      </div>
      
      <form id="basicConfigForm">
        <div class="form-group">
          <label>网站标题</label>
          <input type="text" name="title" value="${config.title.replace(/"/g, '&quot;')}">
        </div>
        
        <div class="two-fields">
          <div class="form-group">
            <label>图标类名</label>
            <input type="text" name="logo_icon" value="${config.logo_icon.replace(/"/g, '&quot;')}" placeholder="child, home, globe">
          </div>
          <div class="form-group">
            <label>开始日期</label>
            <input type="date" name="startDate" value="${config.startDate}">
          </div>
        </div>
        
        <div class="form-group">
          <label>密码设置</label>
          <div class="two-fields">
            <div class="form-group">
              <input type="password" name="password" value="${config.password.replace(/"/g, '&quot;')}" placeholder="访问密码">
            </div>
            <div class="form-group">
              <input type="text" name="password_hint" value="${config.password_hint.replace(/"/g, '&quot;')}" placeholder="密码提示">
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" name="enable_password" ${config.enable_password ? 'checked' : ''}>
            启用访问密码功能
          </label>
          <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" name="hitokoto" ${config.hitokoto ? 'checked' : ''}>
            启用一言功能
          </label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            保存设置
          </button>
          <button type="button" class="btn" onclick="location.reload()" style="background: #e5e7eb;">
            重置
          </button>
        </div>
      </form>
    </div>
  `;
  
  // 分类管理
  const categoryManager = `
    <div class="config-form">
      <div class="form-header">
        <h3>网站管理</h3>
      </div>
      
      <div id="categoryList">
        ${config.lists.map((category, catIndex) => {
          const linksHTML = category.list.map((link, linkIndex) => `
            <div class="list-item" data-link-index="${linkIndex}">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr auto; gap: 15px; align-items: center;">
                <div style="margin: 0;">
                  <input type="text" class="link-url" value="${link.url.replace(/"/g, '&quot;')}" placeholder="网址" style="width: 100%;">
                </div>
                <div style="margin: 0;">
                  <input type="text" class="link-name" value="${link.name.replace(/"/g, '&quot;')}" placeholder="网站名称" style="width: 100%;">
                </div>
                <div style="margin: 0;">
                  <input type="text" class="link-desc" value="${link.desc.replace(/"/g, '&quot;')}" placeholder="描述" style="width: 100%;">
                </div>
                <button type="button" class="btn-danger" onclick="removeLink(this)" style="padding: 8px 12px;">
                  删除
                </button>
              </div>
            </div>
          `).join('');
          
          return `
            <div class="list-editor" data-index="${catIndex}">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="margin: 0;">
                  <label>分类名称</label>
                  <input type="text" class="category-name" value="${category.name.replace(/"/g, '&quot;')}" style="width: 100%;">
                </div>
                <div style="margin: 0;">
                  <label>图标类名</label>
                  <input type="text" class="category-icon" value="${category.icon.replace(/"/g, '&quot;')}" style="width: 100%;">
                </div>
              </div>
              
              <div class="links-list">
                <h4>网站列表</h4>
                ${linksHTML}
              </div>
              
              <div style="margin-top: 20px; display: flex; gap: 15px;">
                <button type="button" class="btn" onclick="addLink(${catIndex})" style="background: #e5e7eb;">
                  添加网站
                </button>
                <button type="button" class="btn-danger" onclick="removeCategory(${catIndex})">
                  删除分类
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-primary" onclick="addCategory()">
          添加分类
        </button>
        <button type="button" class="btn-success" onclick="saveAllCategories()" style="background: #10b981; color: white;">
          保存所有分类
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
          // 清除管理员cookie
          document.cookie = 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;';
          // 跳转到登录页面
          window.location.href = '/admin';
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
              <button type="button" class="btn" onclick="addLink(\${index})" style="background: #e5e7eb;">
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
        
        const html = \`
          <div class="list-item">
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
        \`;
        
        linksList.insertAdjacentHTML('beforeend', html);
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
        const data = {
          title: this.querySelector('[name="title"]').value,
          logo_icon: this.querySelector('[name="logo_icon"]').value,
          startDate: this.querySelector('[name="startDate"]').value,
          password: this.querySelector('[name="password"]').value,
          password_hint: this.querySelector('[name="password_hint"]').value,
          enable_password: this.querySelector('[name="enable_password"]').checked,
          hitokoto: this.querySelector('[name="hitokoto"]').checked
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
    </script>
  `;
  
  return `
    <div class="admin-wrapper">
      <div class="admin-header">
        <div class="header-actions">
          <div>
            <h1>导航后台管理系统</h1>
            <p>管理员，您好！ 当前配置：${stats.totalCategories} 个分类，${stats.totalLinks} 个链接，已运行 ${daysRunning} 天</p>
          </div>
          <div class="header-right">
            <button class="btn-logout" onclick="logout()">
              <i class="sign-out icon"></i> 退出登录
            </button>
          </div>
        </div>
        <div style="display: flex; gap: 15px; margin-top: 20px;">
          <a href="/" class="btn" style="background: #e5e7eb;">
            返回首页
          </a>
          <button class="btn" onclick="clearCache()" style="background: #e5e7eb;">
            清除缓存
          </button>
        </div>
      </div>
      
      ${basicConfig}
      ${categoryManager}
      
      <div class="message success" id="successMessage"></div>
      <div class="message error" id="errorMessage"></div>
      
      ${adminScript}
    </div>
  `;
}

// 处理后台 API 请求
async function handleAdminAPI(request, config, env, ADMIN_PASSWORD) {
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
      console.error('Login error:', error);
    }
    return new Response(JSON.stringify({ error: '密码错误' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 退出登录
  if (path === '/admin/logout' && request.method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 302,
      headers: { 
        'Location': '/admin',
        'Set-Cookie': 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin; HttpOnly'
      }
    });
  }

  // 验证管理员身份（除了登录和退出请求）
  if (path !== '/admin/login' && path !== '/admin/logout') {
    const cookie = request.headers.get('Cookie') || '';
    if (!cookie.includes(`admin_auth=${ADMIN_PASSWORD}`)) {
      return new Response(JSON.stringify({ error: '未授权' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 更新配置
  if (path === '/admin/config' && request.method === 'PUT') {
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

// 事件监听
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
