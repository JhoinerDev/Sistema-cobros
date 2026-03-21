import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación funcional para evitar errores en Vite

export const imprimirPlanillaRecaudacion = (datos = []) => {
  const doc = new jsPDF('landscape');
  const fechaHoy = new Date().toLocaleDateString('es-VE');

  // --- 1. ENCABEZADO ESTILO "BOX" (Basado en tu imagen de WPS) ---
  doc.setLineWidth(0.5);
  
  // Recuadro del Logo
  doc.rect(14, 10, 40, 20); 
  doc.setFontSize(8);
  doc.text("LOGO", 25, 22);

  // Recuadro Central (Nombre y RIF)
  doc.rect(54, 10, 180, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Mercado Asovemerpo Guaicaipuro", 144, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text("rif: J-50117424-0", 144, 25, { align: "center" }); // Usando el RIF de la imagen
  doc.text("Datos de Recaudación", 144, 29, { align: "center" });

  // Recuadro de Fecha y Tasa
  doc.rect(234, 10, 50, 20);
  doc.setFontSize(9);
  doc.text(`Fecha: ${fechaHoy}`, 236, 17);
  doc.text(`Tasa del día: 36.50 Bs`, 236, 25);

  // --- 2. PREPARACIÓN DE FILAS ---
  // Mapeamos los datos de Firebase al formato de la tabla
  const filas = datos.length > 0 
    ? datos.map(emp => [
        emp.nombre || '',
        emp.cedula || '',
        emp.cargo || '', // Tomado como "Puesto"
        '', // Depósito (Vacío para llenar a mano)
        '', // Efectivo
        '', // Punto
        '', // Divisa
        '', // Firma
        emp.estado || '' // Observación
      ])
    : Array(12).fill(['', '', '', '', '', '', '', '', '']); // 12 filas vacías si no hay datos

  // --- 3. GENERACIÓN DE LA TABLA (Con doble encabezado) ---
  autoTable(doc, {
    startY: 35,
    theme: 'grid',
    head: [
      // Primera fila de encabezado: Títulos agrupados
      [
        { content: 'Información General', colSpan: 3, styles: { halign: 'center', fillColor: [230, 230, 230] } },
        { content: 'Método de Pago', colSpan: 4, styles: { halign: 'center', fillColor: [230, 230, 230] } },
        { content: '', colSpan: 2 }
      ],
      // Segunda fila: Nombres de columnas reales
      ['Nombre y Apellido', 'Cédula', 'Puesto', 'Depósito', 'Efectivo', 'Punto', 'Divisa', 'Firma', 'Observación']
    ],
    body: filas,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      minCellHeight: 12, // Altura para que la firma quepa bien
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Nombre más ancho
      1: { cellWidth: 25 }, // Cédula
      7: { cellWidth: 35 }, // Firma con espacio
    }
  });

  // --- 4. CIERRE Y DESCARGA ---
  doc.save(`Planilla_Recaudacion_${fechaHoy}.pdf`);
};