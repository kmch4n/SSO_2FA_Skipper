document.addEventListener('DOMContentLoaded', function() {
  const loginIdInput = document.getElementById('loginId');
  const loginPasswordInput = document.getElementById('loginPassword');
  const saveButton = document.getElementById('saveButton');
  const messageDiv = document.getElementById('message');

  // Load saved settings
  chrome.storage.sync.get(['loginId', 'loginPassword'], function(result) {
    if (result.loginId) {
      loginIdInput.value = result.loginId;
    }
    if (result.loginPassword) {
      loginPasswordInput.value = result.loginPassword;
    }
  });

  // Save button event listener
  saveButton.addEventListener('click', function() {
    const loginId = loginIdInput.value.trim();
    const loginPassword = loginPasswordInput.value.trim();

    if (!loginId || !loginPassword) {
      showMessage('Please enter both login ID and password', false);
      return;
    }

    chrome.storage.sync.set({
      loginId: loginId,
      loginPassword: loginPassword
    }, function() {
      showMessage('Settings saved successfully', true);
    });
  });

  function showMessage(text, isSuccess) {
    messageDiv.textContent = text;
    messageDiv.className = 'message show ' + (isSuccess ? 'success' : 'error');
    setTimeout(() => {
      messageDiv.className = 'message';
    }, 1500);
  }
});
