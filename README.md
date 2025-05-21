# Cookie 提取器 Chrome 插件

[English Version](README_EN.md) | [中文版](README.md)

## 项目描述
一个简单的Chrome插件，用于提取当前网站的Cookie并支持复制到剪贴板。

## 功能特性
- 一键获取当前网站的Cookie
- 支持复制Cookie到剪贴板
- 提供亮色/暗色主题切换
- 简洁直观的用户界面

## 安装步骤
1. 克隆或下载本项目代码
2. 在Chrome浏览器中打开`chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目目录

## 使用方法
1. 点击浏览器工具栏中的插件图标
2. 插件会自动获取当前网站的Cookie并显示
3. 点击"复制Cookie"按钮将内容复制到剪贴板
4. 点击"🎨 主题"按钮切换亮色/暗色主题

## 项目结构
- `manifest.json`: 插件配置文件
- `popup.html`: 弹窗界面
- `popup.js`: 主要逻辑代码
- `popup.css`: 样式文件
- `icons/`: 插件图标目录

## 许可证
本项目采用 [MIT License + 非商业用途声明](LICENSE)，仅供学习和个人使用，**禁止用于商业用途**。如需商用，请联系作者获取授权。