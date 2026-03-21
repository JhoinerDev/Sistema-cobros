import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarComprobantePDF = (pago) => {
  const doc = new jsPDF();
  const fechaFormateada = pago.fecha?.toDate 
    ? pago.fecha.toDate().toLocaleDateString() 
    : new Date().toLocaleDateString();

  // --- DISEÑO DEL ENCABEZADO ---
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Color Slate-800
  doc.text("COMPROBANTE DE RECAUDACIÓN", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`ID Transacción: ${pago.id}`, 105, 28, { align: 'center' });
  doc.line(20, 35, 190, 35); // Línea divisoria

  // --- DETALLES DEL PAGO ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Contribuyente: ${pago.contribuyente}`, 20, 50);
  doc.text(`Concepto: ${pago.tipo || 'Impuesto Municipal'}`, 20, 60);
  doc.text(`Fecha de Pago: ${fechaFormateada}`, 20, 70);
  
  doc.setFontSize(14);
  doc.text(`MONTO TOTAL: $${pago.monto?.toLocaleString()}`, 20, 85);

  // --- SECCIÓN DE FIRMA ---
  doc.setFontSize(10);
  doc.text("__________________________", 150, 120, { align: 'center' });
  doc.text("Firma del Contribuyente", 150, 125, { align: 'center' });

  if (pago.firmaBase64) {
    // Insertamos la firma (x, y, ancho, alto)
    doc.addImage(pago.firmaBase64, 'PNG', 130, 100, 40, 20);
  }

  // --- PIE DE PÁGINA ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Este documento es un comprobante oficial digital.", 105, 280, { align: 'center' });

  // Descargar el archivo
  doc.save(`Recibo_${pago.contribuyente}_${Date.now()}.pdf`);
};