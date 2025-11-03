# SSO 2FA Skipper

<div align="center">

![Logo](extension/images/logo.png)

**Automate Doshisha University's Web Single Sign-On 2FA Authentication**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://www.google.com/chrome/)

</div>

---

## 🎯 Overview

SSO 2FA Skipper is a Chrome extension that automates the two-factor authentication process for Doshisha University's web single sign-on system. The extension streamlines the login process by automatically handling the image matrix authentication step.

## ⚡ Features

- **One-Click Login**: Execute the entire SSO authentication flow with a single button click
- **Automatic Page Navigation**: Seamlessly handles page transitions during the authentication process
- **Secure Credential Storage**: Saves your login credentials securely in Chrome's storage
- **User-Friendly Interface**: Clean and intuitive popup interface with current user display

## ⚙️ Prerequisites

**Important:** Before using this extension, you must configure your 2FA image authentication settings:

1. Log in to the SSO system manually
2. Navigate to your 2FA settings
3. Set your authentication method to **image matrix**
4. Select the **logo mark (triangle icon)** as your authentication image
5. Configure it to require **3 clicks** of the same image

Without this configuration, the extension cannot automate the authentication process.

## 📦 Installation

### Step 1: Download the Extension

Clone or download this repository to your local machine:

```bash
git clone https://github.com/kmch4n/SSO_2FA_Skipper.git
```

### Step 2: Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** by toggling the switch in the top right corner
3. Click **Load unpacked**
4. Select the `extension` folder from the downloaded repository

### Step 3: Configure Your Credentials

1. Click the extension icon in your Chrome toolbar
2. Click **Settings** at the bottom of the popup
3. Enter your login ID and password
4. Click **Save**

## 🚀 Usage

1. Click the extension icon
2. Click **Open SSO Page** to navigate to the login page
3. Click **Execute Login**
4. The extension will automatically complete the 2FA process

That's it! The extension handles everything from entering credentials to clicking the correct image matrix selections.

## ⚠️ Security Notice

**Important:** This extension stores your credentials in Chrome's sync storage. Only use this extension with your own account on devices you trust. The author assumes no responsibility for any security issues or disadvantages resulting from the use of this tool.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Disclaimer

This tool is provided for convenience and educational purposes. The two-factor authentication system it bypasses is described as "merely a formality" by the author. Use at your own risk and ensure compliance with your institution's acceptable use policies.

---

<div align="center">
Made by kmch4n
</div>
