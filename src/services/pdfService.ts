import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

export class PDFService {
  /**
   * Generate PDF from HTML element
   */
  static async generatePDFFromElement(
    element: HTMLElement,
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = 'career-profile.pdf',
      format = 'a4',
      orientation = 'portrait',
      quality = 1
    } = options;

    try {
      // Create canvas from HTML element with proper scaling for print
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 0
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png', quality);

      // Calculate PDF dimensions
      const pdf = new jsPDF(orientation, 'mm', format);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit PDF with proper scaling
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Use fixed margins and calculate scaling to fit content properly
      const margin = 10; // 10mm margin on all sides
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling ratio to fit content within page bounds
      const widthRatio = maxWidth / imgWidth;
      const heightRatio = maxHeight / imgHeight;
      
      // Use the smaller ratio to ensure content fits within page bounds
      const ratio = Math.min(widthRatio, heightRatio);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Center the image on the page
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = margin; // 10mm from top

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);

      // Download PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generate PDF from multiple elements (for pagination)
   */
  static async generateMultiPagePDF(
    elements: HTMLElement[],
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = 'career-profile.pdf',
      format = 'a4',
      orientation = 'portrait',
      quality = 1
    } = options;

    try {
      const pdf = new jsPDF(orientation, 'mm', format);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < elements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(elements[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: elements[i].scrollWidth,
          height: elements[i].scrollHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          imageTimeout: 0
        });

        const imgData = canvas.toDataURL('image/png', quality);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const margin = 10;
        const maxWidth = pdfWidth - (margin * 2);
        const maxHeight = pdfHeight - (margin * 2);
        
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        const imgX = (pdfWidth - finalWidth) / 2;
        const imgY = margin;

        pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating multi-page PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generate PDF from URL (for server-side rendering)
   */
  static async generatePDFFromURL(
    url: string,
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = 'career-profile.pdf',
      format = 'a4',
      orientation = 'portrait',
      quality = 1
    } = options;

    try {
      // This would require server-side implementation
      // For now, we'll use the element-based approach
      throw new Error('URL-based PDF generation not implemented');
    } catch (error) {
      console.error('Error generating PDF from URL:', error);
      throw new Error('Failed to generate PDF from URL');
    }
  }

  /**
   * Generate PDF with custom styling for career profile
   */
  static async generateCareerProfilePDF(
    element: HTMLElement,
    profileName: string,
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = `${profileName.replace(/\s+/g, '-').toLowerCase()}-career-profile.pdf`,
      format = 'a4',
      orientation = 'portrait',
      quality = 1
    } = options;

    try {
      // Create a clone of the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Fix the cloned element width to A4 printable width in CSS pixels for stable layout
      // A4 width with 20mm total margin (10mm each side) ≈ 190mm => ~718px at 96dpi
      const targetWidthPx = 718;

      // Apply optimized styles for PDF generation
      clonedElement.style.cssText = `
        background: white !important;
        color: black !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 12px !important;
        line-height: 1.45 !important;
        font-family: Arial, sans-serif !important;
        width: ${targetWidthPx}px !important;
        max-width: ${targetWidthPx}px !important;
        position: absolute !important;
        left: -9999px !important;
        top: 0 !important;
        overflow: visible !important;
      `;

      // Hide the clone and add it to the document
      document.body.appendChild(clonedElement);

      // Apply print styles to ensure readable typography
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .pdf-content * { font-size: 12px !important; line-height: 1.45 !important; font-family: Arial, sans-serif !important; color: black !important; }
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4, .pdf-content h5, .pdf-content h6 { font-weight: 700 !important; color: black !important; margin: 10px 0 8px 0 !important; }
        .pdf-content h1 { font-size: 16px !important; }
        .pdf-content h2 { font-size: 15px !important; }
        .pdf-content h3 { font-size: 14px !important; }
        .pdf-content h4 { font-size: 13px !important; }
        .pdf-content p, .pdf-content li, .pdf-content span { font-size: 12px !important; }
        .pdf-content .no-print { display: none !important; }
        .pdf-content img { max-width: 100% !important; height: auto !important; }
      `;
      document.head.appendChild(styleElement);

      // Wait for styles and fonts
      if ((document as any).fonts && (document as any).fonts.ready) {
        try { await (document as any).fonts.ready; } catch {}
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      // Render to canvas at high scale for clarity
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000
      });

      // Initialize PDF
      const pdf = new jsPDF(orientation, 'mm', format);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginMm = 10; // 10mm margins
      const maxWidthMm = pdfWidth - marginMm * 2;

      // Determine scale ratio to fit width exactly
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const ratio = maxWidthMm / imgWidthPx; // mm per pixel along width

      // Compute per-page drawable height in pixels
      const pageDrawableHeightMm = pdfHeight - marginMm * 2;
      const pageDrawableHeightPx = pageDrawableHeightMm / ratio;

      // Slice the canvas into page-height chunks and add each as a page
      let renderedHeightPx = 0;
      let isFirstPage = true;
      while (renderedHeightPx < imgHeightPx) {
        const sliceHeightPx = Math.min(pageDrawableHeightPx, imgHeightPx - renderedHeightPx);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.max(1, Math.floor(sliceHeightPx));
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            renderedHeightPx,
            imgWidthPx,
            sliceHeightPx,
            0,
            0,
            imgWidthPx,
            sliceHeightPx
          );
        }

        const imgData = pageCanvas.toDataURL('image/png', 1.0);
        const sliceHeightMm = sliceHeightPx * ratio;

        if (!isFirstPage) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', marginMm, marginMm, maxWidthMm, sliceHeightMm);

        isFirstPage = false;
        renderedHeightPx += sliceHeightPx;
      }

      // Save PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(clonedElement);
      document.head.removeChild(styleElement);
    } catch (error) {
      console.error('Error generating career profile PDF:', error);
      throw new Error('Failed to generate career profile PDF');
    }
  }
}

export default PDFService; 