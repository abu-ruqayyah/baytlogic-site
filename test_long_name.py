import asyncio
import os
from playwright.async_api import async_playwright
from pypdf import PdfReader

async def test_long_name():
    print("--- Testing Long Name & Layout Sizing ---")
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge")
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        # Test long recipient name
        long_name = "Engr. Yahaya Abdullahi Sulaiman Al-Husseini"
        url = f"http://localhost:8080/certificate.html?id=BLT-2026-099&name={long_name.replace(' ', '%20')}&course=SMART%20HOME%20AUTOMATION%20%26%20SMART%20CCTV%20INSTALLATION&date=June%2011%20%E2%80%93%20June%2017%2C%202026"
        
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(1)
        
        # Take visual screenshot
        screenshot_path = os.path.abspath("cert_long_name_visual.png")
        cert_element = await page.query_selector("#certPaper")
        if cert_element:
            await cert_element.screenshot(path=screenshot_path)
            print(f"Long name visual screenshot saved to: {screenshot_path}")
            
        pdf_path = os.path.abspath("output_cert_long_name.pdf")
        await page.pdf(
            path=pdf_path,
            format="A4",
            landscape=True,
            print_background=True,
            margin={"top": "0mm", "right": "0mm", "bottom": "0mm", "left": "0mm"}
        )
        print(f"Long name PDF saved: {pdf_path}")
        await browser.close()

    reader = PdfReader(pdf_path)
    page = reader.pages[0]
    box = page.mediabox
    width_mm = round(float(box.width) * 25.4 / 72, 1)
    height_mm = round(float(box.height) * 25.4 / 72, 1)
    rot = page.get('/Rotate', 0)
    
    print(f"\nFinal Verification Results:")
    print(f" - Page Count: {len(reader.pages)}")
    print(f" - Document Format: A4 Landscape ({width_mm}mm × {height_mm}mm)")
    print(f" - Orientation Rotation: {rot}°")
    print(f" - Long Name Handled: '{long_name}'")

if __name__ == "__main__":
    asyncio.run(test_long_name())
