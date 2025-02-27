// ==UserScript==
// @name         xSearchBlock
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Enhanced Twitter search filter with UI controls and quick block button
// @match        https://x.com/search*
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/tcitds1/tampermonkey/main/xSearchBlock.js
// @downloadURL  https://raw.githubusercontent.com/tcitds1/tampermonkey/main/xSearchBlock.js
// ==/UserScript==

(function() {
  'use strict';

  // 常量定义
  const SELECTORS = {
      TWEET: 'article[data-testid="tweet"]',
      TWEET_TEXT: '[data-testid="tweetText"]',
      USER_NAME: '[data-testid="User-Name"]',
      TWEET_CONTAINER: '[data-testid="cellInnerDiv"]',
      AVATAR_CONTAINER: '[data-testid="Tweet-User-Avatar"]'
  };

  // 版本信息
  const VERSION = '0.8';

  // 样式定义
  const STYLES = `
      .x-filter-button {
          position: fixed;
          top: 20px;
          left: 20px;
          background: #333;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          transition: background-color 0.2s;
      }

      .x-filter-button:hover {
          background: #444;
      }

      .x-filter-panel {
          position: fixed;
          top: 70px;
          left: 20px;
          background: #15202b;
          color: #fff;
          border-radius: 16px;
          padding: 20px;
          width: 320px;
          max-height: 80vh;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          z-index: 9999;
          display: none;
          border: 1px solid #38444d;
          overflow: hidden;
      }

      .x-filter-panel.open {
          display: block;
      }

      .x-filter-section {
          margin-bottom: 24px;
          max-height: 60vh;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 10px;
          scroll-behavior: smooth;

          /* 更通用的滚动条样式 */
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #38444d #1e2732; /* Firefox */
      }

      .x-filter-section::-webkit-scrollbar {
          width: 6px;
      }

      .x-filter-section::-webkit-scrollbar-track {
          background: #1e2732;
          border-radius: 3px;
      }

      .x-filter-section::-webkit-scrollbar-thumb {
          background: #38444d;
          border-radius: 3px;
      }

      .x-filter-section::-webkit-scrollbar-thumb:hover {
          background: #465A6C;
      }

      .x-filter-section h3 {
          color: #e7e9ea;
          font-size: 18px;
          margin-bottom: 12px;
          position: sticky;
          top: 0;
          background: #15202b;
          padding: 8px 0;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
      }

      .x-filter-section .toggle-section {
          background: none;
          border: none;
          color: #1d9bf0;
          cursor: pointer;
          font-size: 14px;
          padding: 0 8px;
      }

      .x-filter-section .toggle-section:hover {
          text-decoration: underline;
      }

      .x-filter-rule {
          display: grid;
          grid-template-columns: 20px 1fr 32px; /* 缩小删除按钮占用的列宽 */
          align-items: center;
          margin-bottom: 8px;
          padding: 12px;
          background: #1e2732;
          border: 1px solid #38444d;
          border-radius: 8px;
          position: relative; /* 确保工具提示定位正确 */
      }

      .x-filter-rule span {
          margin: 0;
          color: #e7e9ea;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
      }

      .x-filter-rule input[type="checkbox"] {
          margin: 0;
      }

      .x-filter-rule .delete-btn {
          background: #f4212e;
          color: white;
          border: none;
          border-radius: 50%; /* 圆形按钮 */
          width: 24px;
          height: 24px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0; /* 默认隐藏 */
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: absolute;
          right: 12px; /* 调整位置 */
      }

      .x-filter-rule:hover .delete-btn {
          opacity: 1; /* 悬停时显示 */
          transform: translateY(0); /* 平滑出现 */
      }

      .x-filter-rule .delete-btn:hover {
          background: #ff2f3f;
      }

      .x-filter-add {
          display: flex;
          margin-top: 12px;
          position: sticky;
          bottom: 0;
          background: #15202b;
          padding: 8px 0;
          z-index: 1;
      }

      .x-filter-add input {
          flex-grow: 1;
          margin-right: 8px;
          padding: 8px 12px;
          background: #1e2732;
          border: 1px solid #38444d;
          border-radius: 8px;
          color: #fff;
      }

      .x-filter-add input::placeholder {
          color: #8899a6;
      }

      .x-filter-add button {
          background: #1d9bf0;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
      }

      .x-filter-add button:hover {
          background: #1a8cd8;
      }

      .x-filter-counter {
          position: fixed;
          top: 28px;
          left: 70px;
          background: #333;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          z-index: 10000;
      }

      .quick-block-btn {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #f4212e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 1000;
      }

      .quick-block-btn:hover {
          background: #ff2f3f;
      }

      [data-testid="Tweet-User-Avatar"]:hover .quick-block-btn {
          opacity: 1;
      }

      .undo-block {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1d9bf0;
          color: white;
          padding: 12px 24px;
          border-radius: 20px;
          display: none;
          align-items: center;
          gap: 8px;
          z-index: 10000;
          animation: slideUp 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .undo-block.show {
          display: flex;
      }

      .undo-block button {
          background: white;
          color: #1d9bf0;
          border: none;
          border-radius: 4px;
          padding: 4px 12px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
      }

      .undo-block button:hover {
          background: #f5f5f5;
      }

      .rules-container {
          transition: max-height 0.3s ease-in-out;
      }

      .rules-container.collapsed {
          max-height: 0;
          overflow: hidden;
          padding: 0;
      }

      .x-version-info {
          position: absolute;
          bottom: 10px;
          right: 10px;
          color: #8899a6;
          font-size: 11px;
          opacity: 0.7;
      }

      @keyframes slideUp {
          from {
              transform: translate(-50%, 100%);
              opacity: 0;
          }
          to {
              transform: translate(-50%, 0);
              opacity: 1;
          }
      }
  `;

  // 配置管理类
  class FilterConfig {
      constructor() {
          // 从存储加载或使用默认配置
          this.config = GM_getValue('filterConfig', {
              keywords: [
                  { pattern: 'Creator:', enabled: true },
                  { pattern: 'DeFi', enabled: true },
                  { pattern: 'Crypto', enabled: true }
              ],
              users: [
                  { pattern: 'NyxSec_Agent', enabled: true }
              ],
              enabled: true
          });
      }

      save() {
          GM_setValue('filterConfig', this.config);
      }

      addRule(pattern, type) {
          const targetArray = type === 'user' ? this.config.users : this.config.keywords;
          if (!targetArray.some(rule => rule.pattern === pattern)) {
              targetArray.push({ pattern, enabled: true });
              this.save();
              return true;
          }
          return false;
      }

      removeRule(pattern, type) {
          const targetArray = type === 'user' ? this.config.users : this.config.keywords;
          const index = targetArray.findIndex(rule => rule.pattern === pattern);
          if (index !== -1) {
              targetArray.splice(index, 1);
              this.save();
              return true;
          }
          return false;
      }

      toggleRule(pattern, type, enabled) {
          const targetArray = type === 'user' ? this.config.users : this.config.keywords;
          const rule = targetArray.find(r => r.pattern === pattern);
          if (rule) {
              rule.enabled = enabled;
              this.save();
              return true;
          }
          return false;
      }
  }

  // UI管理类
  class FilterUI {
      constructor(filter) {
          this.filter = filter;
          this.panel = null;
          this.undoTimeout = null;
          this.createStyles();
          this.lastBlockedUser = null;
      }

      createStyles() {
          const styleElement = document.createElement('style');
          styleElement.textContent = STYLES;
          document.head.appendChild(styleElement);
      }

      init() {
          this.createCounter();
          this.createFilterButton();
          this.createFilterPanel();
          this.createUndoBlock();
          this.bindEvents();
      }

      createCounter() {
          const counter = document.createElement('div');
          counter.className = 'x-filter-counter';
          counter.textContent = '已过滤: 0 条内容';
          document.body.appendChild(counter);
      }

      createFilterButton() {
          const button = document.createElement('button');
          button.className = 'x-filter-button';
          button.innerHTML = '⚙️';
          button.title = '过滤器设置';
          document.body.appendChild(button);
      }

      createFilterPanel() {
          const panel = document.createElement('div');
          panel.className = 'x-filter-panel';
          panel.innerHTML = this.generatePanelHTML();
          document.body.appendChild(panel);
          this.panel = panel;
      }

      createUndoBlock() {
          const undoBlock = document.createElement('div');
          undoBlock.className = 'undo-block';
          undoBlock.innerHTML = `
              <span>已屏蔽用户</span>
              <button>撤销</button>
          `;
          document.body.appendChild(undoBlock);
      }

      generatePanelHTML() {
          return `
              <div class="x-filter-section">
                  <h3>全局设置 <button class="toggle-section">展开/收起</button></h3>
                  <div class="rules-container ${this.filter.config.config.enabled ? '' : 'collapsed'}">
                      <label class="x-filter-rule">
                          <input type="checkbox" ${this.filter.config.config.enabled ? 'checked' : ''} id="filter-global">
                          <span>启用过滤器</span>
                      </label>
                  </div>
              </div>

              <div class="x-filter-section">
                  <h3>关键词过滤 <button class="toggle-section">展开/收起</button></h3>
                  <div id="filter-keywords" class="rules-container">
                      ${this.generateRulesHTML(this.filter.config.config.keywords, 'keyword')}
                  </div>
                  <div class="x-filter-add">
                      <input type="text" placeholder="添加关键词" id="keyword-input">
                      <button id="keyword-add">添加</button>
                  </div>
              </div>

              <div class="x-filter-section">
                  <h3>用户过滤 <button class="toggle-section">展开/收起</button></h3>
                  <div id="filter-users" class="rules-container">
                      ${this.generateRulesHTML(this.filter.config.config.users, 'user')}
                  </div>
                  <div class="x-filter-add">
                      <input type="text" placeholder="添加用户" id="user-input">
                      <button id="user-add">添加</button>
                  </div>
              </div>
              
              <div class="x-version-info">xSearchBlock v${VERSION}</div>
          `;
      }

      generateRulesHTML(rules, type) {
          return rules.map(rule => `
              <div class="x-filter-rule">
                  <input type="checkbox" ${rule.enabled ? 'checked' : ''}
                         data-type="${type}" data-pattern="${rule.pattern}">
                  <span>${rule.pattern}</span>
                  <button class="delete-btn" data-type="${type}" data-pattern="${rule.pattern}">✕</button>
              </div>
          `).join('');
      }

      showUndoBlock(username) {
          this.lastBlockedUser = username;
          const undoBlock = document.querySelector('.undo-block');
          undoBlock.querySelector('span').textContent = `已屏蔽用户: ${username}`;
          undoBlock.classList.add('show');

          if (this.undoTimeout) {
              clearTimeout(this.undoTimeout);
          }

          this.undoTimeout = setTimeout(() => {
              if (this.lastBlockedUser === username) {
                  undoBlock.classList.remove('show');
              }
          }, 5000);
      }

      addQuickBlockButton(tweet) {
          const avatarContainer = tweet.querySelector(SELECTORS.AVATAR_CONTAINER);
          if (!avatarContainer || avatarContainer.querySelector('.quick-block-btn')) return;

          const blockButton = document.createElement('button');
          blockButton.className = 'quick-block-btn';
          blockButton.innerHTML = '×';
          blockButton.title = '快速屏蔽此用户';

          blockButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              // 寻找用户名，包括 @handle
              const userElement = tweet.querySelector(SELECTORS.USER_NAME);
              if (userElement) {
                  // 查找包含 @ 的链接元素
                  const handleElement = userElement.querySelector('a[href*="/"]');
                  if (handleElement) {
                      // 从链接中提取用户名（去掉 @ 符号）
                      const username = handleElement.textContent.replace('@', '');
                      if (username && this.filter.config.addRule(username, 'user')) {
                          this.updateRulesDisplay();
                          this.filter.reprocessAll();
                          this.showUndoBlock(username);
                      }
                  }
              }
          });

          avatarContainer.style.position = 'relative';
          avatarContainer.appendChild(blockButton);
      }

      bindEvents() {
          // 切换面板显示
          document.querySelector('.x-filter-button').addEventListener('click', () => {
              this.panel.classList.toggle('open');
          });

          // 全局启用/禁用
          document.getElementById('filter-global').addEventListener('change', (e) => {
              this.filter.config.config.enabled = e.target.checked;
              this.filter.config.save();
              this.filter.reprocessAll();
          });

          // 添加规则
          ['keyword', 'user'].forEach(type => {
              const input = document.getElementById(`${type}-input`);
              const addButton = document.getElementById(`${type}-add`);

              const addRule = () => {
                  const pattern = input.value.trim();
                  if (pattern) {
                      this.filter.config.addRule(pattern, type);
                      this.updateRulesDisplay();
                      input.value = '';
                      this.filter.reprocessAll();
                  }
              };

              addButton.addEventListener('click', addRule);
              input.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') {
                      addRule();
                  }
              });
          });

          // 规则操作的事件委托
          this.panel.addEventListener('click', (e) => {
              if (e.target.classList.contains('delete-btn')) {
                  const { type, pattern } = e.target.dataset;
                  this.filter.config.removeRule(pattern, type);
                  this.updateRulesDisplay();
                  this.filter.reprocessAll();
              }

              // 切换折叠/展开
              if (e.target.classList.contains('toggle-section')) {
                  const section = e.target.closest('.x-filter-section');
                  const container = section.querySelector('.rules-container');
                  container.classList.toggle('collapsed');
                  e.target.textContent = container.classList.contains('collapsed') ? '展开' : '收起';
              }
          });

          // 规则启用/禁用
          this.panel.addEventListener('change', (e) => {
              if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox' && e.target.dataset.type) {
                  const { type, pattern } = e.target.dataset;
                  this.filter.config.toggleRule(pattern, type, e.target.checked);
                  this.filter.reprocessAll();
              }
          });

          // 撤销屏蔽
          const undoBlock = document.querySelector('.undo-block');
          undoBlock.querySelector('button').addEventListener('click', () => {
              if (this.lastBlockedUser) {
                  this.filter.config.removeRule(this.lastBlockedUser, 'user');
                  this.updateRulesDisplay();
                  this.filter.reprocessAll();
                  undoBlock.classList.remove('show');
                  this.lastBlockedUser = null;
              }
          });
      }

      updateRulesDisplay() {
          document.getElementById('filter-keywords').innerHTML =
              this.generateRulesHTML(this.filter.config.config.keywords, 'keyword');
          document.getElementById('filter-users').innerHTML =
              this.generateRulesHTML(this.filter.config.config.users, 'user');
      }

      updateStats(count) {
          const counter = document.querySelector('.x-filter-counter');
          if (counter) {
              counter.textContent = `已过滤: ${count} 条内容`;
          }
      }
  }

  // 主过滤器类
  class XFilter {
      constructor() {
          this.config = new FilterConfig();
          this.processedTweets = new Set();
          this.filteredCount = 0;
          this.ui = new FilterUI(this);
      }

      init() {
          this.ui.init();
          this.setupMutationObserver();
          this.processExistingTweets();
          console.log(`xSearchBlock v${VERSION} 已加载`);
      }

      setupMutationObserver() {
          const observer = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                  if (mutation.addedNodes.length) {
                      this.processNewTweets(mutation.addedNodes);
                  }
              }
          });

          observer.observe(document.body, {
              childList: true,
              subtree: true
          });
      }

      processExistingTweets() {
          const tweets = document.querySelectorAll(SELECTORS.TWEET);
          tweets.forEach(tweet => this.processTweet(tweet));
      }

      processNewTweets(nodes) {
          nodes.forEach(node => {
              if (node.nodeType === 1) {
                  const tweets = node.querySelectorAll(SELECTORS.TWEET);
                  tweets.forEach(tweet => this.processTweet(tweet));
              }
          });
      }

      processTweet(tweet) {
          if (this.processedTweets.has(tweet)) return;

          this.processedTweets.add(tweet);
          this.ui.addQuickBlockButton(tweet);

          if (this.shouldFilter(tweet)) {
              const container = tweet.closest(SELECTORS.TWEET_CONTAINER);
              if (container) {
                  container.style.display = 'none';
                  this.filteredCount++;
                  this.ui.updateStats(this.filteredCount);
              }
          }
      }

      shouldFilter(tweet) {
          if (!this.config.config.enabled) return false;

          // 检查用户名
          const userElement = tweet.querySelector(SELECTORS.USER_NAME);
          if (userElement) {
              const username = userElement.textContent;

              // 遍历用户过滤规则
              for (const user of this.config.config.users) {
                  if (!user.enabled) continue;

                  try {
                      // 用户名模糊匹配，支持数字和下划线后缀
                      const basePattern = user.pattern.replace(/@/g, '');
                      const pattern = new RegExp(`@?${basePattern}[0-9_]*`, 'i');

                      if (pattern.test(username)) {
                          console.log('过滤用户:', username, '匹配模式:', user.pattern);
                          return true;
                      }
                  } catch (e) {
                      console.error('用户名匹配出错:', e);
                  }
              }
          }

          // 检查推文内容
          const tweetText = tweet.querySelector(SELECTORS.TWEET_TEXT);
          if (tweetText) {
              const text = tweetText.textContent.toLowerCase();

              // 遍历关键词过滤规则
              for (const keyword of this.config.config.keywords) {
                  if (!keyword.enabled) continue;

                  if (text.includes(keyword.pattern.toLowerCase())) {
                      console.log('过滤关键词:', keyword.pattern);
                      return true;
                  }
              }
          }

          return false;
      }

      reprocessAll() {
          console.log('重新处理所有推文...');
          this.processedTweets.clear();
          this.filteredCount = 0;

          // 重置所有被隐藏的推文
          document.querySelectorAll(SELECTORS.TWEET_CONTAINER).forEach(container => {
              container.style.display = '';
          });

          // 重新处理所有推文
          this.processExistingTweets();
      }
  }

  // 初始化过滤器
  const filter = new XFilter();
  filter.init();

})();