import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';

export const useTestbookPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const handleExportPDF = async (title: string) => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    addToast('Gerando PDF...', 'info');

    // Small delay to ensure hidden component is rendered if needed
    setTimeout(async () => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = pdfRef.current?.querySelectorAll('.pdf-page');

        if (pages && pages.length > 0) {
          for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i] as HTMLElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 1200,
              onclone: (doc) => {
                const colorRegex = /(oklch|oklab|lab|lch|color-mix|color)\([^)]+\)/g;
                
                // 1. Fix stylesheets to remove unsupported colors
                doc.querySelectorAll('style').forEach(styleTag => {
                  styleTag.innerHTML = styleTag.innerHTML.replace(colorRegex, '#000000');
                });

                // 2. Fix inline styles
                doc.querySelectorAll('*').forEach((el: any) => {
                  if (el.hasAttribute('style')) {
                    const styleAttr = el.getAttribute('style');
                    if (styleAttr) {
                      el.setAttribute('style', styleAttr.replace(colorRegex, '#000000'));
                    }
                  }

                  // Force some base styles and remove animations
                  const testRegex = /(oklch|oklab|lab|lch|color-mix|color)\(/;
                  const style = window.getComputedStyle(el);
                  
                  if (testRegex.test(style.color) || testRegex.test(style.backgroundColor)) {
                    el.style.setProperty('color', '#000000', 'important');
                    el.style.setProperty('background-color', '#ffffff', 'important');
                  }
                  
                  // Ensure content is not clipped
                  el.style.overflow = 'visible';
                  el.style.maxHeight = 'none';
                  el.style.transition = 'none';
                  el.style.transform = 'none';
                  el.style.animation = 'none';
                });

                // 3. Add our own override style tag
                const overrideStyle = doc.createElement('style');
                overrideStyle.innerHTML = `
                  .pdf-page { background-color: #ffffff !important; }
                  .pdf-content { color: #111827 !important; }
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                `;
                doc.head.appendChild(overrideStyle);
              },
            });

            if (canvas.width === 0 || canvas.height === 0) {
              console.error(`Page ${i} rendered an empty canvas.`);
              continue;
            }

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            
            // First page
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Subsequent pages if content overflows
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
              heightLeft -= pageHeight;
            }
          }
          pdf.save(`${title}.pdf`);
          addToast('Sucesso!', 'success');
        } else {
            addToast('Erro: Nenhuma página encontrada.', 'error');
        }
      } catch (e) {
        console.error('PDF Export Error:', e);
        addToast('Erro ao exportar.', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  return {
    isExporting,
    pdfRef,
    handleExportPDF,
  };
};
