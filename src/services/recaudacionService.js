import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

export const imprimirPlanillaRecaudacion = (datos = []) => {
  const doc = new jsPDF('landscape');
  const fechaHoy = new Date().toLocaleDateString('es-VE');

  // --- 1. ENCABEZADO ESTILO "BOX" (Adaptado a Data de Cobro) ---
  doc.setLineWidth(0.5);
  doc.rect(14, 10, 40, 20); 
  doc.rect(54, 10, 180, 20);
  doc.rect(234, 10, 50, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Mercado Asovemerpo Guaicaipuro", 144, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text("RIF: J-50117424-0", 144, 25, { align: "center" });
  // Título actualizado al formato original
  doc.text("DATA DE COBRO DIARIA", 144, 29, { align: "center" });

  doc.setFontSize(9);
  doc.text(`Fecha: ${fechaHoy}`, 236, 17);
  doc.text(`Tasa del día: 36.50 Bs`, 236, 25);

  // --- 2. LÓGICA HÍBRIDA (Intacta, solo se agregó el N° de fila) ---
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
          (index + 1).toString(), // NUEVO: Numeración de la lista
          nombre,
          identificacion,
          lugar,
          '', // Depósito
          item.metodo === 'Efectivo' ? `$${item.monto}` : '',
          item.metodo === 'Punto' ? `$${item.monto}` : '',
          item.metodo === 'Divisa' ? `$${item.monto}` : '',
          '', // ¡OJO AQUÍ! Espacio para la firma (Ahora es el índice 8)
          observacion
        ];
      })
    : Array(15).fill(['', '', '', '', '', '', '', '', '', '']); // Ajustado a 10 columnas

  // --- 3. GENERACIÓN DE LA TABLA ---
  autoTable(doc, {
    startY: 35,
    theme: 'grid',
    head: [
      [
        { content: '', colSpan: 1 }, // Espacio vacío arriba del N°
        { content: 'Información General', colSpan: 3, styles: { halign: 'center', fillColor: [230, 230, 230] } },
        { content: 'Desglose de Pago', colSpan: 4, styles: { halign: 'center', fillColor: [230, 230, 230] } },
        { content: '', colSpan: 2 } // Espacio sobre Firma y Observación
      ],
      ['N°', 'Nombre / Contribuyente', 'Cédula', 'Puesto', 'Depósito', 'Efectivo', 'Punto', 'Divisa', 'Firma', 'Observación']
    ],
    body: filas,
    styles: { 
      fontSize: 8, 
      cellPadding: 2, 
      minCellHeight: 18, 
      valign: 'middle' 
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: { 
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' }, // N°
      1: { cellWidth: 42 }, // Nombre
      2: { cellWidth: 22 }, // Cédula
      3: { cellWidth: 15 }, // Puesto
      8: { cellWidth: 35 }  // Firma (Actualizado)
    },
    
    // --- LÓGICA MÁGICA PARA DIBUJAR LA FIRMA (Intacta y reubicada) ---
    didDrawCell: (data) => {
      // ATENCIÓN: Ahora verificamos el índice 8 porque agregamos la columna 'N°'
      if (data.column.index === 8 && data.cell.section === 'body') {
        const itemOriginal = datos[data.row.index]; 
        
        if (itemOriginal && itemOriginal.firmaBase64) {
          try {
            const imgData = itemOriginal.firmaBase64;
            const padding = 2; 
            
            const imgWidth = data.cell.width - (padding * 2);
            const imgHeight = data.cell.height - (padding * 2);
            
            doc.addImage(imgData, 'PNG', data.cell.x + padding, data.cell.y + padding, imgWidth, imgHeight);
          } catch (error) {
            console.error("Error al dibujar la firma en PDF:", error);
          }
        }
      }
    }
  });

  // --- 4. ZONA DE TOTALES (NUEVO: Al estilo del formato original) ---
  const finalY = doc.lastAutoTable.finalY + 10; // Posición justo debajo de la tabla
  
  if (finalY < doc.internal.pageSize.height - 20) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE RECAUDACIÓN", 14, finalY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Locales Asistentes: _______`, 14, finalY + 8);
    doc.text(`Total Locales Inasistentes: _______`, 80, finalY + 8);
    doc.text(`Total Pagos Recibidos: ${datos.length}`, 160, finalY + 8);
    
    // Espacio para la firma del recaudador del día
    doc.text("___________________________________", 210, finalY + 18);
    doc.text("Firma del Recaudador", 225, finalY + 23);
  }

  // --- 5. DESCARGA ---
  doc.save(`Data_Cobro_Mercado_${fechaHoy.replace(/\//g, '-')}.pdf`);
};