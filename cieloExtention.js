// ==UserScript==
// @name         Cielo Address Notator
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Add stylish notes to Solana addresses on Cielo Finance
// @author       tcitds1
// @match        https://app.cielo.finance/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cielo.finance
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @updateURL    https://cdn.jsdelivr.net/gh/tcitds1/tampermonkey@main/cieloExtention.js
// @downloadURL  https://cdn.jsdelivr.net/gh/tcitds1/tampermonkey@main/cieloExtention.js
// ==/UserScript==

(function() {
  'use strict';

  let addressNotes = GM_getValue('addressNotes', {});

  // 添加自定义样式
  GM_addStyle(`
      #addressNoteContainer {
          position: absolute;
          top: 72px;
          left: 478px;
          z-index: 1000;
          display: flex;
          align-items: center;
          font-family: Arial, sans-serif;
      }
      #addressNoteText {
          background-color: #FFD700;
          color: #000;
          padding: 4px 8px;
          border-radius: 15px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      #addressNoteEdit {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 4px 8px;
          margin-left: 10px;
          border-radius: 15px;
          cursor: pointer;
          transition: background-color 0.3s;
      }
      #addressNoteEdit:hover {
          background-color: #45a049;
      }
      #gmgnButton {
          background-color: #2196F3;
          color: white;
          border: none;
          padding: 4px 8px;
          margin-left: 10px;
          border-radius: 15px;
          cursor: pointer;
          transition: background-color 0.3s;
      }
      #gmgnButton:hover {
          background-color: #0b7dda;
      }
      #arkmButton {
          background-color: #FF4081;
          color: white;
          border: none;
          padding: 4px 8px;
          margin-left: 10px;
          border-radius: 15px;
          cursor: pointer;
          transition: background-color 0.3s;
      }
      #arkmButton:hover {
          background-color: #e91e63;
      }
  `);

  function addNote() {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const targetDiv = mainElement.querySelector('div');
      if (!targetDiv) return;

      const address = window.location.pathname.split('/')[2];

      // 创建或更新备注容器
      let noteContainer = document.getElementById('addressNoteContainer');
      if (!noteContainer) {
          noteContainer = document.createElement('div');
          noteContainer.id = 'addressNoteContainer';
          targetDiv.style.position = 'relative';
          targetDiv.insertBefore(noteContainer, targetDiv.firstChild);
      }

      // 清空容器
      noteContainer.innerHTML = '';

      // 添加备注文本
      const noteText = document.createElement('span');
      noteText.id = 'addressNoteText';
      noteText.textContent = addressNotes[address] || 'No note';
      noteContainer.appendChild(noteText);

      // 添加编辑按钮
      const editButton = document.createElement('button');
      editButton.id = 'addressNoteEdit';
      editButton.textContent = 'Edit';
      editButton.onclick = () => {
          const newNote = prompt('Enter a note for this address:', addressNotes[address] || '');
          if (newNote !== null) {
              addressNotes[address] = newNote;
              GM_setValue('addressNotes', addressNotes);
              noteText.textContent = newNote || 'No note';
          }
      };
      noteContainer.appendChild(editButton);

      // 添加GMGN按钮
      const gmgnButton = document.createElement('button');
      gmgnButton.id = 'gmgnButton';
      gmgnButton.textContent = 'GMGN';
      gmgnButton.onclick = () => {
          window.open(`https://gmgn.ai/sol/address/${address}`, '_blank');
      };
      noteContainer.appendChild(gmgnButton);

      // 添加Arkm按钮
      const arkmButton = document.createElement('button');
      arkmButton.id = 'arkmButton';
      arkmButton.textContent = 'Arkm';
      arkmButton.onclick = () => {
          window.open(`https://intel.arkm.com/explorer/address/${address}`, '_blank');
      };
      noteContainer.appendChild(arkmButton);
  }

  function addDownloadButton() {
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download Notes';
      downloadButton.style.position = 'fixed';
      downloadButton.style.top = '10px';
      downloadButton.style.right = '10px';
      downloadButton.style.padding = '5px 10px';
      downloadButton.style.backgroundColor = '#4CAF50';
      downloadButton.style.color = 'white';
      downloadButton.style.border = 'none';
      downloadButton.style.borderRadius = '15px';
      downloadButton.style.cursor = 'pointer';
      downloadButton.onclick = () => {
          const jsonString = JSON.stringify(addressNotes, null, 2);
          const blob = new Blob([jsonString], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'address_notes.json';
          a.click();
          URL.revokeObjectURL(url);
      };
      document.body.appendChild(downloadButton);
  }

  // 等待页面加载完成
  window.addEventListener('load', () => {
      addNote();
      addDownloadButton();
  });

  // 监听URL变化，以处理SPA导航
  let lastUrl = location.href;
  new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(addNote, 1000); // 给SPA一些时间来更新DOM
      }
  }).observe(document, {subtree: true, childList: true});

})();