/**
 * Utility to export the report to PDF format via window.print() or jspdf with html2canvas.
 * Since CSS is modern, rendering standard letter/A4 elements is elegant.
 * @license Apache-2.0
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPdf(elementId: string, customerName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    // Hide buttons/controls before capturing (we can add elements with a 'data-html2canvas-ignore' attribute)
    const options = {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    };

    const canvas = await html2canvas(element, options);
    const imgData = canvas.toDataURL('image/png');

    // Create standard PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // multi-page loop if content spans beyond 1 A4 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // slide to the next viewport slice
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const fileName = `Technical_Report_${customerName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
}
