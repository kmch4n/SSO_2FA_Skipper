document.addEventListener('DOMContentLoaded', function() {
  const executeBtn = document.getElementById('executeBtn');
  const openSsoBtn = document.getElementById('openSsoBtn');
  const statusDiv = document.getElementById('status');
  const settingsLink = document.getElementById('settingsLink');
  const userInfoDiv = document.getElementById('userInfo');
  const userIdSpan = document.getElementById('userId');

  // Load and display user ID
  chrome.storage.sync.get(['loginId'], function(result) {
    if (result.loginId) {
      userIdSpan.textContent = result.loginId;
      userInfoDiv.style.display = 'block';
    }
  });

  // Open settings page
  settingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Open SSO page
  openSsoBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://sso.doshisha.ac.jp/' });
  });

  // Execute login
  executeBtn.addEventListener('click', async function() {
    executeBtn.disabled = true;
    statusDiv.textContent = 'Executing...';
    statusDiv.className = 'info';

    try {
      // Get credentials
      const result = await chrome.storage.sync.get(['loginId', 'loginPassword']);

      if (!result.loginId || !result.loginPassword) {
        statusDiv.textContent = 'Credentials not configured. Please set them in Settings.';
        statusDiv.className = 'error';
        executeBtn.disabled = false;
        return;
      }

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('sso.doshisha.ac.jp') && !tab.url.includes('idp.doshisha.ac.jp')) {
        statusDiv.textContent = 'Please run on SSO page';
        statusDiv.className = 'error';
        executeBtn.disabled = false;
        return;
      }

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'executeLogin',
        loginId: result.loginId,
        loginPassword: result.loginPassword
      }, function(response) {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          statusDiv.className = 'error';
        } else if (response && response.success) {
          statusDiv.textContent = response.message;
          statusDiv.className = 'success';
        } else {
          statusDiv.textContent = response ? response.message : 'An error occurred';
          statusDiv.className = 'error';
        }
        executeBtn.disabled = false;
      });
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.className = 'error';
      executeBtn.disabled = false;
    }
  });
});
