import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera el PDF especializado para la Nómina de Empleados
 * @param {Array} empleados - Listado de empleados con su sueldo y cargo
 * @param {Number} tasaApp - La tasa del dólar actual en la app
 */
export const imprimirPlanillaNomina = (empleados = [], tasaApp = 0) => {
  const doc = new jsPDF('landscape');
  // Fecha y hora exacta de descarga
  const ahora = new Date();
  const fechaHoy = ahora.toLocaleDateString('es-VE');
  const horaDescarga = ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  // --- 1. ENCABEZADO INSTITUCIONAL (Más compacto) ---
  doc.setLineWidth(0.5);
  doc.rect(14, 8, 40, 16); 
  doc.rect(54, 8, 180, 16); 
  doc.rect(234, 8, 50, 16); 

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Mercado Asovemerpo Guaicaipuro", 144, 13, { align: "center" });
  doc.setFontSize(8);
  doc.text("RIF: J-50117424-0", 144, 18, { align: "center" });
  doc.text("CONTROL DE NÓMINA Y PAGOS", 144, 22, { align: "center" });

  doc.setFontSize(7);
  doc.text(`Fecha Emisión: ${fechaHoy}`, 236, 12);
  doc.text(`Tasa del día: ${Number(tasaApp).toFixed(2)} Bs`, 236, 16); // Tasa dinámica añadida
  doc.text(`Hora: ${horaDescarga}`, 236, 20);

  // --- 2. PREPARACIÓN DE DATOS ---
  const filas = empleados.map((emp, index) => {
    const salarioBase = Number(emp.salario) || 0;
    return [
      (index + 1).toString(),
      emp.nombre,
      `V-${emp.cedula}`,
      emp.cargo,
      `$${salarioBase.toLocaleString('es-VE')}`,
      "", 
      "", 
      `$${salarioBase.toLocaleString('es-VE')}`,
      emp.estado === 'Pagado' ? 'TRANSFERIDO' : '________________'
    ];
  });

  // --- 3. GENERACIÓN DE LA TABLA (Ajustes para 15+ filas por hoja) ---
  autoTable(doc, {
    startY: 28, // Subimos el inicio de la tabla
    theme: 'grid',
    head: [
      ['N°', 'Nombre del Empleado', 'Cédula', 'Cargo / Función', 'Sueldo Base', 'Asignaciones', 'Deducciones', 'Total Neto', 'Firma de Recibido'],
    ],
    body: filas,
    styles: { 
      fontSize: 7, 
      cellPadding: 1.2, // Espacio interno mínimo
      minCellHeight: 5.5, // Altura ultra-compacta para maximizar registros por hoja
      valign: 'middle' 
    },
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold', 
      halign: 'center',
      fontSize: 7 
    },
    columnStyles: { 
      0: { cellWidth: 8, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' }, 
      7: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, 
      8: { cellWidth: 35, halign: 'center' }  
    }
  });

  // --- 4. RESUMEN DE GASTOS ---
  const nominaTotal = empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const finalY = doc.lastAutoTable.finalY + 6;

  if (finalY < doc.internal.pageSize.height - 25) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE EGRESOS POR NÓMINA", 14, finalY);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Personal: ${empleados.length} | Monto Total: $${nominaTotal.toLocaleString('es-VE')}`, 14, finalY + 5);
    
    // Firmas de validación
    doc.setLineWidth(0.2);
    doc.line(190, finalY + 10, 230, finalY + 10);
    doc.text("Revisado (RRHH)", 198, finalY + 14);

    doc.line(240, finalY + 10, 280, finalY + 10);
    doc.text("Autorizado (Adm.)", 248, finalY + 14);
  }

  // --- 5. DESCARGA ---
  doc.save(`Nomina_${fechaHoy.replace(/\//g, '-')}.pdf`);
};