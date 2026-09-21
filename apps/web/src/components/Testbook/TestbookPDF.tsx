import React from 'react';
import { CheckCircle2, Info, AlertTriangle, Lightbulb, FileWarning } from 'lucide-react';

interface TestbookSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface TestbookPDFProps {
  pdfRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  version: string;
  sections: TestbookSection[];
}

const PDFPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pdf-page w-[210mm] min-h-[297mm] bg-white text-[#111827] p-[20mm] box-border relative flex flex-col mb-8 print:m-0 print:shadow-none shadow-xl border border-gray-100">
    {children}
  </div>
);

export const TestbookPDF: React.FC<TestbookPDFProps> = ({
  pdfRef,
  title,
  version,
  sections,
}) => {
  return (
    <div 
      ref={pdfRef} 
      style={{ 
        position: 'fixed', 
        left: '-10000px', 
        top: '0',
        width: '210mm',
        zIndex: -1000,
        pointerEvents: 'none'
      }}
    >
      <style>
        {`
          .pdf-page * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pdf-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 10px 0;
          }
          .pdf-content h3 {
            font-size: 18px;
            font-weight: 800;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #000;
          }
          .pdf-content p {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          .pdf-content ul, .pdf-content ol {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          .pdf-content li {
            margin-bottom: 5px;
          }
        `}
      </style>
      {/* Cover Page */}
      <PDFPage>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-32 h-32 bg-black rounded-3xl flex items-center justify-center mb-10">
             <img src="/testbooks/Testbook.png" alt="Logo" className="w-20 h-20 invert" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-black mb-4 uppercase italic">
            TESTBOOK
          </h1>
          <h2 className="text-4xl font-black text-gray-800 mb-8 uppercase tracking-tight">
            {title}
          </h2>
          <div className="w-20 h-2 bg-black mb-8" />
          <p className="text-xl font-bold text-gray-500 uppercase tracking-[0.3em]">
             {version}
          </p>
        </div>
        <div className="mt-auto pt-10 border-t-4 border-black flex justify-between items-end">
          <div className="text-sm font-black uppercase tracking-widest leading-tight">
            Hexing <br /> {new Date().toLocaleDateString('pt-BR')}
          </div>
          <div className="text-6xl font-black italic text-black opacity-10">
             {new Date().getFullYear()}
          </div>
        </div>
      </PDFPage>

      {/* Table of Contents */}
      <PDFPage>
        <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-4">
          Sumário
        </h2>
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={section.id} className="flex items-center gap-4">
              <span className="text-lg font-black text-black w-8">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-lg font-bold text-gray-700 uppercase tracking-tight">
                {section.title}
              </span>
              <div className="flex-1 border-b-2 border-dotted border-gray-300 mx-2" />
            </div>
          ))}
        </div>
      </PDFPage>

      {/* Content Pages */}
      {sections.map((section) => (
        <PDFPage key={section.id}>
          <div className="flex items-center gap-4 border-b-4 border-black pb-4 mb-8">
            <h2 className="text-2xl font-black uppercase italic leading-none text-black">
              {section.title}
            </h2>
          </div>
          <div className="pdf-content text-sm leading-relaxed text-gray-800 space-y-6">
            {/* 
               We render the section content directly. 
               Note: Some styles might need adjustment for the PDF capture.
            */}
            <div className="testbook-pdf-inner">
              {section.content}
            </div>
          </div>
        </PDFPage>
      ))}
    </div>
  );
};
