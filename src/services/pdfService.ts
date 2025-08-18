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
      
      // Apply optimized styles for PDF generation
      clonedElement.style.cssText = `
        background: white !important;
        color: black !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 15px !important;
        font-size: 11px !important;
        line-height: 1.3 !important;
        font-family: Arial, sans-serif !important;
        max-width: 100% !important;
        width: 100% !important;
        position: absolute !important;
        left: -9999px !important;
        top: 0 !important;
        overflow: visible !important;
      `;

      // Hide the clone and add it to the document
      document.body.appendChild(clonedElement);

      // Apply comprehensive print styles to the cloned element
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .pdf-content * {
          font-size: 11px !important;
          line-height: 1.3 !important;
          font-family: Arial, sans-serif !important;
          color: black !important;
        }
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4, .pdf-content h5, .pdf-content h6 {
          font-weight: bold !important;
          margin-top: 12px !important;
          margin-bottom: 8px !important;
          color: black !important;
        }
        .pdf-content h1 { font-size: 18px !important; }
        .pdf-content h2 { font-size: 16px !important; }
        .pdf-content h3 { font-size: 14px !important; }
        .pdf-content h4 { font-size: 12px !important; }
        .pdf-content h5 { font-size: 11px !important; }
        .pdf-content h6 { font-size: 10px !important; }
        .pdf-content p { 
          margin-bottom: 8px !important; 
          font-size: 11px !important;
          line-height: 1.3 !important;
          color: black !important;
        }
        .pdf-content .profile-header { 
          padding: 15px !important; 
          margin-bottom: 15px !important;
          background: white !important;
        }
        .pdf-content .contact-info { 
          font-size: 10px !important; 
          margin-bottom: 12px !important;
        }
        .pdf-content .work-experience-item, .pdf-content .education-item, 
        .pdf-content .membership-item, .pdf-content .certification-item, 
        .pdf-content .reference-item {
          margin-bottom: 12px !important;
          padding: 12px !important;
          background: #f9f9f9 !important;
          border-left: 3px solid #333 !important;
        }
        .pdf-content .work-experience-item h4, .pdf-content .education-item h4,
        .pdf-content .membership-item h4, .pdf-content .certification-item h4,
        .pdf-content .reference-item h4,
        .pdf-content .work-experience-item p {
          font-size: 12px !important;
          margin-bottom: 6px !important;
          color: black !important;
          font-weight: bold !important;
        }
        .pdf-content .skill-badge {
          font-size: 9px !important;
          padding: 3px 6px !important;
          background: #e5e5e5 !important;
          color: black !important;
          border-radius: 3px !important;
          display: inline-block !important;
          margin: 1px !important;
        }
        .pdf-content .content-section {
          font-size: 11px !important;
          padding: 12px !important;
          margin: 12px 0 !important;
          background: #f9f9f9 !important;
        }
        .pdf-content .no-print { display: none !important; }
        .pdf-content img {
          max-width: 100% !important;
          height: auto !important;
        }
        .pdf-content table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        .pdf-content td, .pdf-content th {
          padding: 6px !important;
          border: 1px solid #ddd !important;
          font-size: 11px !important;
        }
        .pdf-content span {
          color: black !important;
        }
        .pdf-content .bg-gray-50 {
          background: #f9f9f9 !important;
        }
        .pdf-content .text-gray-900 {
          color: black !important;
        }
        .pdf-content .text-gray-700 {
          color: #333 !important;
        }
        .pdf-content .text-gray-600 {
          color: #555 !important;
        }
        .pdf-content .text-sm {
          font-size: 10px !important;
        }
        .pdf-content .text-base {
          font-size: 11px !important;
        }
        .pdf-content .text-lg {
          font-size: 12px !important;
        }
        .pdf-content .text-xl {
          font-size: 14px !important;
        }
        .pdf-content .text-2xl {
          font-size: 16px !important;
        }
        .pdf-content .text-3xl {
          font-size: 18px !important;
        }
        .pdf-content .text-4xl {
          font-size: 20px !important;
        }
        .pdf-content .profile-header-regular {
          background: white !important;
          padding: 15px !important;
        }
        .pdf-content .profile-header-regular img {
          width: 60px !important;
          height: 60px !important;
        }
        .pdf-content .profile-header-regular h2 {
          font-size: 16px !important;
          margin-bottom: 8px !important;
        }
        .pdf-content .profile-header-regular .contact-info {
          font-size: 9px !important;
        }
        .pdf-content .profile-header-regular .contact-info span {
          font-size: 9px !important;
        }
        .pdf-content .mb-6, .pdf-content .mb-8 {
          margin-bottom: 12px !important;
        }
        .pdf-content .p-4, .pdf-content .p-6, .pdf-content .p-8 {
          padding: 12px !important;
        }
        .pdf-content .gap-2, .pdf-content .gap-3, .pdf-content .gap-4 {
          gap: 6px !important;
        }
        .pdf-content .space-y-4 {
          margin-top: 12px !important;
        }
        .pdf-content .space-y-4 > * + * {
          margin-top: 12px !important;
        }
      `;
      document.head.appendChild(styleElement);

      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF with optimized settings
      const canvas = await html2canvas(clonedElement, {
        scale: 1.2, // Reduced scale to fit more content
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (img.src) {
              img.crossOrigin = 'anonymous';
            }
          });
        }
      });

      // Convert canvas to image with high quality
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Calculate PDF dimensions
      const pdf = new jsPDF(orientation, 'mm', format);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit PDF properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const margin = 8; // Reduced margin for more content space
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling to fit content properly
      const widthRatio = maxWidth / imgWidth;
      const heightRatio = maxHeight / imgHeight;
      
      // Use the smaller ratio to ensure content fits within page bounds
      const ratio = Math.min(widthRatio, heightRatio);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Center the image on the page
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = margin;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);

      // Download PDF
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