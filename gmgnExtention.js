// ==UserScript==
// @name         GMGN Extension
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Enhanced version with better UX, performance and stability for gmgn.ai
// @author       Your name
// @match        https://gmgn.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gmgn.ai
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://cdn.jsdelivr.net/gh/yourname/tampermonkey@main/gmgnExtention.js
// @downloadURL  https://cdn.jsdelivr.net/gh/yourname/tampermonkey@main/gmgnExtention.js
// ==/UserScript==

(function() {
  'use strict';

  // 配置和状态管理
  const CONFIG = {
      delay: GM_getValue('delay', 3000),
      isEnabled: GM_getValue('isEnabled', true),
      shortcutKey: GM_getValue('shortcutKey', '\\'),  // 默认使用反斜杠键
      buttonText: 'Cielo 7D',
      configPanelId: 'cielo-config-panel'
  };

  let timer;

  // 工具函数
  const utils = {
      // 防抖函数
      debounce(func, wait) {
          let timeout;
          return function(...args) {
              clearTimeout(timeout);
              timeout = setTimeout(() => func.apply(this, args), wait);
          };
      },

      // 计算按钮最佳位置
      calculateButtonPosition(event) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const buttonWidth = 100;
          const buttonHeight = 32;

          let left = event.clientX - 50;
          let top = event.clientY - 20;

          // 防止超出视窗
          left = Math.min(Math.max(10, left), viewportWidth - buttonWidth - 10);
          top = Math.min(Math.max(10, top), viewportHeight - buttonHeight - 10);

          return { left, top };
      },

      // 显示通知
      showNotification(message, type = 'info') {
          const notification = document.createElement('div');
          notification.textContent = message;
          notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 20px;
              background-color: ${type === 'info' ? '#e6f4ea' : '#fce8e8'};
              color: ${type === 'info' ? '#1e8e3e' : '#d93025'};
              border-radius: 4px;
              z-index: 10001;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              font-size: 14px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              opacity: 0;
              animation: notificationFadeIn 0.3s forwards;
          `;

          // 添加动画样式
          const style = document.createElement('style');
          style.textContent = `
              @keyframes notificationFadeIn {
                  from { opacity: 0; transform: translateY(-20px); }
                  to { opacity: 1; transform: translateY(0); }
              }
          `;
          document.head.appendChild(style);

          document.body.appendChild(notification);
          setTimeout(() => {
              notification.style.animation = 'notificationFadeIn 0.3s reverse forwards';
              setTimeout(() => {
                  notification.remove();
                  style.remove();
              }, 300);
          }, 2700);
      }
  };

  // 创建配置面板
  function createConfigPanel() {
      const panel = document.createElement('div');
      panel.id = CONFIG.configPanelId;
      panel.style.cssText = `
          position: fixed;
          top: 60px;
          left: 20px;
          background: #2D2D2D;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 1px solid #3D3D3D;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          display: none;
      `;

      panel.innerHTML = `
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #FFFFFF;">设置面板</h3>
          <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-size: 12px; color: #FFFFFF;">
                  按钮消失延迟:
              </label>
              <select id="delay-input" style="
                  width: 100%;
                  padding: 8px;
                  background: #3D3D3D;
                  border: 1px solid #4D4D4D;
                  border-radius: 4px;
                  color: #FFFFFF;
                  font-size: 12px;
                  outline: none;
              ">
                  <option value="1000">1秒</option>
                  <option value="2000">2秒</option>
                  <option value="3000">3秒</option>
                  <option value="5000">5秒</option>
              </select>
          </div>
          <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-size: 12px; color: #FFFFFF;">
                  快捷键 (⌥ Option +):
              </label>
              <input type="text" id="shortcut-input" value="${CONFIG.shortcutKey}"
                  maxlength="1" style="
                  width: 100%;
                  padding: 8px;
                  background: #3D3D3D;
                  border: 1px solid #4D4D4D;
                  border-radius: 4px;
                  color: #FFFFFF;
                  font-size: 12px;
                  outline: none;
                  box-sizing: border-box;
              ">
          </div>
      `;

      // 事件处理
      panel.querySelector('#delay-input').addEventListener('change', function(e) {
          CONFIG.delay = parseInt(e.target.value);
          GM_setValue('delay', CONFIG.delay);
          utils.showNotification('延迟设置已更新', 'info');
      });

      panel.querySelector('#shortcut-input').addEventListener('change', function(e) {
          CONFIG.shortcutKey = e.target.value.toLowerCase();
          GM_setValue('shortcutKey', CONFIG.shortcutKey);
          utils.showNotification(`快捷键已更新为 Alt + ${CONFIG.shortcutKey}`, 'info');
      });

      document.body.appendChild(panel);
      return panel;
  }

  // 创建切换按钮
  function createToggleButton() {
      const toggleButton = document.createElement('button');
      toggleButton.id = 'feature-toggle';
      toggleButton.innerText = CONFIG.isEnabled ? '🟢 ON' : '🔴 OFF';
      toggleButton.style.cssText = `
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 10000;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          background-color: ${CONFIG.isEnabled ? '#e6f4ea' : '#fce8e8'};
          color: ${CONFIG.isEnabled ? '#1e8e3e' : '#d93025'};
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      `;

      // 鼠标悬停效果
      toggleButton.addEventListener('mouseover', function() {
          this.style.transform = 'translateY(-1px)';
          this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      });

      toggleButton.addEventListener('mouseout', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });

      // 点击切换功能
      toggleButton.addEventListener('click', function() {
          CONFIG.isEnabled = !CONFIG.isEnabled;
          GM_setValue('isEnabled', CONFIG.isEnabled);
          this.innerText = CONFIG.isEnabled ? '🟢 ON' : '🔴 OFF';
          this.style.backgroundColor = CONFIG.isEnabled ? '#e6f4ea' : '#fce8e8';
          this.style.color = CONFIG.isEnabled ? '#1e8e3e' : '#d93025';

          // 清理现有按钮
          if (!CONFIG.isEnabled) {
              document.body.querySelectorAll('.custom-button').forEach(button => button.remove());
          }

          utils.showNotification(`功能已${CONFIG.isEnabled ? '开启' : '关闭'}`, 'info');
      });

      // 单独处理右键点击显示配置面板
      toggleButton.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          const panel = document.getElementById(CONFIG.configPanelId);
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      });

      // 阻止右键菜单
      toggleButton.addEventListener('contextmenu', e => e.preventDefault());

      document.body.appendChild(toggleButton);
  }

  // 添加地址按钮
  function addButton(link, event) {
      try {
          if (!CONFIG.isEnabled) return;

          const addr = link.getAttribute('href')?.split('/')?.pop();
          if (!addr) {
              utils.showNotification('无法获取地址', 'error');
              return;
          }

          const button = document.createElement('button');
          button.innerText = CONFIG.buttonText;
          const position = utils.calculateButtonPosition(event);

          button.style.cssText = `
              padding: 6px 12px;
              position: absolute;
              top: ${position.top}px;
              left: ${position.left}px;
              z-index: 9999;
              background-color: #f8f9fa;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              color: #1a73e8;
              font-weight: 500;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              transition: all 0.2s ease;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          `;
          button.classList.add('custom-button');

          // 鼠标悬停效果
          button.addEventListener('mouseover', function() {
              this.style.backgroundColor = '#f1f3f4';
              this.style.transform = 'translateY(-1px)';
              this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          });

          button.addEventListener('mouseout', function() {
              this.style.backgroundColor = '#f8f9fa';
              this.style.transform = 'translateY(0)';
              this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          });

          // 点击事件
          button.addEventListener('click', function(event) {
              event.stopPropagation();
              window.open(`https://app.cielo.finance/profile/${addr}/pnl/tokens?timeframe=7d&sortBy=first_trade_desc`, '_blank');
          });

          document.body.appendChild(button);
          timer = setTimeout(() => {
              document.body.querySelectorAll('.custom-button').forEach(button => button.remove());
          }, CONFIG.delay);

      } catch (error) {
          console.error('添加按钮时发生错误:', error);
          utils.showNotification('添加按钮时发生错误', 'error');
      }
  }

  // 添加右键菜单功能
  function addContextMenu(link) {
      link.addEventListener('contextmenu', function(e) {
          if (!CONFIG.isEnabled) return;

          e.preventDefault();
          const addr = link.getAttribute('href').split('/').pop();
          window.open(`https://app.cielo.finance/profile/${addr}/pnl/tokens?timeframe=7d&sortBy=first_trade_desc`, '_blank');
      });
  }

  // 初始化
  function init() {
      // 创建切换按钮和配置面板
      createToggleButton();
      createConfigPanel();

      // 添加全局快捷键监听（使用 Option/Alt 键）
      document.addEventListener('keydown', function(e) {
          if (e.altKey && e.key === CONFIG.shortcutKey) {
              e.preventDefault(); // 防止触发浏览器默认快捷键
              const toggleButton = document.getElementById('feature-toggle');
              toggleButton.click();
          }
      });

      // 使用防抖处理的鼠标移动监听
      const debouncedAddButton = utils.debounce((link, event) => {
          addButton(link, event);
      }, 100);

      // 监听鼠标移动
      document.addEventListener('mouseover', function(event) {
          if (!CONFIG.isEnabled) return;

          const link = event.target.closest('a[href^="/sol/address/"], a[href^="/eth/address/"], a[href^="/bsc/address/"]');
          if (link) {
              clearTimeout(timer);
              document.body.querySelectorAll('.custom-button').forEach(button => button.remove());
              debouncedAddButton(link, event);
              addContextMenu(link);
          }
      });
  }

  // 启动脚本
  init();
})();