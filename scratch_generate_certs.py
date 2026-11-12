import os
import sys
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
import fitz  # PyMuPDF

# Register professional typography
pdfmetrics.registerFont(TTFont('GreatVibes', 'assets/fonts/GreatVibes-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Georgia', 'C:/Windows/Fonts/georgia.ttf'))
pdfmetrics.registerFont(TTFont('Georgia-Bold', 'C:/Windows/Fonts/georgiab.ttf'))
pdfmetrics.registerFont(TTFont('Georgia-Italic', 'C:/Windows/Fonts/georgiai.ttf'))
pdfmetrics.registerFont(TTFont('Constantia', 'C:/Windows/Fonts/constan.ttf'))
pdfmetrics.registerFont(TTFont('Constantia-Bold', 'C:/Windows/Fonts/constanb.ttf'))
pdfmetrics.registerFont(TTFont('Constantia-Italic', 'C:/Windows/Fonts/constani.ttf'))

# Ensure tuned watermark
im = Image.open('assets/baytlogic-icon-transparent.png').convert('RGBA')
r, g, b, a = im.split()
a = a.point(lambda p: int(p * 0.040))
watermark = Image.merge('RGBA', (r, g, b, a))
watermark.save('assets/watermark_cert.png')

WIDTH, HEIGHT = landscape(A4)  # 841.89 pt x 595.28 pt

def draw_ornate_corner(c, cx, cy, size=15, color=colors.HexColor("#C59B27")):
    c.saveState()
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    
    # Outer gold diamond
    p = c.beginPath()
    p.moveTo(cx, cy + size)
    p.lineTo(cx + size, cy)
    p.lineTo(cx, cy - size)
    p.lineTo(cx - size, cy)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    
    # Inner cream diamond
    c.setFillColor(colors.HexColor("#FDFCF9"))
    inner = size * 0.48
    p2 = c.beginPath()
    p2.moveTo(cx, cy + inner)
    p2.lineTo(cx + inner, cy)
    p2.lineTo(cx, cy - inner)
    p2.lineTo(cx - inner, cy)
    p2.close()
    c.drawPath(p2, fill=1, stroke=0)
    
    # Obsidian center jewel
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.circle(cx, cy, 2.0, fill=1, stroke=0)
    c.restoreState()

