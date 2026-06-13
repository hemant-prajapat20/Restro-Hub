import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../utils/api';
import { Printer, Download, MapPin, Mail, Phone, ChevronLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

const toWords = (num: number): string => {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    let result = '';
    if (n >= 100) {
      result += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += a[n];
    }
    return result;
  };

  let result = '';
  let wholeNumber = Math.floor(num);
  
  if (wholeNumber >= 1000000) {
    result += convertLessThanOneThousand(Math.floor(wholeNumber / 1000000)) + 'Million ';
    wholeNumber %= 1000000;
  }
  if (wholeNumber >= 1000) {
    result += convertLessThanOneThousand(Math.floor(wholeNumber / 1000)) + 'Thousand ';
    wholeNumber %= 1000;
  }
  if (wholeNumber > 0) {
    result += convertLessThanOneThousand(wholeNumber);
  }

  return result.trim() + ' Rupees Only';
};

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const businessData = user?.businessData;

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.find((order: any) => order._id === id) || res.data.find((order: any) => order.id === id);
    }
  });

  if (isLoading) return <div className="p-10 text-center font-semibold text-slate-500">Loading Invoice Data...</div>;
  if (!invoice) return <div className="p-10 text-center font-semibold text-red-500">Invoice not found!</div>;

  const grandTotal = invoice.total || invoice.amount;
  const subtotal = invoice.subtotal || (grandTotal - (invoice.tax || 0));
  const tax = invoice.tax || 0;
  
  const invoiceId = invoice._id?.slice(-8).toUpperCase() || invoice.id?.slice(-8).toUpperCase();
  const dateFormatted = new Date(invoice.createdAt || invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  
  return (
    <div className="bg-[#f8f9fc] min-h-screen font-sans text-slate-800 pb-10 print:bg-white print:pb-0 print:h-[297mm] print:overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="px-10 py-6 flex justify-between items-center print:hidden bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <button 
          onClick={() => navigate('/business-admin?tab=transactions')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ChevronLeft size={20} /> Back to Transactions
        </button>
        <div className="flex gap-4">
          <button 
             onClick={() => {
               const phone = invoice.customerDetails?.phone || '';
               if (phone) {
                 const cleanPhone = phone.replace(/\D/g, '');
                 const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                 window.open(`https://wa.me/${finalPhone}?text=Hello! Here is your invoice link for RestroHub transaction ${invoiceId}`, '_blank');
               } else {
                 toast.error('No mobile number available for this customer');
               }
             }}
             className="px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#1ebd57] transition-colors flex items-center justify-center gap-2 shadow-sm"
           >
             <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
             Send WhatsApp
           </button>
           <button 
             onClick={() => {
               generateReceiptPDF({
                 title: "RESTROHUB TRANSACTION",
                 invoiceNumber: invoiceId,
                 timestamp: new Date(invoice.createdAt || invoice.date).toLocaleString('en-IN'),
                 items: invoice.items || [],
                 subtotal: subtotal,
                 tax: tax,
                 total: grandTotal,
                 customerName: invoice.customerDetails?.name || 'Walk-in',
                 customerPhone: invoice.customerDetails?.phone || 'N/A',
                 paymentMethod: invoice.paymentMethod || 'Cash'
               });
               toast.success('Invoice downloaded successfully');
             }}
             className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <Download size={18} /> Download PDF
           </button>
          <button onClick={() => window.print()} className="px-6 py-3 bg-[#C5A059] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#b58c44] transition-colors flex items-center gap-2 shadow-lg shadow-[#C5A059]/30">
            <Printer size={18} /> Print to Printer
          </button>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto my-8 shadow-2xl rounded-2xl overflow-hidden bg-white print:shadow-none print:my-0 print:rounded-none print:w-full print:min-h-0 print:h-full print:scale-[0.95] print:origin-top">
        
        {/* Golden Header */}
        <div className="bg-[#C5A059] text-white px-10 py-12 print:px-6 print:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 print:gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-inner print:w-12 print:h-12">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 print:w-6 print:h-6 text-white"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="19" r="1"/></svg>
            </div>
            <div>
              <h1 className="text-2xl print:text-xl font-black tracking-wide uppercase">RESTROHUB</h1>
              <p className="text-[10px] print:text-[8px] font-bold tracking-[0.2em] text-orange-100 uppercase mt-1">Premium Dining Solutions</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] print:text-[8px] font-bold uppercase tracking-[0.2em] text-orange-200 mb-1">
              Tax Invoice {invoice.source === 'Online' && '• ONLINE ORDER'}
            </p>
            <h2 className="text-2xl print:text-xl font-black tracking-wider">INV/2026/{invoiceId}</h2>
            <p className="text-[10px] print:text-[8px] font-bold tracking-[0.2em] text-orange-100 uppercase mt-2">Dated: {dateFormatted}</p>
          </div>
        </div>

        <div className="p-10 print:p-6 print:pt-4">
          {/* Customer & Provider Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-4">
            <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Customer Details</p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{invoice.customerDetails?.name || 'Walk-in Customer'}</h3>
              <div className="space-y-2 text-xs font-bold text-slate-500">
                <p className="flex items-center gap-2"><Phone size={14} className="text-[#C5A059]"/> {invoice.customerDetails?.phone || 'N/A'}</p>
                <p className="flex items-start gap-2"><MapPin size={14} className="text-[#C5A059] shrink-0 mt-0.5"/> <span className="leading-tight">{invoice.customerDetails?.address || 'N/A'}</span></p>
              </div>
            </div>
            <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Provider Information</p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{businessData?.name || 'RestroHub Center'}</h3>
              <div className="space-y-2 text-xs font-bold text-slate-500">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-[#C5A059]"/> {businessData ? `${businessData.address}, ${businessData.district}, ${businessData.state}` : 'Mumbai, Maharashtra'}</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-[#C5A059]"/> {businessData?.contactPhone || 'N/A'}</p>
                <p className="flex items-center gap-2"><Mail size={14} className="text-[#C5A059]"/> {businessData?.contactEmail || 'support@restrohub.com'}</p>
              </div>
            </div>
          </div>

          {/* Items Table Card */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden mb-8 print:mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fc] text-[10px] font-bold text-slate-400 uppercase tracking-widest print:text-[8px]">
                <tr>
                  <th className="px-6 py-4 print:py-2">Service Description</th>
                  <th className="px-6 py-4 print:py-2 text-center">Qty</th>
                  <th className="px-6 py-4 print:py-2 text-right">Rate</th>
                  <th className="px-6 py-4 print:py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoice.items && invoice.items.length > 0 ? invoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-5 print:py-2">
                      <p className="font-bold text-slate-900 uppercase print:text-xs">{item.name}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 print:text-[7px]">HSN: 9987 - FOOD & BEVERAGE</p>
                    </td>
                    <td className="px-6 py-5 print:py-2 text-center font-bold text-slate-700 print:text-xs">{(item.quantity || 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-5 print:py-2 text-right font-bold text-slate-700 print:text-xs">₹{(item.price || (item.price * item.quantity)).toFixed(2)}</td>
                    <td className="px-6 py-5 print:py-2 text-right font-black text-slate-900 print:text-xs">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-6 py-5 print:py-2">
                      <p className="font-bold text-slate-900 uppercase print:text-xs">Historical Order Data</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 print:text-[7px]">HSN: 9987 - FOOD & BEVERAGE</p>
                    </td>
                    <td className="px-6 py-5 print:py-2 text-center font-bold text-slate-700 print:text-xs">01</td>
                    <td className="px-6 py-5 print:py-2 text-right font-bold text-slate-700 print:text-xs">₹{subtotal.toFixed(2)}</td>
                    <td className="px-6 py-5 print:py-2 text-right font-black text-slate-900 print:text-xs">₹{subtotal.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end print:gap-4 print:break-inside-avoid">
            <div className="space-y-4 print:space-y-2">
              <div className="bg-[#f8f9fc] rounded-2xl p-5 border border-slate-100 print:p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2 print:text-[8px] print:mb-1 print:pb-1">Payment Method</p>
                <div className="flex items-center gap-2 mt-3 print:mt-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm print:w-2 print:h-2"></div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider print:text-[10px]">{invoice.paymentMethod || 'CASH'}</span>
                </div>
              </div>
              
              <div className="bg-[#f8f9fc] rounded-2xl p-5 border border-slate-100 print:p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2 print:text-[8px] print:mb-1 print:pb-1">Amount In Words</p>
                <p className="text-[11px] mt-3 font-black italic text-slate-900 uppercase tracking-wider print:mt-1 print:text-[9px]">{toWords(grandTotal)}</p>
              </div>

              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2 print:pt-1 print:text-[7px]">
                <ShieldCheck size={14} className="text-emerald-500 print:w-3 print:h-3" />
                <span>E-Invoice Verified • No Signature Required</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[24px] p-8 shadow-2xl print:bg-none print:!bg-white print:text-slate-900 print:border print:border-slate-200 print:shadow-none print:p-5 print:rounded-2xl">
              <div className="space-y-5 text-sm font-semibold text-slate-300 print:space-y-3 print:text-slate-600 print:text-xs">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-widest text-[11px] font-bold text-slate-400 print:text-slate-500 print:text-[9px]">Subtotal (Net)</span>
                  <span className="font-bold print:text-slate-900 text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#fbbf24] print:text-slate-900">
                  <span className="uppercase tracking-widest text-[11px] font-bold text-[#C5A059] print:text-slate-500 print:text-[9px]">GST Total (5%)</span>
                  <span className="font-bold text-white print:text-slate-900">₹{tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center print:pt-3 print:mt-3 print:border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 print:text-[9px]">Grand Total</span>
                <span className="text-4xl font-black tracking-tight text-white print:text-slate-900 print:text-2xl">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
