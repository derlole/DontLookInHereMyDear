from playwright.sync_api import sync_playwright

emoji = "❤️"  # dein Windows-Emoji

html = f"""
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
html, body {{
    margin: 0;
    height: 100%;
    background: transparent;
}}
.container {{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 400px;
    font-family: "Segoe UI Emoji", "Apple Color Emoji", sans-serif;
}}
</style>
</head>
<body>
<div class="container">{emoji}</div>
</body>
</html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 430, "height": 430, "deviceScaleFactor": 4})

    page.set_content(html)
    page.wait_for_timeout(500)

    page.screenshot(path="emoji.png", omit_background=True)

    browser.close()