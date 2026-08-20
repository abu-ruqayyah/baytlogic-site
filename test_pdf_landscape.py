import asyncio
import os
import sys
from playwright.async_api import async_playwright
from pypdf import PdfReader

async def main():
    print("--- 1. Rendering Certificate to PDF & Screenshot via Playwright ---")
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge")
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        # Navigate to local HTTP server
        url = "http://localhost:8080/certificate.html?id=BLT-2026-020&name=Muhammad%20Ukasha%20Abdullahi&course=SMART%20HOME%20AUTOMATION%20%26%20SMART%20CCTV%20INSTALLATION&date=June%2011%20%E2%80%93%20June%2017%2C%202026"
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(2)
        
        # Take PNG visual inspection screenshot
        screenshot_path = os.path.abspath("cert_landscape_visual.png")
        cert_element = await page.query_selector("#certPaper")
        if cert_element:
            await cert_element.screenshot(path=screenshot_path)
            print(f"Visual screenshot saved to: {screenshot_path}")
        
        # Generate PDF with A4 Landscape (297mm x 210mm) and 0 margins
        pdf_path = os.path.abspath("output_cert_landscape.pdf")
        await page.pdf(
            path=pdf_path,
            format="A4",
            landscape=True,
            print_background=True,
            margin={"top": "0mm", "right": "0mm", "bottom": "0mm", "left": "0mm"}
        )
        print(f"PDF successfully generated: {pdf_path}")
        await browser.close()

    print("\n--- 2. Verifying PDF Page Dimensions & Rotation with pypdf ---")
    reader = PdfReader(pdf_path)
    num_pages = len(reader.pages)
    print(f"Page Count: {num_pages}")
    
    assert num_pages == 1, f"Expected 1 page, got {num_pages}"
    
    first_page = reader.pages[0]
    box = first_page.mediabox
    width_pt = float(box.width)
    height_pt = float(box.height)
    rotation = first_page.get('/Rotate', 0)
    
    # 1 pt = 1/72 inch = 25.4/72 mm = 0.3527777778 mm
    width_mm = round(width_pt * 25.4 / 72, 1)
    height_mm = round(height_pt * 25.4 / 72, 1)
    
    print(f"Width:  {width_pt:.2f} pt ({width_mm} mm)")
    print(f"Height: {height_pt:.2f} pt ({height_mm} mm)")
    print(f"Rotation: {rotation}°")
    
    # Verify true A4 Landscape (297mm x 210mm)
    assert abs(width_mm - 297.0) <= 2.0, f"Expected width ~297mm, got {width_mm}mm"
    assert abs(height_mm - 210.0) <= 2.0, f"Expected height ~210mm, got {height_mm}mm"
    assert rotation == 0, f"Expected rotation 0°, got {rotation}°"
    
    print("\nSUCCESS: All PDF dimension and rotation assertions passed perfectly!")

if __name__ == "__main__":
    asyncio.run(main())
