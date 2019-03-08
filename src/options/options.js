import { sortGroup, sortShortcut, setDefaultValues, renderUI, guid, isValidURL } from './helpers.js';

const initCreateGroupForm = () => {
  const el = document.getElementById('create-group-form');
  el.addEventListener('submit', function(e) {
    e.preventDefault();
    handleCreateGroupSubmit();
  }, false);
}

const resetCreateGroupForm = () => {
  document.getElementById('prefix').value = '';
  document.getElementById('group-name').value = '';
}

const handleCreateGroupSubmit = () => {
  const groupName = document.getElementById('group-name').value;
  const prefix = document.getElementById('prefix').value;

  if (!groupName || !prefix) {
    alert('Please enter group name and prefix');
    return;
  }

  chrome.storage.local.get(['groups'], function(result) {
    const groups = result.groups || [];

    const exists = groups.find(obj => obj.name === groupName.trim());
    if (exists) {
      alert('Group name already exists');
      return;
    }

    groups.push({
      id: guid(),
      prefix: prefix,
      name: groupName
    });
    groups.sort(sortGroup);

    chrome.storage.local.set({groups: groups}, function() {
      resetCreateGroupForm();
      renderUI();
    });
  });
}

const initCreateShortcutForm = () => {
  const el = document.getElementById('create-shortcut-form');
  el.addEventListener('submit', function(e) {
    e.preventDefault();
    const group = document.getElementById('group-list').value;
    let keyword = document.getElementById('keyword').value;
    const url = document.getElementById('url').value;

    if (!keyword || !url) {
      alert('Please enter keyword and URL');
      return;
    }

    if (!isValidURL(url)) {
      alert('Please enter complete URL including http');
      return; 
    }

    chrome.storage.local.get(['shortcuts', 'groups'], function(result) {
      const shortcuts = result.shortcuts || [];
      const groups = result.groups || [];

      if (group !== 'default') {
        keyword = appendPrefixToKeyword(groups, group, keyword);
      }

      const exists = shortcuts.find(obj => obj.keyword === keyword.trim());
      if (exists) {
        alert('Keyword already exists');
        return;
      }

      shortcuts.push({ group, keyword, url });
      shortcuts.sort(sortShortcut);

      chrome.storage.local.set({shortcuts: shortcuts}, function() {
        document.getElementById('keyword').value = '';
        document.getElementById('url').value = '';
        renderUI();
      });
    });

  }, false);
}

const deleteShortcutWithKeyword = (keyword) => {
  chrome.storage.local.get(['shortcuts'], function(result) {
    const shortcuts = result.shortcuts || [];
    const index = shortcuts.findIndex(obj => obj.keyword === keyword);
    if (index > -1) {
      shortcuts.splice(index, 1);  
    }
    chrome.storage.local.set({shortcuts: shortcuts}, function() {
      renderUI();
    });
  });
}

const appendPrefixToKeyword = (groups, groupId, keyword) => {
  const group = groups.find(obj => obj.id === groupId);
  if (group && group.prefix) {
    return `${group.prefix} ${keyword}`;
  }
  return keyword;
};

const handleImportDataSubmit = () => {
  const json = document.getElementById('import-data-json').value;
  try {
    const importData = JSON.parse(json);

    const importGroups = importData.groups || [];
    const importShortcuts = importData.shortcuts || [];

    chrome.storage.local.get(['groups', 'shortcuts'], function(result) {
      const groups = result.groups || [];
      const shortcuts = result.shortcuts || [];

      importGroups.forEach(({ id, name, prefix }) => {
        if (!id || !name) {
          return;
        }

        // Ignore import group if ID already exists
        const exists = groups.find((group) => group.id === id);
        if (exists) {
          return;
        }

        groups.push({ id, name, prefix });
      });

      groups.sort(sortGroup);

      importShortcuts.forEach(({ group, keyword, url }) => {
        if (!group || !keyword || !url) {
          return;
        }

        // Ignore import shortcut if keyword already exists
        const exists = shortcuts.find((shortcut) => shortcut.keyword === keyword);
        if (exists) {
          return;
        }

        shortcuts.push({ group, keyword, url });
      });

      shortcuts.sort(sortShortcut);

      chrome.storage.local.set({groups: groups, shortcuts: shortcuts}, function() {
        renderUI();
      });
    });
  } catch (e) {
    alert('Invalid JSON');
    return;
  }
}

const handleExportDataLoad = () => {
  const el = document.getElementById('export-data-json');
  chrome.storage.local.get(['groups', 'shortcuts'], (result) => {
    el.innerHTML = JSON.stringify(result, undefined, 2);
  });
}

const handleExportDataCopy = () => {
  const el = document.getElementById('export-data-json');
  const json = el.textContent;

  const tmpEl = document.createElement('textarea');
  tmpEl.value = json;
  document.body.appendChild(tmpEl);
  tmpEl.select();
  document.execCommand('copy');
  document.body.removeChild(tmpEl);
}

const initClickHandlers = () => {
  document.addEventListener('click', function(e){
    
    const classes = e.target.classList;
    if (classes.contains('modal-button')) {
      const target = e.target.getAttribute('data-target');
      document.getElementById(target).classList.add('is-active');
    } else if (classes.contains('modal-hide')) {
      const target = e.target.getAttribute('data-target');
      document.getElementById(target).classList.remove('is-active');
    }

    switch (e.target.id) {
      case 'create-group-submit':
        handleCreateGroupSubmit();
        break;
      case 'shortcut-delete':
        const keyword = e.target.getAttribute('data-keyword');
        deleteShortcutWithKeyword(keyword);
        break;
      case 'import-data-submit':
        handleImportDataSubmit();
        break;
      case 'export-data-load':
        handleExportDataLoad();
        break;
      case 'export-data-copy':
        handleExportDataCopy();
        break;
    }
  })
}

function onInit() {
  // seed data
  setDefaultValues(function() {
    renderUI();
    initCreateGroupForm();
    initCreateShortcutForm();
    initClickHandlers();
  });
}

document.addEventListener('DOMContentLoaded', onInit, false);

// Textarea autosizing
var textarea = document.querySelector('textarea');
textarea.addEventListener('keydown', autosize);
function autosize(){
  var el = this;
  setTimeout(function(){
    el.style.cssText = 'height:30px; padding:0';
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
    el.style.cssText = 'height:' + (el.scrollHeight + 8) + 'px';
  },0);
}