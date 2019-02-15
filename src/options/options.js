import { setDefaultValues, renderUI, guid, isValidURL } from './helpers.js';


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

const initCreateShortcutForm = () => {
  const el = document.getElementById('createShortcutForm');
  el.addEventListener("submit", function(e) {
    e.preventDefault();
    const group = document.getElementById('group-list').value;
    let keyword = document.getElementById('keyword').value;
    const url = document.getElementById('url').value;

    if (!keyword || !url) {
      alert("Please enter valid details");
      return;
    }

    if (!isValidURL(url)) {
      alert("Please enter complete URL including http");
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
        alert("shortcut already exists");
        return;
      }
      shortcuts.push({
        keyword,
        url,
        group,
      });
      shortcuts.sort((a, b) => {
        if (a.group == b.group) {
          return (a.keyword > b.keyword) ? 1 : -1;
        } else {
          return (a.group > b.group) ? 1 : -1;
        }
      });
      chrome.storage.local.set({shortcuts: shortcuts}, function() {
        document.getElementById('keyword').value = '';
        document.getElementById('url').value = '';
        renderUI();
      });
    });

  }, false);
}

const resetCreateGroupForm = () => {
  document.getElementById('prefix').value = '';
  document.getElementById('groupName').value = '';
}

const handleCreateGroupSubmit = () => {
  const prefix = document.getElementById('prefix').value || false;
  const groupName = document.getElementById('groupName').value;

  if (!groupName || !groupName.trim()) {
    alert("Please enter group name");
    return;
  }

  chrome.storage.local.get(['groups'], function(result) {
    const groups = result.groups || [];
    const exists = groups.find(obj => obj.name === groupName.trim());
    if (exists) {
      alert("Group name already exists");
      return;
    }
    groups.push({
      prefix,
      name: groupName,
      id: guid(),
    });
    groups.sort((a, b) => {
      return (a.groupName > b.groupName) ? 1 : -1;
    });
    chrome.storage.local.set({groups: groups}, function() {
      resetCreateGroupForm();
      renderUI();
    });
  });
}

const initCreateGroupForm = () => {
  const el = document.getElementById('createGroupForm');
  el.addEventListener("submit", function(e) {
    e.preventDefault();
    handleCreateGroupSubmit();
  }, false);
}

const initDeleteShortcutEvent = () => {
  document.addEventListener('click', function(e){
    if(e.target.id === "deleteShortcut"){
      const keyword = e.target.getAttribute('data-keyword');
      deleteShortcutWithKeyword(keyword);
    }
    
    const classes = e.target.classList;
    if (classes.contains('modal-button')) {
      const target = e.target.getAttribute('data-target');
      document.getElementById(target).classList.add('is-active');
    }

    if (classes.contains('modal-hide')) {
      const target = e.target.getAttribute('data-target');
      resetCreateGroupForm();
    }

    if (e.target.id === 'submitCreateGroupForm') {
      handleCreateGroupSubmit();
    }
  })
}

function onInit() {
  // seed data
  setDefaultValues(function() {
    renderUI();  
    initCreateShortcutForm();
    initCreateGroupForm();
    initDeleteShortcutEvent();
  });
}

document.addEventListener('DOMContentLoaded', onInit, false);