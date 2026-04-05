import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// Añadimos tasaApp como parámetro para que sea dinámica desde Firebase
export const imprimirPlanillaRecaudacion = (datos = [], tasaApp = 0) => {
  const doc = new jsPDF('landscape');
  const fechaHoy = new Date().toLocaleDateString('es-VE');
  const hora = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  // --- 1. ENCABEZADO ESTILO "BOX" (Compacto para ganar espacio vertical) ---
  doc.setLineWidth(0.5);
  doc.rect(14, 8, 40, 16); // Bajamos un poco la altura de 20 a 16
  doc.rect(54, 8, 180, 16);
  doc.rect(234, 8, 50, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Mercado Asovemerpo Guaicaipuro", 144, 13, { align: "center" });
  doc.setFontSize(9);
  doc.text("RIF: J-50117424-0", 144, 18, { align: "center" });
  doc.text("DATA DE COBRO DIARIA", 144, 22, { align: "center" });

  doc.setFontSize(8);
  doc.text(`Fecha: ${fechaHoy}`, 236, 12);
  // CONEXIÓN CON FIREBASE: Aquí se usa el parámetro tasaApp
  doc.text(`Tasa del día: ${Number(tasaApp).toFixed(2)} Bs`, 236, 17);
  doc.text(`Hora: ${hora}`, 236, 21);

  // --- 2. LÓGICA HÍBRIDA (Intacta) ---
  const filas = datos.length > 0 
    ? datos.map((item, index) => {
        const nombre = item.contribuyente || item.nombre || '';
        const identificacion = item.cedula || '';
        const lugar = item.puesto || item.cargo || '';
        
        let observacion = item.estado || '';
        if (item.fecha && typeof item.fecha.toDate === 'function') {
           observacion = item.fecha.toDate().toLocaleDateString();
        }

        return [
          (index + 1).toString(), 
          nombre,
          identificacion,
          lugar,
          '', 
          item.metodo === 'Efectivo' ? `$${item.monto}` : '',
          item.metodo === 'Punto' ? `$${item.monto}` : '',
          item.metodo === 'Divisa' ? `$${item.monto}` : '',
          '', 
          observacion
        ];
      })
    : Array(15).fill(['', '', '', '', '', '', '', '', '', '']);

  // --- 3. GENERACIÓN DE LA TABLA (Ajuste de altura para >15 filas) ---
  autoTable(doc, {
    startY: 28, // Subimos la tabla para aprovechar el espacio superior
    theme: 'grid',
    head: [
      [
        { content: '', colSpan: 1 },
        { content: 'Información General', colSpan: 3, styles: { halign: 'center', fillColor: [230, 230, 230], fontSize: 7 } },
        { content: 'Desglose de Pago', colSpan: 4, styles: { halign: 'center', fillColor: [230, 230, 230], fontSize: 7 } },
        { content: '', colSpan: 2 }
      ],
      ['N°', 'Nombre / Contribuyente', 'Cédula', 'Puesto', 'Depósito', 'Efectivo', 'Punto', 'Divisa', 'Firma', 'Observación']
    ],
    body: filas,
    styles: { 
      fontSize: 7,        // Fuente reducida para compactar
      cellPadding: 1,     // Margen interno mínimo para que no crezca el alto
      minCellHeight: 6,   // REDUCIDO: De 18 a 6. Esto permite meter 25+ personas por hoja
      valign: 'middle' 
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
    columnStyles: { 
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 42 },
      2: { cellWidth: 20 },
      3: { cellWidth: 12 },
      8: { cellWidth: 30 } 
    },
    
    didDrawCell: (data) => {
      if (data.column.index === 8 && data.cell.section === 'body') {
        const itemOriginal = datos[data.row.index]; 
        if (itemOriginal && itemOriginal.firmaBase64) {
          try {
            const imgData = itemOriginal.firmaBase64;
            const padding = 1; 
            doc.addImage(imgData, 'PNG', data.cell.x + padding, data.cell.y + padding, data.cell.width - (padding * 2), data.cell.height - (padding * 2));
          } catch (error) {
            console.error("Error al dibujar la firma:", error);
          }
        }
      }
    }
  });

  // --- 4. ZONA DE TOTALES ---
  const finalY = doc.lastAutoTable.finalY + 6;
  
  if (finalY < doc.internal.pageSize.height - 20) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE RECAUDACIÓN", 14, finalY);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Locales Asistentes: _______`, 14, finalY + 5);
    doc.text(`Total Locales Inasistentes: _______`, 70, finalY + 5);
    doc.text(`Total Pagos Recibidos: ${datos.length}`, 130, finalY + 5);
    
    doc.line(210, finalY + 12, 260, finalY + 12);
    doc.text("Firma del Recaudador", 220, finalY + 16);
  }

  doc.save(`Data_Cobro_Mercado_${fechaHoy.replace(/\//g, '-')}.pdf`);
};