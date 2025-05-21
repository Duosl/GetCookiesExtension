document.addEventListener('DOMContentLoaded', function() {
  const cookieDisplay = document.getElementById('cookieDisplay');
  const copyButton = document.getElementById('copyButton');
  const statusDiv = document.getElementById('status');

  // 获取当前活动标签页
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
      cookieDisplay.textContent = '错误：无法获取当前标签页信息。';
      console.error('Error querying tabs:', chrome.runtime.lastError?.message);
      copyButton.disabled = true;
      return;
    }
    
    const currentTab = tabs[0];
    const currentTabUrl = currentTab.url;

    if (!currentTabUrl) {
        cookieDisplay.textContent = '无法获取当前标签页的URL。可能是个特殊页面。';
        copyButton.disabled = true;
        return;
    }

    // 检查URL是否为有效的HTTP/HTTPS URL
    // chrome.cookies.getAll 只能用于 http/https 协议的 URL
    if (!currentTabUrl.startsWith('http://') && !currentTabUrl.startsWith('https://')) {
        cookieDisplay.textContent = '无法从此类型的页面获取 Cookies (例如 chrome:// 扩展页面或本地文件 file://)。请在目标网站的普通网页上尝试。';
        copyButton.disabled = true;
        return;
    }

    // 获取指定URL的cookies
    chrome.cookies.getAll({ url: currentTabUrl }, function(cookies) {
      if (chrome.runtime.lastError) {
        cookieDisplay.textContent = '获取 Cookies 时出错: ' + chrome.runtime.lastError.message + '\n请确保 manifest.json 中的 host_permissions 配置正确。';
        copyButton.disabled = true;
        return;
      }

      if (!cookies || cookies.length === 0) {
        cookieDisplay.textContent = '当前页面没有找到 Cookies，或者插件没有权限访问此网站的 Cookies (请检查 host_permissions)。';
        copyButton.disabled = true;
      } else {
        let cookieString = '';
        // 将 cookie 格式化为 name=value; 形式，更接近 HTTP Header 的格式
        // 或者可以简单地每行一个 name=value
        cookies.forEach(function(cookie) {
          cookieString += `${cookie.name}=${cookie.value}\n`; // 每行一个 cookie，简化显示
        });
        cookieDisplay.textContent = cookieString.trim();
        copyButton.disabled = false;
      }
    });
  });

  copyButton.addEventListener('click', function() {
    const textToCopy = cookieDisplay.textContent;
    if (textToCopy && !copyButton.disabled) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          statusDiv.textContent = 'Cookies 已复制到剪贴板!';
          setTimeout(() => { statusDiv.textContent = ''; }, 2500);
        })
        .catch(err => {
          statusDiv.textContent = '复制失败: ' + err;
          console.error('复制到剪贴板失败: ', err);
          // 可以尝试旧的 document.execCommand('copy') 作为备选方案，但已不推荐
        });
    } else {
        statusDiv.textContent = '没有可复制的 Cookies。';
        setTimeout(() => { statusDiv.textContent = ''; }, 2500);
    }
  });

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themePanel = document.getElementById('themePanel');
  
  // 动态创建主题色块
  const themePanelColors = document.createElement('div');
  themePanelColors.className = 'theme-panel-colors';
  
  // 主题色块配置
  const themeBlocksConfig = [
    { theme: 'light', title: '浅色', color: '#ffffff'  },
    { theme: 'dark', title: '深色', color: '#333333'  },
    { theme: 'blue', title: '蓝色', color: '#007acc' },
    { theme: 'green', title: '绿色', color: '#28a745'  },
    { theme: 'pink', title: '粉色', color: '#e75480' }
  ];
  
  // 生成主题色块并添加到DOM
  themeBlocksConfig.forEach(config => {
    const block = document.createElement('div');
    block.className = 'theme-color-block';
    block.setAttribute('data-theme', config.theme);
    block.setAttribute('title', config.title);
    block.style.backgroundColor = config.color;
    themePanelColors.appendChild(block);
  });
  
  themePanel.appendChild(themePanelColors);
  const themeBlocks = document.querySelectorAll('.theme-color-block');

  // 主题色定义
  const themeMap = {
    light: {
      '--bg': '#ffffff',
      '--text': '#333333',
      '--accent': '#007acc',
      '--success': '#28a745',
      '--border': '#cccccc',
      '--footer': '#666666',
      '--panel': '#eeeeee',
    },
    dark: {
      '--bg': '#222',
      '--text': '#f2f2f2',
      '--accent': '#007acc',
      '--success': '#28a745',
      '--border': '#444',
      '--footer': '#bbbbbb',
      '--panel': '#333',
    },
    blue: {
      '--bg': '#e6f2fa',
      '--text': '#222',
      '--accent': '#007acc',
      '--success': '#28a745',
      '--border': '#b3d8f5',
      '--footer': '#007acc',
      '--panel': '#d0e7fa',
    },
    green: {
      '--bg': '#eafaf1',
      '--text': '#222',
      '--accent': '#28a745',
      '--success': '#28a745',
      '--border': '#b7eacb',
      '--footer': '#28a745',
      '--panel': '#d6f5e3',
    },
    pink: {
      '--bg': '#fff0f6',
      '--text': '#222',
      '--accent': '#e75480',
      '--success': '#e75480',
      '--border': '#f7b6d2',
      '--footer': '#e75480',
      '--panel': '#fbe3ef',
    },
  };

  function applyTheme(theme) {
    const root = document.documentElement;
    const themeVars = themeMap[theme] || themeMap.light;
    Object.keys(themeVars).forEach(key => {
      root.style.setProperty(key, themeVars[key]);
    });
    // 兼容原有样式
    document.body.style.backgroundColor = themeVars['--bg'];
    document.body.style.color = themeVars['--text'];
    // 主题色影响主要按钮
    const copyBtn = document.getElementById('copyButton');
    if (copyBtn) {
      copyBtn.style.backgroundColor = themeVars['--accent'];
      copyBtn.style.color = '#fff';
    }
    // 页脚
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.style.color = themeVars['--footer'];
      footer.style.borderTopColor = themeVars['--panel'];
    }
    // cookieDisplay
    const cookieDisplay = document.getElementById('cookieDisplay');
    if (cookieDisplay) {
      cookieDisplay.style.backgroundColor = themeVars['--bg'];
      cookieDisplay.style.color = themeVars['--text'];
      cookieDisplay.style.borderColor = themeVars['--border'];
    }
  }

  // 主题切换按钮展开/收起
  themeToggleBtn.addEventListener('click', function() {
    themePanel.classList.toggle('active');
  });

  // 主题色块点击切换主题
  themeBlocks.forEach(block => {
    block.addEventListener('click', function() {
      const theme = block.getAttribute('data-theme');
      themeBlocks.forEach(item => item.classList.remove('selected'));
      block.classList.add('selected');
      applyTheme(theme);
      localStorage.setItem('popupTheme', theme);
    });
  });

  // 页面加载时自动应用上次选择的主题
  const savedTheme = localStorage.getItem('popupTheme') || 'light';
  applyTheme(savedTheme);
});