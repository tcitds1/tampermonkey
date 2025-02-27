// ==UserScript==
// @name         Unified Quick Actions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add quick action buttons to BullX and XXYY
// @author       Your name
// @match        https://neo.bullx.io/*
// @match        https://pro.xxyy.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bullx.io
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/tcitds1/tampermonkey@main/bullXExtention.js
// @downloadURL  https://cdn.jsdelivr.net/gh/tcitds1/tampermonkey@main/bullXExtention.js
// ==/UserScript==

(function() {
  'use strict';

  // 创建样式
  const style = document.createElement('style');
  style.textContent = `
      .quick-actions-bullx {
          position: fixed;
          top: 65px;
          left: 450px;
          display: flex;
          gap: 4px;
          z-index: 1000;
      }
      .quick-actions-xxyy {
          position: fixed;
          top: 17px;
          left: 815px;
          display: flex;
          gap: 4px;
          z-index: 1000;
      }
      .quick-action-btn {
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          background-color: rgb(38, 38, 38);
          color: rgb(229, 229, 229);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.2s;
      }
      .quick-action-btn:hover {
          background-color: rgb(64, 64, 64);
      }
      .search-icon {
          width: 12px;
          height: 12px;
      }
  `;
  document.head.appendChild(style);

  // 获取当前网站类型
  function getCurrentSite() {
      if (location.hostname === 'neo.bullx.io') return 'bullx';
      if (location.hostname === 'pro.xxyy.io') return 'xxyy';
      return null;
  }

  // 获取BullX合约地址
  function getBullXContractAddress() {
      const params = new URLSearchParams(window.location.search);
      return params.get('address');
  }

  // 获取BullX Dev地址
  function getBullXDevAddress() {
      const devButton = document.querySelector('button[href*="solscan.io/account/"]');
      if (devButton) {
          const href = devButton.getAttribute('href');
          return href.split('/').pop();
      }
      return '';
  }

  // 获取XXYY合约地址
  function getXXYYContractAddress() {
      const solscanLink = document.querySelector('.symbol a[href*="solscan.io/token/"]');
      if (solscanLink) {
          const href = solscanLink.getAttribute('href');
          return href.split('/').pop();
      }
      // 备选：从URL获取
      const pathParts = location.pathname.split('/');
      return pathParts[pathParts.length - 1];
  }

  // 创建搜索图标SVG
  function createSearchIcon() {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute('class', 'search-icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');

      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path1.setAttribute('d', 'M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z');

      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path2.setAttribute('d', 'M21 21L16.65 16.65');

      svg.appendChild(path1);
      svg.appendChild(path2);
      return svg;
  }

  // 创建按钮
  function createButton(text, onClick, withSearchIcon = false) {
      const button = document.createElement('button');
      button.className = 'quick-action-btn';
      if (withSearchIcon) {
          button.appendChild(createSearchIcon());
      }
      button.appendChild(document.createTextNode(text));
      button.addEventListener('click', onClick);
      return button;
  }

  // 创建BullX按钮组
  function createBullXButtons() {
      const container = document.createElement('div');
      container.className = 'quick-actions-bullx';

      // 搜索合约按钮
      container.appendChild(createButton('合约', () => {
          const contractAddress = getBullXContractAddress();
          if (contractAddress) {
              window.open(`https://x.com/search?q=${contractAddress}&f=live`, '_blank');
          }
      }, true));

      // 搜索dev按钮
      container.appendChild(createButton('Dev', () => {
          const devAddress = getBullXDevAddress();
          if (devAddress) {
              window.open(`https://x.com/search?q=${devAddress}&f=live`, '_blank');
          }
      }, true));

      // GMGN按钮
      container.appendChild(createButton('GMGN', () => {
          const contractAddress = getBullXContractAddress();
          if (contractAddress) {
              window.open(`https://gmgn.ai/sol/token/${contractAddress}`, '_blank');
          }
      }));

      // XXYY按钮
      container.appendChild(createButton('XXYY', () => {
          const contractAddress = getBullXContractAddress();
          if (contractAddress) {
              window.open(`https://pro.xxyy.io/sol/${contractAddress}`, '_blank');
          }
      }));

      return container;
  }

  // 创建XXYY按钮组
  function createXXYYButtons() {
      const container = document.createElement('div');
      container.className = 'quick-actions-xxyy';

      // BullX按钮
      container.appendChild(createButton('BullX', () => {
          const contractAddress = getXXYYContractAddress();
          if (contractAddress) {
              window.open(`https://neo.bullx.io/terminal?chainId=1399811149&address=${contractAddress}`, '_blank');
          }
      }));

      // GMGN按钮
      container.appendChild(createButton('GMGN', () => {
          const contractAddress = getXXYYContractAddress();
          if (contractAddress) {
              window.open(`https://gmgn.ai/sol/token/${contractAddress}`, '_blank');
          }
      }));

      // 搜索合约按钮
      container.appendChild(createButton('X', () => {
          const contractAddress = getXXYYContractAddress();
          if (contractAddress) {
              window.open(`https://x.com/search?q=${contractAddress}&f=live`, '_blank');
          }
      }, true));

      return container;
  }

  // 等待目标元素加载完成
  function waitForElement(selector) {
      return new Promise(resolve => {
          if (document.querySelector(selector)) {
              return resolve(document.querySelector(selector));
          }

          const observer = new MutationObserver(mutations => {
              if (document.querySelector(selector)) {
                  observer.disconnect();
                  resolve(document.querySelector(selector));
              }
          });

          observer.observe(document.body, {
              childList: true,
              subtree: true
          });
      });
  }

  // 主函数
  async function init() {
      const site = getCurrentSite();

      if (site === 'bullx') {
          // 等待BullX特定元素加载
          await waitForElement('button[href*="solscan.io/account/"]');
          if (!document.querySelector('.quick-actions-bullx')) {
              document.body.appendChild(createBullXButtons());
          }
      } else if (site === 'xxyy') {
          // 等待XXYY特定元素加载
          await waitForElement('.symbol');
          if (!document.querySelector('.quick-actions-xxyy')) {
              document.body.appendChild(createXXYYButtons());
          }
      }
  }

  // 监听URL变化
  let lastUrl = location.href;
  new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
          lastUrl = url;
          init();
      }
  }).observe(document, {subtree: true, childList: true});

  // 初始化
  init();
})();