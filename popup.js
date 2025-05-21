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
});