def generate_certificate(recipient_name, cert_id, output_pdf_path):
    c = canvas.Canvas(output_pdf_path, pagesize=(WIDTH, HEIGHT))
    
    # --- 1. Background Parchment Base ---
    c.setFillColor(colors.HexColor("#FDFBF7"))
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    
    # Subtle inner parchment tint
    c.setFillColor(colors.HexColor("#FCFAF4"))
    c.rect(22, 22, WIDTH - 44, HEIGHT - 44, fill=1, stroke=0)
    
    # --- 2. Watermark Logo Centered ---
    wm_w, wm_h = 350, 305
    wm_x = (WIDTH - wm_w) / 2
    wm_y = (HEIGHT - wm_h) / 2 - 12
    c.drawImage('assets/watermark_cert.png', wm_x, wm_y, width=wm_w, height=wm_h, mask='auto')
    
    # --- 3. Multi-tier Luxury Guilloche/Gold Borders ---
    # Tier 1: Outer Midnight Obsidian Navy Frame
    m1 = 18
    c.setStrokeColor(colors.HexColor("#0B1D3A"))
    c.setLineWidth(1.8)
    c.rect(m1, m1, WIDTH - 2*m1, HEIGHT - 2*m1)
    
    # Tier 2: Primary Burnished Gold Border
    m2 = 23
    c.setStrokeColor(colors.HexColor("#C59B27"))
    c.setLineWidth(2.5)
    c.rect(m2, m2, WIDTH - 2*m2, HEIGHT - 2*m2)
    
    # Tier 3: Delicate Inner Gold Hairline
    m3 = 28
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(0.75)
    c.rect(m3, m3, WIDTH - 2*m3, HEIGHT - 2*m3)
    
    # Tier 4: Corner Diamond Ornaments on Tier 2
    draw_ornate_corner(c, m2, m2)
    draw_ornate_corner(c, WIDTH - m2, m2)
    draw_ornate_corner(c, m2, HEIGHT - m2)
    draw_ornate_corner(c, WIDTH - m2, HEIGHT - m2)
    
    # Elegant inner corner brackets
    c.setStrokeColor(colors.HexColor("#C59B27"))
    c.setLineWidth(0.7)
    bracket_size = 24
    for (cx, cy, dx, dy) in [
        (m3, m3, 1, 1),
        (WIDTH - m3, m3, -1, 1),
        (m3, HEIGHT - m3, 1, -1),
        (WIDTH - m3, HEIGHT - m3, -1, -1)
    ]:
        c.line(cx, cy + dy * bracket_size, cx + dx * bracket_size, cy)
        c.setFillColor(colors.HexColor("#0B1D3A"))
        c.circle(cx + dx * 10, cy + dy * 10, 1.4, fill=1, stroke=0)

    # --- 4. Institutional Header ---
    # Brand Emblem Icon
    logo_w, logo_h = 48, 48
    logo_x = (WIDTH - logo_w) / 2
    logo_y = HEIGHT - 85
    c.drawImage('assets/baytlogic-icon-cyan.png', logo_x, logo_y, width=logo_w, height=logo_h, mask='auto')
    
    # Institution Name Header
    c.setFont('Constantia-Bold', 18)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 104, "BAYTLOGIC TECHNOLOGIES")
    
    # Flanking gold ornamental lines
    c.setStrokeColor(colors.HexColor("#C59B27"))
    c.setLineWidth(0.8)
    # Left flank
    c.line(WIDTH/2 - 275, HEIGHT - 99, WIDTH/2 - 145, HEIGHT - 99)
    c.setFillColor(colors.HexColor("#C59B27"))
    c.circle(WIDTH/2 - 145, HEIGHT - 99, 1.8, fill=1, stroke=0)
    # Right flank
    c.line(WIDTH/2 + 145, HEIGHT - 99, WIDTH/2 + 275, HEIGHT - 99)
    c.circle(WIDTH/2 + 145, HEIGHT - 99, 1.8, fill=1, stroke=0)
    
    # Tagline
    c.setFont('Georgia-Italic', 9.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 118, "Where Intelligence Meets Security")
    
    # --- 5. Certificate Main Heading ---
    c.setFont('Constantia-Bold', 25)
    c.setFillColor(colors.HexColor("#9A7B2C"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 152, "CERTIFICATE OF COMPLETION")
    
    # Subtitle with flanking rules
    c.setFont('Constantia', 9.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 171, "THIS IS TO CERTIFY THAT")
    
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(0.7)
    c.line(WIDTH/2 - 220, HEIGHT - 168, WIDTH/2 - 95, HEIGHT - 168)
    c.line(WIDTH/2 + 95, HEIGHT - 168, WIDTH/2 + 220, HEIGHT - 168)
    
    # --- 6. Recipient Name (Calligraphy Masterpiece) ---
    c.setFont('GreatVibes', 43)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 226, recipient_name)
    
    # Elegant Underline with Center Diamond
    name_w = c.stringWidth(recipient_name, 'GreatVibes', 43)
    line_w = max(name_w * 0.96, 280)
    ul_y = HEIGHT - 238
    c.setStrokeColor(colors.HexColor("#C59B27"))
    c.setLineWidth(1.2)
    c.line(WIDTH/2 - line_w/2, ul_y, WIDTH/2 - 10, ul_y)
    c.line(WIDTH/2 + 10, ul_y, WIDTH/2 + line_w/2, ul_y)
    
    # Center gold diamond
    p_d = c.beginPath()
    p_d.moveTo(WIDTH/2, ul_y + 4)
    p_d.lineTo(WIDTH/2 + 4, ul_y)
    p_d.lineTo(WIDTH/2, ul_y - 4)
    p_d.lineTo(WIDTH/2 - 4, ul_y)
    p_d.close()
    c.setFillColor(colors.HexColor("#C59B27"))
    c.drawPath(p_d, fill=1, stroke=0)
    
    # --- 7. Completion Text & Course Title ---
    c.setFont('Georgia-Italic', 12)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 264, "has successfully completed the 5-Day Intensive Professional Masterclass on")
    
    # Specialization Title
    c.setFont('Constantia-Bold', 17)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(WIDTH / 2, HEIGHT - 292, "SMART HOME AUTOMATION & SMART CCTV INSTALLATION")
    
    # Training Dates Row
    c.setFont('Georgia-Italic', 10.5)
    c.setFillColor(colors.HexColor("#475569"))
    date_str = "Conducted & Evaluated: November 9 – November 13, 2026"
    c.drawCentredString(WIDTH / 2, HEIGHT - 314, date_str)
    
    # --- 8. Middle Divider Line ---
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(0.75)
    c.line(WIDTH/2 - 320, HEIGHT - 336, WIDTH/2 + 320, HEIGHT - 336)

    # --- 9. Bottom Columns: Seal (Left), Signatures (Center), QR Verification (Right) ---
    
    # (A) Left: Certified 3D Gold Seal
    seal_size = 98
    seal_x = 65
    seal_y = 95
    c.drawImage('assets/certified_gold_seal.png', seal_x, seal_y, width=seal_size, height=seal_size, mask='auto')
    
    # (B) Center: Dual Signatures
    # 1. CEO Signature Block (Left center)
    ceo_center_x = 310
    sig_line_y = 130
    
    # Authentic transparent CEO signature
    sig_w, sig_h = 100, 52
    c.drawImage('assets/ceo_signature_transparent.png', ceo_center_x - sig_w/2, sig_line_y + 4, width=sig_w, height=sig_h, mask='auto')
    
    # CEO Signature Line
    c.setStrokeColor(colors.HexColor("#0B1D3A"))
    c.setLineWidth(1)
    c.line(ceo_center_x - 75, sig_line_y, ceo_center_x + 75, sig_line_y)
    
    # CEO Titles
    c.setFont('Georgia-Bold', 10)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(ceo_center_x, sig_line_y - 14, "Engr. Yahaya Sulaiman Abdullahi")
    
    c.setFont('Georgia', 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(ceo_center_x, sig_line_y - 26, "CEO / Founder & Managing Director")
    
    c.setFont('Georgia-Italic', 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(ceo_center_x, sig_line_y - 37, "BaytLogic Technologies Ltd")

    # 2. Facilitator Signature Block (Right center)
    fac_center_x = 515
    
    # Authentic transparent Facilitator signature
    fac_sig_w, fac_sig_h = 105, 38
    c.drawImage('assets/facilitator_signature_transparent.png', fac_center_x - fac_sig_w/2, sig_line_y + 4, width=fac_sig_w, height=fac_sig_h, mask='auto')
    
    # Facilitator Signature Line
    c.setStrokeColor(colors.HexColor("#0B1D3A"))
    c.setLineWidth(1)
    c.line(fac_center_x - 75, sig_line_y, fac_center_x + 75, sig_line_y)
    
    # Facilitator Titles
    c.setFont('Georgia-Bold', 10)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(fac_center_x, sig_line_y - 14, "Engr. Ahmad Adamu Zakari")
    
    c.setFont('Georgia', 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(fac_center_x, sig_line_y - 26, "Lead Training Facilitator")
    
    c.setFont('Georgia-Italic', 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(fac_center_x, sig_line_y - 37, "BaytLogic Technologies Ltd")

    # (C) Right: Vector QR Verification Code
    qr_x = 690
    qr_y = 102
    qr_size = 62
    
    # White base plate with refined border
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(0.7)
    c.roundRect(qr_x - 4, qr_y - 4, qr_size + 8, qr_size + 8, 4, fill=1, stroke=1)
    
    verify_url = f"https://baytlogic.com.ng/verify.html?id={cert_id}"
    qr_code = qr.QrCodeWidget(verify_url)
    bounds = qr_code.getBounds()
    qw = bounds[2] - bounds[0]
    qh = bounds[3] - bounds[1]
    
    d = Drawing(qr_size, qr_size, transform=[qr_size / qw, 0, 0, qr_size / qh, 0, 0])
    d.add(qr_code)
    renderPDF.draw(d, c, qr_x, qr_y)
    
    # QR Label & ID
    c.setFont('Georgia-Bold', 8)
    c.setFillColor(colors.HexColor("#0B1D3A"))
    c.drawCentredString(qr_x + qr_size/2, qr_y - 14, "SCAN TO VERIFY")
    
    c.setFont('Helvetica-Bold', 7.5)
    c.setFillColor(colors.HexColor("#C59B27"))
    c.drawCentredString(qr_x + qr_size/2, qr_y - 24, cert_id)

    # --- 10. Security Footer Strip ---
    c.setStrokeColor(colors.HexColor("#C59B27"))
    c.setLineWidth(0.6)
    c.line(38, 52, WIDTH - 38, 52)
    
    c.setFont('Georgia', 8)
    c.setFillColor(colors.HexColor("#64748B"))
    
    # Left footer
    c.drawString(45, 40, f"Certificate ID: {cert_id}")
    
    # Center footer (Institutional certification, no partner mentioned)
    c.drawCentredString(WIDTH / 2, 40, "BaytLogic Technologies • Institutional Certification of Competency")
    
    # Right footer
    c.drawRightString(WIDTH - 45, 40, "Official Online Verification: baytlogic.com.ng/verify.html")
    
    c.save()
    print(f"Generated: {output_pdf_path}")

def convert_pdf_to_png(pdf_path, png_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    zoom = 300 / 72
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(png_path)
    print(f"Converted {pdf_path} to high-res PNG: {png_path} ({pix.width}x{pix.height})")

def main():
    recipients = [
        ("Yakubu Haruna", "BLT-2026-027", "Certificate_Yakubu_Haruna.pdf", "Certificate_Yakubu_Haruna_preview.png"),
        ("Murtala Muhammad Sha'aban", "BLT-2026-028", "Certificate_Murtala_Muhammad_Shaaban.pdf", "Certificate_Murtala_Muhammad_Shaaban_preview.png")
    ]
    
    for name, cid, pdf_name, png_name in recipients:
        generate_certificate(name, cid, pdf_name)
        convert_pdf_to_png(pdf_name, png_name)
        
    print("\nAll certificates generated and rendered successfully!")

if __name__ == "__main__":
    main()
