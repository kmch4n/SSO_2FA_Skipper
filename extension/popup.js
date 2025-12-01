document.addEventListener("DOMContentLoaded", function () {
    const executeBtn = document.getElementById("executeBtn");
    const openSsoBtn = document.getElementById("openSsoBtn");
    const statusDiv = document.getElementById("status");
    const settingsLink = document.getElementById("settingsLink");
    const userInfoDiv = document.getElementById("userInfo");
    const userIdSpan = document.getElementById("userId");
    const autoLoginToggle = document.getElementById("autoLoginToggle");
    const showAlertToggle = document.getElementById("showAlertToggle");

    // Load and display user ID and settings
    chrome.storage.sync.get(["loginId", "autoLoginEnabled", "showAlert"], function (result) {
        if (result.loginId) {
            userIdSpan.textContent = result.loginId;
            userInfoDiv.style.display = "block";
        }
        // Load auto-login setting (default: false)
        autoLoginToggle.checked = result.autoLoginEnabled || false;
        // Load show alert setting (default: true)
        showAlertToggle.checked = result.showAlert !== false;
    });

    // Save auto-login setting when toggled
    autoLoginToggle.addEventListener("change", function () {
        chrome.storage.sync.set({ autoLoginEnabled: autoLoginToggle.checked }, function () {
            const status = autoLoginToggle.checked ? "enabled" : "disabled";
            statusDiv.textContent = `Auto login ${status}`;
            statusDiv.className = "info";
            setTimeout(() => {
                statusDiv.textContent = "";
                statusDiv.className = "";
            }, 2000);
        });
    });

    // Save show alert setting when toggled
    showAlertToggle.addEventListener("change", function () {
        chrome.storage.sync.set({ showAlert: showAlertToggle.checked }, function () {
            const status = showAlertToggle.checked ? "enabled" : "disabled";
            statusDiv.textContent = `Alert notification ${status}`;
            statusDiv.className = "info";
            setTimeout(() => {
                statusDiv.textContent = "";
                statusDiv.className = "";
            }, 2000);
        });
    });

    // Open settings page
    settingsLink.addEventListener("click", function (e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    // Open SSO page
    openSsoBtn.addEventListener("click", function () {
        chrome.tabs.create({ url: "https://sso.doshisha.ac.jp/" });
    });

    // Execute login
    executeBtn.addEventListener("click", async function () {
        executeBtn.disabled = true;
        statusDiv.textContent = "Executing...";
        statusDiv.className = "info";

        try {
            // Get credentials
            const result = await chrome.storage.sync.get(["loginId", "loginPassword"]);

            if (!result.loginId || !result.loginPassword) {
                statusDiv.textContent = "Credentials not configured. Please set them in Settings.";
                statusDiv.className = "error";
                executeBtn.disabled = false;
                return;
            }

            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes("sso.doshisha.ac.jp") && !tab.url.includes("idp.doshisha.ac.jp")) {
                statusDiv.textContent = "Please run on SSO page";
                statusDiv.className = "error";
                executeBtn.disabled = false;
                return;
            }

            // Send message to content script
            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: "executeLogin",
                    loginId: result.loginId,
                    loginPassword: result.loginPassword,
                },
                function (response) {
                    if (chrome.runtime.lastError) {
                        statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
                        statusDiv.className = "error";
                    } else if (response && response.success) {
                        statusDiv.textContent = response.message;
                        statusDiv.className = "success";
                    } else {
                        statusDiv.textContent = response ? response.message : "An error occurred";
                        statusDiv.className = "error";
                    }
                    executeBtn.disabled = false;
                },
            );
        } catch (error) {
            statusDiv.textContent = "Error: " + error.message;
            statusDiv.className = "error";
            executeBtn.disabled = false;
        }
    });
});
