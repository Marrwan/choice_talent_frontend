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
        scale: 1, // Use 1:1 scaling to avoid double-scaling issues
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
      const margin = 15; // 15mm margin on all sides for better readability
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling ratio to fit content within page bounds
      const widthRatio = maxWidth / imgWidth;
      const heightRatio = maxHeight / imgHeight;
      
      // Use the smaller ratio to ensure content fits within page bounds
      const ratio = Math.min(widthRatio, heightRatio);
      
      // No additional scaling factor - let the natural ratio determine the size
      const finalRatio = ratio;
      
      const finalWidth = imgWidth * finalRatio;
      const finalHeight = imgHeight * finalRatio;
      
      // Center the image on the page
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = margin; // 15mm from top

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
          scale: 3,
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
        
        // Use a more generous scaling to make content larger
        const maxWidth = pdfWidth - 20; // Leave 10mm margin on each side
        const maxHeight = pdfHeight - 20; // Leave 10mm margin on each side
        
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Center the image on the page
        const imgX = (pdfWidth - finalWidth) / 2;
        const imgY = 10; // 10mm from top

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
      // Add print-specific styles with proper point-based font sizes
      const originalStyle = element.style.cssText;
      element.style.cssText += `
        background: white !important;
        color: black !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 20px !important;
        font-size: 11.5pt !important;
        line-height: 1.4 !important;
        font-family: Arial, sans-serif !important;
        max-width: 100% !important;
        width: 100% !important;
      `;

      // Apply styles to child elements with proper point-based font sizes
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @media print {
          * {
            font-size: 11.5pt !important;
            line-height: 1.4 !important;
            font-family: Arial, sans-serif !important;
          }
          h1, h2, h3, h4, h5, h6 {
            font-weight: bold !important;
            margin-top: 15pt !important;
            margin-bottom: 10pt !important;
          }
          h1 { font-size: 17pt !important; }
          h2 { font-size: 13.5pt !important; }
          h3 { font-size: 13.5pt !important; }
          h4 { font-size: 12pt !important; }
          h5 { font-size: 11.5pt !important; }
          h6 { font-size: 11pt !important; }
          p { 
            margin-bottom: 10pt !important; 
            font-size: 11.5pt !important;
            line-height: 1.4 !important;
          }
          .profile-header { 
            padding: 20pt !important; 
            margin-bottom: 20pt !important;
          }
          .contact-info { 
            font-size: 10.5pt !important; 
            margin-bottom: 15pt !important;
          }
          .section { 
            margin-bottom: 20pt !important; 
            padding: 15pt !important;
          }
          .work-experience-item, .education-item {
            margin-bottom: 15pt !important;
            padding: 15pt !important;
          }
          .work-experience-item h4, .education-item h4 {
            font-size: 12pt !important;
            margin-bottom: 8pt !important;
          }
          .skill-badge {
            font-size: 10pt !important;
            padding: 3pt 6pt !important;
          }
          .content-section {
            font-size: 11.5pt !important;
            padding: 15pt !important;
            margin: 12pt 0 !important;
          }
          .no-print { display: none !important; }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          td, th {
            padding: 8pt !important;
            border: 1px solid #ddd !important;
            font-size: 11.5pt !important;
          }
        }
      `;
      document.head.appendChild(styleElement);

      // Generate PDF
      await this.generatePDFFromElement(element, {
        filename,
        format,
        orientation,
        quality
      });

      // Clean up
      document.head.removeChild(styleElement);
      element.style.cssText = originalStyle;
    } catch (error) {
      console.error('Error generating career profile PDF:', error);
      throw new Error('Failed to generate career profile PDF');
    }
  }
}

export default PDFService; 