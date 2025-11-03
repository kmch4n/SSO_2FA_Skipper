from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import time
import os

load_dotenv()

LOGIN_ID = os.environ["LOGIN_ID"]
LOGIN_PASSWORD = os.environ["LOGIN_PASSWORD"]

# --- Chromeドライバーの設定 ---
options = Options()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(options=options)

# --- STEP 1: ページを開く ---
driver.get("https://sso.doshisha.ac.jp/")

# --- STEP 2: ユーザー名とパスワードを入力 ---
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "/html/body/div/div/div/div/form/div[1]/input"))).send_keys(LOGIN_ID)
driver.find_element(By.XPATH, "/html/body/div/div/div/div/form/div[2]/input").send_keys(LOGIN_PASSWORD)
driver.find_element(By.XPATH, "/html/body/div/div/div/div/form/div[5]/button").click()

# --- STEP 3: イメージマトリクスを選択 ---
WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "/html/body/div/div/div/form/div[1]/button"))).click()

# --- STEP 4: e17.gifが含まれる要素を3回クリック ---
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//div[contains(@style, 'e17.gif')]"))
)

# 見つかったe17.gifの要素を3回クリック
images = driver.find_elements(By.XPATH, "//div[contains(@style, 'e17.gif')]")
for _ in range(3):
    images[0].click()
    time.sleep(1)

# --- STEP 5: ログインボタンをクリック ---
driver.find_element(By.XPATH, "/html/body/div/div/div[1]/div/form/div/table/tbody/tr[1]/td/div/div[38]/input[1]").click()

# 必要に応じて処理継続...
time.sleep(5)  # ページ遷移を待つ