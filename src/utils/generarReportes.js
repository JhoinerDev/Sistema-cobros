import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarComprobantePDF = (pago) => {
  const doc = new jsPDF();
  const fechaFormateada = pago.fecha?.toDate 
    ? pago.fecha.toDate().toLocaleDateString() 
    : new Date().toLocaleDateString();

  // 1. FORZAMOS EL CAMBIO DEL CONCEPTO VIEJO
  // Si el pago dice "Impuesto Municipal" en la base de datos, lo cambiamos a la fuerza.
  let conceptoMostrar = pago.tipo || 'Cuota ordinaria';
  if (conceptoMostrar === 'Impuesto Municipal') {
    conceptoMostrar = 'Cuota ordinaria';
  }

  // --- DISEÑO DEL ENCABEZADO ---
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Color Slate-800
  // 2. CAMBIAMOS EL TÍTULO A UNO NO FISCAL
  doc.text("RECIBO DE PAGO", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`ID Transacción: ${pago.id}`, 105, 28, { align: 'center' });
  doc.line(20, 35, 190, 35); // Línea divisoria

  // --- DETALLES DEL PAGO ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  // 3. CAMBIAMOS CONTRIBUYENTE POR LOCATARIO
  doc.text(`Locatario: ${pago.contribuyente}`, 20, 50);
  doc.text(`Concepto: ${conceptoMostrar}`, 20, 60);
  doc.text(`Fecha de Pago: ${fechaFormateada}`, 20, 70);
  
  doc.setFontSize(14);
  doc.text(`MONTO TOTAL: $${pago.monto?.toLocaleString()}`, 20, 85);

  // --- SECCIÓN DE FIRMA ---
  doc.setFontSize(10);
  doc.text("__________________________", 150, 120, { align: 'center' });
  // 4. CAMBIAMOS LA FIRMA
  doc.text("Firma del Locatario", 150, 125, { align: 'center' });

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