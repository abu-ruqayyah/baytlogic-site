import asyncio
import os
from playwright.async_api import async_playwright
from pypdf import PdfReader

async def test_download():
    print("--- Testing Download A4 Landscape PDF Button ---")
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge")
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        await page.goto("http://localhost:8080/certificate.html?id=BLT-2026-020", wait_until="networkidle")
        await asyncio.sleep(1)
        
        # Trigger download button and catch event
        async with page.expect_download() as download_info:
            await page.click("button:has-text('Download A4 Landscape PDF')")
        
        download = await download_info.value
        save_path = os.path.abspath("downloaded_cert_edge_to_edge.pdf")
        await download.save_as(save_path)
        print(f"Downloaded PDF saved to: {save_path}")
        await browser.close()

    reader = PdfReader(save_path)
    page = reader.pages[0]
    box = page.mediabox
    width_mm = round(float(box.width) * 25.4 / 72, 1)
    height_mm = round(float(box.height) * 25.4 / 72, 1)
    rot = page.get('/Rotate', 0)
    
    print(f"\nDownloaded PDF Metrics:")
    print(f" - Page Count: {len(reader.pages)}")
    print(f" - Width:  {width_mm} mm (Expected ~297mm)")
    print(f" - Height: {height_mm} mm (Expected ~210mm)")
    print(f" - Rotation: {rot}°")
    
    assert abs(width_mm - 297.0) <= 2.0, f"Width mismatch: {width_mm}"
    assert abs(height_mm - 210.0) <= 2.0, f"Height mismatch: {height_mm}"
    print("\nSUCCESS: Downloaded PDF matches exact 297mm x 210mm A4 Landscape format!")

if __name__ == "__main__":
    asyncio.run(test_download())
