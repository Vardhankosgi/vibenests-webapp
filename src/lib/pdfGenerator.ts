import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateBookingInvoicePDF(booking: any, user: any, addonsList: any[] = []) {
  const doc = new jsPDF();
  
  // Invoice Header
  doc.setFontSize(22);
  doc.setTextColor(184, 151, 42); // Gold color
  doc.text('VibeNests', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Luxury Private Theaters', 14, 26);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('INVOICE', 150, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice #: ${booking.id}-INV`, 150, 26);
  doc.text(`Date: ${new Date(booking.createdAt || booking.date).toLocaleDateString()}`, 150, 32);
  doc.text(`Status: ${booking.status?.toUpperCase() || 'COMPLETED'}`, 150, 38);

  // Customer Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Billed To:', 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Name: ${user?.fullName || booking.userName || 'Guest'}`, 14, 52);
  if (user?.email || booking.userEmail) {
    doc.text(`Email: ${user?.email || booking.userEmail}`, 14, 58);
  }
  if (user?.phone || booking.userPhone) {
    doc.text(`Phone: ${user?.phone || booking.userPhone}`, 14, 64);
  }

  // Booking Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Booking Details:', 14, 75);
  doc.setFontSize(10);
  doc.setTextColor(100);
  const suiteName = booking.suite?.name || booking.suiteName || `Suite ${booking.suiteId || ''}`;
  doc.text(`Suite: ${suiteName}`, 14, 82);
  doc.text(`Date: ${new Date(booking.checkIn || booking.date).toLocaleDateString()}`, 14, 88);
  doc.text(`Time: ${booking.checkInTime || booking.timeSlot || 'N/A'}`, 14, 94);
  doc.text(`Guests: ${booking.guests || booking.guestCount || 2}`, 14, 100);

  // Items Table
  const tableData = [];
  
  // Base Suite Price
  const basePrice = parseFloat(booking.suitePrice || booking.basePrice || booking.amount || 0);
  tableData.push(['Suite Booking', '1', `Rs. ${basePrice.toFixed(2)}`, `Rs. ${basePrice.toFixed(2)}`]);

  // Addons
  let addonsTotal = 0;
  if (booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0) {
    booking.addons.forEach((addonSelection: any) => {
      const addonDef = addonsList.find(a => a.id === addonSelection.addonId || a.id === addonSelection.id) || addonSelection;
      const qty = addonSelection.quantity || 1;
      const price = parseFloat(addonDef.price || 0);
      const total = qty * price;
      addonsTotal += total;
      tableData.push([`Addon: ${addonDef.name || 'Extra Item'}`, qty.toString(), `Rs. ${price.toFixed(2)}`, `Rs. ${total.toFixed(2)}`]);
    });
  }

  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [184, 151, 42] }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  const subtotal = basePrice + addonsTotal;
  const tax = parseFloat(booking.taxAmount || 0);
  const discount = parseFloat(booking.discountAmount || 0);
  const total = parseFloat(booking.totalPrice || booking.amount || 0);

  doc.setFontSize(10);
  doc.setTextColor(0);
  
  let currentY = finalY;
  doc.text(`Subtotal:`, 140, currentY);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, 170, currentY);
  currentY += 6;

  if (discount > 0) {
    doc.setTextColor(0, 150, 0);
    doc.text(`Discount:`, 140, currentY);
    doc.text(`- Rs. ${discount.toFixed(2)}`, 170, currentY);
    doc.setTextColor(0);
    currentY += 6;
  }

  if (tax > 0) {
    doc.text(`Tax:`, 140, currentY);
    doc.text(`Rs. ${tax.toFixed(2)}`, 170, currentY);
    currentY += 6;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount:`, 140, currentY + 4);
  doc.text(`Rs. ${total.toFixed(2)}`, 170, currentY + 4);

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for choosing VibeNests!', 14, 280);
  doc.text('For support, contact support@vibenests.com', 14, 286);

  doc.save(`VibeNests_Invoice_${booking.id || 'Guest'}.pdf`);
}

export function generateTransactionInvoicePDF(transaction: any) {
  const doc = new jsPDF();
  
  // Invoice Header
  doc.setFontSize(22);
  doc.setTextColor(184, 151, 42); // Gold color
  doc.text('VibeNests', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Luxury Private Theaters', 14, 26);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('PAYMENT RECEIPT', 140, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Receipt #: ${transaction.id || transaction.invoice}`, 140, 26);
  doc.text(`Date: ${new Date(transaction.date || transaction.createdAt).toLocaleDateString()}`, 140, 32);
  doc.text(`Status: ${transaction.status?.toUpperCase() || 'COMPLETED'}`, 140, 38);

  // Transaction Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Transaction Details:', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Payment Method: ${transaction.method || transaction.paymentMethod || 'Online'}`, 14, 58);
  doc.text(`Category: ${(transaction.category || 'Booking').toUpperCase()}`, 14, 64);
  if (transaction.bookingId) {
    doc.text(`Related Booking ID: ${transaction.bookingId}`, 14, 70);
  }

  const amount = parseFloat(transaction.amount || 0);

  // Items Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Amount']],
    body: [
      [`Payment for ${transaction.category || 'Service'}`, `Rs. ${amount.toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [184, 151, 42] }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY || 105;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`Total Paid:`, 140, finalY + 10);
  doc.text(`Rs. ${amount.toFixed(2)}`, 170, finalY + 10);

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for choosing VibeNests!', 14, 280);
  doc.text('For support, contact support@vibenests.com', 14, 286);

  doc.save(`VibeNests_Receipt_${transaction.id || transaction.invoice || 'Payment'}.pdf`);
}
