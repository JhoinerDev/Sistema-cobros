import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera el PDF especializado para la Nómina de Empleados
 * @param {Array} empleados - Listado de empleados con su sueldo y cargo
 */
export const imprimirPlanillaNomina = (empleados = []) => {
  const doc = new jsPDF('landscape');
  // Fecha y hora exacta de descarga como solicitaste
  const ahora = new Date();
  const fechaHoy = ahora.toLocaleDateString('es-VE');
  const horaDescarga = ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  // --- 1. ENCABEZADO INSTITUCIONAL ---
  doc.setLineWidth(0.5);
  doc.rect(14, 10, 40, 20); // Recuadro para Logo (opcional)
  doc.rect(54, 10, 180, 20); // Título central
  doc.rect(234, 10, 50, 20); // Datos de fecha

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Mercado Asovemerpo Guaicaipuro", 144, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text("RIF: J-50117424-0", 144, 25, { align: "center" });
  doc.text("CONTROL DE NÓMINA Y PAGOS", 144, 29, { align: "center" });

  doc.setFontSize(8);
  doc.text(`Fecha Emisión: ${fechaHoy}`, 236, 17);
  doc.text(`Hora: ${horaDescarga}`, 236, 22);

  // --- 2. PREPARACIÓN DE DATOS (Columnas Relevantes) ---
  const filas = empleados.map((emp, index) => {
    const salarioBase = Number(emp.salario) || 0;
    return [
      (index + 1).toString(),
      emp.nombre,
      `V-${emp.cedula}`,
      emp.cargo,
      `$${salarioBase.toLocaleString('es-VE')}`, // Sueldo Base
      "", // Espacio para Asignaciones (Bono)
      "", // Espacio para Deducciones (Faltas)
      `$${salarioBase.toLocaleString('es-VE')}`, // Total Neto
      emp.estado === 'Pagado' ? 'TRANSFERIDO' : '________________' // Firma o Ref
    ];
  });

  // --- 3. GENERACIÓN DE LA TABLA DE NÓMINA ---
  autoTable(doc, {
    startY: 35,
    theme: 'grid',
    head: [
      ['N°', 'Nombre del Empleado', 'Cédula', 'Cargo / Función', 'Sueldo Base', 'Asignaciones', 'Deducciones', 'Total Neto', 'Firma de Recibido'],
    ],
    body: filas,
    styles: { fontSize: 8, cellPadding: 3, minCellHeight: 15, valign: 'middle' },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    columnStyles: { 
      0: { cellWidth: 10, halign: 'center' },
      4: { halign: 'right' }, // Sueldo
      7: { halign: 'right', fontStyle: 'bold' }, // Total
      8: { cellWidth: 40, halign: 'center' }  // Firma
    }
  });

  // --- 4. RESUMEN DE GASTOS ---
  const nominaTotal = empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const finalY = doc.lastAutoTable.finalY + 12;

  if (finalY < doc.internal.pageSize.height - 30) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE EGRESOS POR NÓMINA", 14, finalY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Personal: ${empleados.length}`, 14, finalY + 8);
    doc.text(`Monto Total a Desembolsar: $${nominaTotal.toLocaleString('es-VE')}`, 80, finalY + 8);
    
    // Firmas de validación
    doc.line(180, finalY + 15, 230, finalY + 15);
    doc.text("Revisado (RRHH)", 188, finalY + 20);

    doc.line(240, finalY + 15, 285, finalY + 15);
    doc.text("Autorizado (Administración)", 242, finalY + 20);
  }

  // --- 5. DESCARGA ---
  doc.save(`Nomina_${fechaHoy.replace(/\//g, '-')}_${ahora.getHours()}h.pdf`);
};