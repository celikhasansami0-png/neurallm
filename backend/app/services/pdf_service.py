"""Generates simple PDF documents (İrsaliye / Fatura) using reportlab.

Returns raw PDF bytes; the router is responsible for persisting/serving them.
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def render_document_pdf(
    *,
    doc_type: str,  # "irsaliye" | "fatura"
    doc_number: str,
    company_name: str,
    cari_name: str,
    cari_address: str,
    cari_tax_number: str,
    order_number: str,
    issued_at: str,
    items: list[dict],  # [{name, quantity, unit, unit_price, tax_rate, line_total}]
    currency: str,
    subtotal: float,
    tax_total: float,
    total: float,
) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=20, spaceAfter=4)
    label = "İRSALİYE" if doc_type == "irsaliye" else "FATURA"

    elements = [
        Paragraph(company_name, title_style),
        Paragraph(f"{label} — {doc_number}", styles["Heading2"]),
        Spacer(1, 6 * mm),
        Paragraph(f"<b>Cari:</b> {cari_name}", styles["Normal"]),
        Paragraph(f"<b>Adres:</b> {cari_address}", styles["Normal"]),
        Paragraph(f"<b>Vergi No:</b> {cari_tax_number}", styles["Normal"]),
        Paragraph(f"<b>Sipariş No:</b> {order_number}", styles["Normal"]),
        Paragraph(f"<b>Tarih:</b> {issued_at}", styles["Normal"]),
        Spacer(1, 8 * mm),
    ]

    table_data = [["Ürün", "Miktar", "Birim", "Birim Fiyat", "KDV %", "Tutar"]]
    for it in items:
        table_data.append([
            it.get("name", ""), str(it.get("quantity", "")), it.get("unit", ""),
            f"{it.get('unit_price', 0):.2f}", f"%{it.get('tax_rate', 0):.0f}", f"{it.get('line_total', 0):.2f}",
        ])
    table = Table(table_data, colWidths=[55 * mm, 20 * mm, 20 * mm, 30 * mm, 20 * mm, 30 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111111")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(f"Ara Toplam: {subtotal:.2f} {currency}", styles["Normal"]))
    elements.append(Paragraph(f"KDV Toplam: {tax_total:.2f} {currency}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Genel Toplam: {total:.2f} {currency}</b>", styles["Heading3"]))

    doc.build(elements)
    return buffer.getvalue()
