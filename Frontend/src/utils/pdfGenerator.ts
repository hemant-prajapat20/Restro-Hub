import { jsPDF } from 'jspdf';

export interface PDFReceiptItem {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PDFReceiptData {
  title?: string;
  type?: string;
  invoiceNumber: string;
  timestamp: string;
  tableName?: string | number;
  items: PDFReceiptItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  discountCode?: string;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
}

export const generateReceiptPDF = (data: PDFReceiptData) => {
  let estimatedY = 30;
  estimatedY += 10 + 6 + 4 + 4 + (data.tableName ? 4 : 0) + 5;
  estimatedY += 5 + 4 + 4 + 5;
  estimatedY += 5 + 3 + 5;
  estimatedY += (data.items.length * 4);
  estimatedY += 2 + 5 + 4 + (data.discount && data.discount > 0 ? 4 : 0) + 4;
  estimatedY += 5 + 6 + 6 + 4;
  estimatedY += 10 + 4 + 3;
  estimatedY += 8 + 5 + 3 + 2.5 + 2.5 + 2.5;
  estimatedY += 6;
  estimatedY += 15; // padding

  const receiptHeight = estimatedY;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, receiptHeight]
  });

  const width = doc.internal.pageSize.getWidth();
  let y = 0;

  // 1. Header 
  y += 10;
  const brandName = data.title || "DINE & DUSK PRIVATE LIMITED";
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Pure Black
  doc.text(brandName.toUpperCase(), width / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text("Vastrapur, Ahmedabad, Gujarat, 380015", width / 2, y, { align: 'center' });
  y += 4;
  doc.text("Tel: +91 79 4830112 | GST: 24AAACR1234F1Z5", width / 2, y, { align: 'center' });

  // 2. Metadata (Date, Time, Invoice)
  doc.setTextColor(0, 0, 0);
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("TAX INVOICE", width / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Invoice No: ${data.invoiceNumber}`, 5, y);
  y += 4;
  doc.text(`Date & Time: ${data.timestamp}`, 5, y);
  if (data.tableName) {
    y += 4;
    doc.text(`Table/Entity: ${data.tableName}`, 5, y);
  }

  // Divider
  y += 5;
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, width - 5, y);
  doc.setLineDashPattern([], 0);

  // 3. Customer Details
  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.text("Billed To:", 5, y);
  doc.setFont('Helvetica', 'normal');
  y += 4;
  doc.text(`Customer Name: ${data.customerName || 'Walk-in Customer'}`, 5, y);
  y += 4;
  doc.text(`Mobile Number: ${data.customerPhone || '+91 - Not Provided'}`, 5, y);

  // Divider
  y += 5;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, width - 5, y);
  doc.setLineDashPattern([], 0);

  // 4. Items Table
  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text("ITEM", 5, y);
  doc.text("QTY", width - 25, y, { align: 'right' });
  doc.text("TOTAL", width - 5, y, { align: 'right' });

  y += 3;
  doc.setLineWidth(0.3);
  doc.line(5, y, width - 5, y);

  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);

  data.items.forEach((item) => {
    let nameText = item.name;
    if (nameText.length > 20) {
      nameText = nameText.substring(0, 18) + '..';
    }
    doc.text(nameText, 5, y);
    doc.text(`${item.quantity}`, width - 25, y, { align: 'right' });
    doc.text(`₹ ${(item.price * item.quantity).toFixed(2)}`, width - 5, y, { align: 'right' });
    y += 4;
  });

  // Divider
  y += 2;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, width - 5, y);
  doc.setLineDashPattern([], 0);

  // Subtotal & GST
  y += 5;
  doc.text("Amount (Subtotal):", width - 30, y, { align: 'right' });
  doc.text(`₹ ${data.subtotal.toFixed(2)}`, width - 5, y, { align: 'right' });

  y += 4;
  doc.text("GST Offer (5%):", width - 30, y, { align: 'right' });
  doc.text(`₹ ${data.tax.toFixed(2)}`, width - 5, y, { align: 'right' });

  if (data.discount && data.discount > 0) {
    y += 4;
    doc.text(`Discount:`, width - 30, y, { align: 'right' });
    doc.text(`-₹ ${data.discount.toFixed(2)}`, width - 5, y, { align: 'right' });
  }

  // Divider
  y += 4;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, width - 5, y);
  doc.setLineDashPattern([], 0);

  // 5. Payment Method
  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.text("Payment Method:", width - 30, y, { align: 'right' });
  doc.text(`${data.paymentMethod.toUpperCase()}`, width - 5, y, { align: 'right' });

  // 6. Total Amount in Hinglish
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // MUST BE PURE BLACK
  doc.text("Total Amount (Kul Rashi):", width - 30, y, { align: 'right' });
  doc.text(`₹ ${data.total.toFixed(2)}`, width - 5, y, { align: 'right' });

  // 7. Payment Status
  y += 6;
  doc.setFontSize(8);
  doc.text("Payment Status:", width - 30, y, { align: 'right' });
  doc.text("SUCCESS", width - 5, y, { align: 'right' });

  // Divider Thick
  doc.setLineWidth(0.5);
  y += 4;
  doc.line(5, y, width - 5, y);

  // 8. Digital Signature
  y += 10;
  doc.setDrawColor(0, 0, 0); // Black ink
  doc.setLineWidth(0.4);
  const sigStartX = width / 2 - 10;
  const sigStartY = y;
  doc.lines([[10, -5], [5, 5], [15, -2], [5, 2]], sigStartX, sigStartY);

  y += 4;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.text("DIGITALLY SIGNED & VERIFIED", width / 2, y, { align: 'center' });
  y += 3;
  doc.setFont('Helvetica', 'italic');
  doc.text("Authorized Signatory", width / 2, y, { align: 'center' });

  // 9. Rules / Terms
  y += 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, width - 5, y);
  doc.setLineDashPattern([], 0);

  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.text("RULES & CONDITIONS", 5, y);

  y += 3;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(5);
  doc.text("1. All taxes are as per government regulations.", 5, y);
  y += 2.5;
  doc.text("2. Items once billed cannot be cancelled or refunded.", 5, y);
  y += 2.5;
  doc.text("3. Keep this receipt for future reference.", 5, y);

  // Footer
  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6);
  doc.text("Powered by Dine & Dusk v1.0", width / 2, y, { align: 'center' });

  doc.save(`Invoice_${data.invoiceNumber || 'receipt'}.pdf`);
};
