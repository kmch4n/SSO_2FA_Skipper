// Execution state management
async function saveState(state) {
    await chrome.storage.local.set({ executionState: state });
}

async function getState() {
    const result = await chrome.storage.local.get(["executionState"]);
    return result.executionState || { step: "idle" };
}

async function clearState() {
    await chrome.storage.local.remove("executionState");
}

// Utility function: Wait for element to appear
function waitForElement(xpath, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (element) {
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
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (element && element.offsetParent !== null) {
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
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check for authentication error on the page (for auto-login only)
async function checkForAuthErrorAndDisable() {
    // Wait a bit for error message to appear
    await sleep(200);

    // Look for error messages (common patterns on idp.doshisha.ac.jp)
    const errorPatterns = ["ユーザ名かパスワードが違います", "ユーザー名かパスワードが違います", "認証に失敗しました", "ログインに失敗しました", "incorrect", "invalid"];

    const bodyText = document.body.innerText || document.body.textContent;

    for (const pattern of errorPatterns) {
        if (bodyText.includes(pattern)) {
            // Get current auto-login attempt tracking
            const result = await chrome.storage.local.get(["autoLoginAttemptTime"]);
            const lastAttemptTime = result.autoLoginAttemptTime || 0;
            const currentTime = Date.now();

            // If we attempted auto-login recently (within last 5 seconds) and error is present
            // this indicates the auto-login failed
            if (currentTime - lastAttemptTime < 5000) {
                // Disable auto-login immediately
                await chrome.storage.sync.set({ autoLoginEnabled: false });

                // Clear state to prevent retry
                await clearState();

                // Clear attempt time
                await chrome.storage.local.remove("autoLoginAttemptTime");

                // Show alert to user
                alert("認証エラーが検出されました。\n\nユーザー名またはパスワードが正しくありません。\n\n無限ループを防ぐため、自動ログイン機能を無効にしました。\n\n設定ページで認証情報を確認してください。");

                return true;
            }
        }
    }

    return false;
}

// Step implementations
async function step1_enterCredentials(loginId, loginPassword, isAutoLogin = false) {
    const usernameInput = await waitForElement("/html/body/div/div/div/div/form/div[1]/input");
    usernameInput.value = loginId;

    const passwordInput = document.evaluate("/html/body/div/div/div/div/form/div[2]/input", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!passwordInput) {
        throw new Error("Password input not found");
    }
    passwordInput.value = loginPassword;

    const loginButton = document.evaluate("/html/body/div/div/div/div/form/div[5]/button", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!loginButton) {
        throw new Error("Login button not found");
    }

    // Save state for next step
    await saveState({
        step: "step2_selectAuthMethod",
        loginId: loginId,
        loginPassword: loginPassword,
        isAutoLogin: isAutoLogin,
    });

    loginButton.click();
}

async function step2_selectAuthMethod() {
    await sleep(200);

    const matrixButton = await waitForClickable("/html/body/div/div/div/form/div[1]/button");

    // Save state for next step
    await saveState({ step: "step3_clickImages" });

    matrixButton.click();
}

async function step3_clickImages() {
    await sleep(500);

    await waitForElement("//div[contains(@style, 'e17.gif')]");

    const images = document.evaluate("//div[contains(@style, 'e17.gif')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    if (images.snapshotLength === 0) {
        throw new Error("e17.gif element not found");
    }

    const targetImage = images.snapshotItem(0);

    for (let i = 0; i < 3; i++) {
        targetImage.click();
    }

    // Click final login button
    const finalButton = document.evaluate("/html/body/div/div/div[1]/div/form/div/table/tbody/tr[1]/td/div/div[38]/input[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (finalButton) {
        // Check if this was an auto-login
        const state = await getState();
        const wasAutoLogin = state.isAutoLogin || false;
        console.log("[Auto-login] In step3, isAutoLogin:", wasAutoLogin);

        // Set flag for auto-login completion BEFORE clicking
        if (wasAutoLogin) {
            console.log("[Auto-login] Setting autoLoginCompleted flag to true");
            await chrome.storage.local.set({ autoLoginCompleted: true });
        }

        finalButton.click();
        await clearState();
    } else {
        throw new Error("Final login button not found");
    }
}

// Main login process
async function executeLogin(loginId, loginPassword, isAutoLogin = false) {
    try {
        // If this is auto-login, record the attempt time
        if (isAutoLogin) {
            await chrome.storage.local.set({ autoLoginAttemptTime: Date.now() });
        }

        await step1_enterCredentials(loginId, loginPassword, isAutoLogin);
        return { success: true, message: "Login process started. It will continue automatically after page transitions." };
    } catch (error) {
        await clearState();
        return { success: false, message: "Error: " + error.message };
    }
}

// Auto-execute next step on page load
async function autoExecuteNextStep() {
    const state = await getState();

    if (state.step === "idle") {
        return;
    }

    try {
        if (state.step === "step2_selectAuthMethod") {
            await step2_selectAuthMethod();
        } else if (state.step === "step3_clickImages") {
            await step3_clickImages();
        }
    } catch (error) {
        await clearState();
    }
}

// Check if we're on the SAML2 redirect page and auto-login is enabled
async function checkAndAutoLogin() {
    const currentUrl = window.location.href;

    // First, check for authentication errors on any idp.doshisha.ac.jp page
    if (currentUrl.includes("idp.doshisha.ac.jp")) {
        const hasError = await checkForAuthErrorAndDisable();
        if (hasError) {
            return;
        }
    }

    // Check if we're on the SAML2 redirect page
    if (currentUrl.includes("idp.doshisha.ac.jp/idp/profile/SAML2/Redirect/SSO")) {
        // Get auto-login setting
        const settings = await chrome.storage.sync.get(["autoLoginEnabled", "loginId", "loginPassword"]);

        if (settings.autoLoginEnabled && settings.loginId && settings.loginPassword) {
            // Wait a bit for the page to fully load
            await sleep(500);

            // Start the login process with auto-login flag
            await executeLogin(settings.loginId, settings.loginPassword, true);
        }
    }

    // Check if we just completed auto-login and are back at SSO page
    if (currentUrl.includes("sso.doshisha.ac.jp")) {
        console.log("[Auto-login] Checking for completion flag on sso.doshisha.ac.jp");
        const result = await chrome.storage.local.get(["autoLoginCompleted"]);
        console.log("[Auto-login] autoLoginCompleted flag:", result.autoLoginCompleted);

        if (result.autoLoginCompleted) {
            console.log("[Auto-login] Completion flag found! Clearing flag and checking showAlert setting...");
            // Clear the flag
            await chrome.storage.local.remove("autoLoginCompleted");

            // Show alert if enabled (default: true)
            const settings = await chrome.storage.sync.get(["showAlert"]);
            console.log("[Auto-login] showAlert setting:", settings.showAlert);
            if (settings.showAlert !== false) {
                console.log("[Auto-login] Showing completion alert");
                alert("Auto-login completed!\n\nYou have been successfully logged in.");
            }
        }
    }
}

// Execute automatically on page load
const initializeAutoExecution = async () => {
    await autoExecuteNextStep();
    await checkAndAutoLogin();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(initializeAutoExecution, 300);
    });
} else {
    setTimeout(initializeAutoExecution, 300);
}

// Message listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "executeLogin") {
        executeLogin(request.loginId, request.loginPassword)
            .then((response) => sendResponse(response))
            .catch((error) => sendResponse({ success: false, message: error.message }));
        return true;
    }
});
