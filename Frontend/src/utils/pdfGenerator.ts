import { jsPDF } from 'jspdf';

export interface PDFReceiptItem {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PDFReceiptData {
  title?: string;
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
}

export const generateReceiptPDF = (data: PDFReceiptData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const logo = data.title || "INDULGE RETRO";
  const sublogo = "FINE DINING & LOUNGE";

  // Margins & Dimensions
  const margin = 12;
  const width = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(logo.toUpperCase(), width / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(sublogo, width / 2, y, { align: 'center' });

  y += 4;
  doc.text("Vastrapur, Ahmedabad, Gujarat • +91 79 4830112", width / 2, y, { align: 'center' });

  // Upper Border
  y += 5;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, y, width - margin, y);

  // Metadata Grid
  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Invoice: ${data.invoiceNumber}`, margin, y);
  
  const rightAlignX = width - margin;
  doc.text(`Date: ${data.timestamp}`, rightAlignX, y, { align: 'right' });

  y += 5;
  if (data.tableName) {
    doc.text(`Table Entity: ${data.tableName}`, margin, y);
    doc.text(`Payment options: ${data.paymentMethod}`, rightAlignX, y, { align: 'right' });
  } else {
    doc.text(`Payment: ${data.paymentMethod}`, margin, y);
    doc.text(`Status: SETTLED & PAID`, rightAlignX, y, { align: 'right' });
  }

  // Middle Border
  y += 5;
  doc.line(margin, y, width - margin, y);

  // Table Columns Headers
  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Item Name", margin, y);
  doc.text("Price", width - 35, y, { align: 'right' });
  doc.text("Qty", width - 20, y, { align: 'right' });
  doc.text("Total", width - margin, y, { align: 'right' });

  // Border below headers
  y += 3;
  doc.line(margin, y, width - margin, y);

  // Line Items
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // slate-700
  
  data.items.forEach((item) => {
    let nameText = item.name;
    if (nameText.length > 28) {
      nameText = nameText.substring(0, 25) + '...';
    }
    doc.text(nameText, margin, y);
    doc.text(`₹${item.price.toLocaleString()}`, width - 35, y, { align: 'right' });
    doc.text(`${item.quantity}`, width - 20, y, { align: 'right' });
    doc.text(`₹${(item.price * item.quantity).toLocaleString()}`, width - margin, y, { align: 'right' });
    y += 5.5;
  });

  // Border above financial ledger
  y += 1;
  doc.line(margin, y, width - margin, y);

  // Financial Ledger calculations
  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Sub-total Amount:", width - 40, y, { align: 'right' });
  doc.text(`₹${data.subtotal.toLocaleString()}`, width - margin, y, { align: 'right' });

  y += 5;
  doc.text("GST Tax (5.00%):", width - 40, y, { align: 'right' });
  doc.text(`₹${data.tax.toLocaleString()}`, width - margin, y, { align: 'right' });

  if (data.discount && data.discount > 0) {
    y += 5;
    doc.setTextColor(22, 163, 74); // green-600
    const code = data.discountCode ? ` (${data.discountCode})` : '';
    doc.text(`Discount applied${code}:`, width - 40, y, { align: 'right' });
    doc.text(`-₹${data.discount.toLocaleString()}`, width - margin, y, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  // Total Border
  y += 4;
  doc.line(width - 60, y, width - margin, y);

  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Paid:", width - 40, y, { align: 'right' });
  doc.text(`₹${data.total.toLocaleString()}`, width - margin, y, { align: 'right' });

  // Bottom Notice
  y += 14;
  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Thank you for dining with us!", width / 2, y, { align: 'center' });
  
  y += 4;
  doc.setFont('Helvetica', 'normal');
  doc.text("Please visit again • Generated Digitally", width / 2, y, { align: 'center' });

  // Save/Download operation
  doc.save(`Invoice_${data.invoiceNumber || 'receipt'}.pdf`);
};
