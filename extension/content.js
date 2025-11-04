// Execution state management
async function saveState(state) {
  await chrome.storage.local.set({ executionState: state });
}

async function getState() {
  const result = await chrome.storage.local.get(['executionState']);
  return result.executionState || { step: 'idle' };
}

async function clearState() {
  await chrome.storage.local.remove('executionState');
}

// Utility function: Wait for element to appear
function waitForElement(xpath, timeout = 5000) {
  console.log(`[waitForElement] 要素を待機中: ${xpath} (タイムアウト: ${timeout}ms)`);
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (element) {
        const elapsed = Date.now() - startTime;
        console.log(`[waitForElement] 要素が見つかりました (${elapsed}ms経過)`);
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not found: ${xpath}`));
      } else {
        setTimeout(checkElement, 50);
      }
    };

    checkElement();
  });
}

// Utility function: Wait for element to be clickable
function waitForClickable(xpath, timeout = 5000) {
  console.log(`[waitForClickable] クリック可能要素を待機中: ${xpath} (タイムアウト: ${timeout}ms)`);
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (element && element.offsetParent !== null) {
        const elapsed = Date.now() - startTime;
        console.log(`[waitForClickable] クリック可能になりました (${elapsed}ms経過)`);
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not clickable: ${xpath}`));
      } else {
        setTimeout(checkElement, 50);
      }
    };

    checkElement();
  });
}

// Utility function: Sleep
function sleep(ms) {
  console.log(`[sleep] ${ms}ms 待機中...`);
  return new Promise(resolve => setTimeout(() => {
    console.log(`[sleep] ${ms}ms 待機完了`);
    resolve();
  }, ms));
}

// Step implementations
async function step1_enterCredentials(loginId, loginPassword) {
  const usernameInput = await waitForElement("/html/body/div/div/div/div/form/div[1]/input");
  usernameInput.value = loginId;

  const passwordInput = document.evaluate(
    "/html/body/div/div/div/div/form/div[2]/input",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (!passwordInput) {
    throw new Error("Password input not found");
  }
  passwordInput.value = loginPassword;

  const loginButton = document.evaluate(
    "/html/body/div/div/div/div/form/div[5]/button",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (!loginButton) {
    throw new Error("Login button not found");
  }

  // Save state for next step
  await saveState({
    step: 'step2_selectAuthMethod',
    loginId: loginId,
    loginPassword: loginPassword
  });

  loginButton.click();
}

async function step2_selectAuthMethod() {
  await sleep(200);

  const matrixButton = await waitForClickable("/html/body/div/div/div/form/div[1]/button");

  // Save state for next step
  await saveState({ step: 'step3_clickImages' });

  matrixButton.click();
}

async function step3_clickImages() {
  await sleep(500);

  await waitForElement("//div[contains(@style, 'e17.gif')]");

  const images = document.evaluate(
    "//div[contains(@style, 'e17.gif')]",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  if (images.snapshotLength === 0) {
    throw new Error("e17.gif element not found");
  }

  const targetImage = images.snapshotItem(0);

  for (let i = 0; i < 3; i++) {
    targetImage.click();
  }

  // Click final login button
  const finalButton = document.evaluate(
    "/html/body/div/div/div[1]/div/form/div/table/tbody/tr[1]/td/div/div[38]/input[1]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (finalButton) {
    finalButton.click();
    await clearState();
  } else {
    throw new Error("Final login button not found");
  }
}

// Main login process
async function executeLogin(loginId, loginPassword) {
  try {
    await step1_enterCredentials(loginId, loginPassword);
    return { success: true, message: 'Login process started. It will continue automatically after page transitions.' };
  } catch (error) {
    console.error('Login error:', error);
    await clearState();
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Auto-execute on page load
async function autoExecuteNextStep() {
  const state = await getState();

  if (state.step === 'idle') {
    return;
  }

  try {
    if (state.step === 'step2_selectAuthMethod') {
      await step2_selectAuthMethod();
    } else if (state.step === 'step3_clickImages') {
      await step3_clickImages();
    }
  } catch (error) {
    console.error('Auto-execution error:', error);
    await clearState();
  }
}

// Execute automatically on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[自動実行] 300ms後に次のステップを実行します');
    setTimeout(autoExecuteNextStep, 300);
  });
} else {
  console.log('[自動実行] 300ms後に次のステップを実行します');
  setTimeout(autoExecuteNextStep, 300);
}

// Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'executeLogin') {
    executeLogin(request.loginId, request.loginPassword)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }
});
