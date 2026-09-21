import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, AlertTriangle, Info, Lightbulb, FileWarning, Menu, X, Loader2 } from "lucide-react";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLang } from "../../contexts/LangContext";
import PageTransition from "../../components/PageTransition";
import { useFavicon, useTitle } from "../../hooks/useTitle";
import { useTestbookPDF } from "../../hooks/useTestbookPDF";
import { TestbookPDF } from "../../components/Testbook/TestbookPDF";
import { FileDown } from "lucide-react";

const ImagePlaceholder = ({ label, src }: { label: string, src?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => src && setIsOpen(true)}
        className={`w-full my-6 bg-[var(--bg-app)] rounded-lg flex flex-col items-center justify-center relative group overflow-hidden transition-all ${!src ? 'h-[300px] md:h-[400px] border border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5' : 'cursor-zoom-in border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
      >
        {!src ? (
          <span className="text-[var(--text-secondary)] opacity-60 font-bold uppercase tracking-widest text-xs md:text-sm z-10 group-hover:text-[var(--accent-color)] transition-colors flex items-center gap-2">
            <ImageIcon size={18} />
            {label}
          </span>
        ) : (
          <>
            <img src={src} alt={label} className="w-full h-auto object-contain" />
            <div className="absolute inset-0 bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs shadow-xl flex items-center gap-2">
                <ImageIcon size={16} />
                Ampliar
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isOpen && src && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={src} 
              alt={label} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AlertBox = ({ type, title, children }: { type: 'info' | 'warning' | 'tip' | 'error', title: string, children: React.ReactNode }) => {
  const styles = {
    info: "border-blue-500 bg-blue-500/10 text-blue-500",
    warning: "border-amber-500 bg-amber-500/10 text-amber-500",
    tip: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
    error: "border-red-500 bg-red-500/10 text-red-500"
  };
  const icons = {
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />,
    tip: <Lightbulb size={18} />,
    error: <FileWarning size={18} />
  };

  return (
    <div className={`p-4 md:p-5 my-6 border-l-4 rounded-r-lg ${styles[type]} flex gap-3 md:gap-4 items-start shadow-sm`}>
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div>
        <h4 className="font-bold text-sm md:text-base mb-1">{title}</h4>
        <div className="text-sm opacity-90 leading-relaxed text-[var(--text-primary)]">{children}</div>
      </div>
    </div>
  );
};

export default function Zeus() {
  const { t } = useLang();
  useTitle(t.testbookspage.Zeus.title);
  useFavicon('/testbooks/Testbook.png');
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("intro");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExporting, pdfRef, handleExportPDF } = useTestbookPDF();

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    document.getElementById('content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contentData = [
    {
      id: "intro",
      title: t.testbookspage.Streetlight.sections.intro.navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.intro["1_1"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.intro["1_1"].p1 }} />
            <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
              {t.testbookspage.Streetlight.sections.intro["1_1"].p2}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AlertBox type="tip" title={t.testbookspage.Streetlight.sections.intro["1_1"].alertTip.title}>{t.testbookspage.Streetlight.sections.intro["1_1"].alertTip.content}</AlertBox>
              <AlertBox type="info" title={t.testbookspage.Streetlight.sections.intro["1_1"].alertInfo.title}>{t.testbookspage.Streetlight.sections.intro["1_1"].alertInfo.content}</AlertBox>
              <AlertBox type="warning" title={t.testbookspage.Streetlight.sections.intro["1_1"].alertWarning.title}>{t.testbookspage.Streetlight.sections.intro["1_1"].alertWarning.content}</AlertBox>
              <AlertBox type="error" title={t.testbookspage.Streetlight.sections.intro["1_1"].alertError.title}>{t.testbookspage.Streetlight.sections.intro["1_1"].alertError.content}</AlertBox>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.intro["1_2"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.intro["1_2"].p1}
            </p>
            <ul className="space-y-3 mt-4">
              {t.testbookspage.Streetlight.sections.intro["1_2"].items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg">
                  <CheckCircle2 size={16} className="text-[var(--accent-color)] shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "NMS",
      title: t.testbookspage.Streetlight.sections.NMS.navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.NMS["2_1"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"].p1}
            </p>
            
            <AlertBox type="info" title={t.testbookspage.Streetlight.sections.NMS["2_1"].precondition.title}>
              {t.testbookspage.Streetlight.sections.NMS["2_1"].precondition.content}
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">{t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].title}</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].p1}
            </p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-[var(--text-primary)] leading-relaxed font-bold">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].instruction}
            </p>

            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].imageDashboard} 
              src="/testbooks/Streetlight/NMS-Dashboard.png"
            />

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">{t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].title}</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].p1}
            </p>
            <p className="text-[var(--text-primary)] font-bold leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].rssiTitle}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].rssiContent}
            </p>
            <p className="text-[var(--text-primary)] font-bold leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].lqiTitle}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].lqiContent}
            </p>

            <h5 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.NMS["2_2"].title}</h5>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].title}</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].p1}</p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].imageNetwork} 
              src="/testbooks/Streetlight/Network.png"
            />
            <p className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].p2 }} />
            <AlertBox type="warning" title={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].warningCall.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].warningCall.content }} />
            </AlertBox>

            <AlertBox type="info" title={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].infoExport.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].infoExport.content }} />
            </AlertBox>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br/><span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].p3 }} />
            </p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].imageBtnNetwork} 
              src="/testbooks/Streetlight/Btn-Network.png"
            />
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].imageStatisticalInfo} 
              src="/testbooks/Streetlight/StatisticalInfo.png"
            />
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br/><span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].p4 }} />
            </p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].imageGatewayInfo} 
              src="/testbooks/Streetlight/GatewayInfo.png"
            />
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br/>{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].p5}
            </p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"].imageNodeInfo} 
              src="/testbooks/Streetlight/NodeInfo.png"
            />
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].title}</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].p1}</p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].imageDevice} 
              src="/testbooks/Streetlight/Device.png"
            />

            <AlertBox type="info" title={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].infoDisplay.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].infoDisplay.content }} />
            </AlertBox>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br/><span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].p2 }} />
            </p>

            <p className="text-[var(--text-primary)] font-bold leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].diagnoseTitle}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].diagnoseContent}
            </p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].imageDiagnose} 
              src="/testbooks/Streetlight/Diagnose.png"
            />

            <AlertBox type="warning" title={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].warningDiagnose.title}>
              {t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].warningDiagnose.content}
            </AlertBox>

            <p className="text-[var(--text-primary)] font-bold leading-relaxed">{t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].statsTitle}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].statsContent }} />
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"].imageStatsOPP} 
              src="/testbooks/Streetlight/StatsOPP.png"
            />
          </div>
        </div>
      )
    },
    
    {
  id: "zeus-mdc",
  title: t.testbookspage.Zeus.MDC.title,
  content: (
    <div className="space-y-8">

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.meters.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          <li dangerouslySetInnerHTML={{ __html: t.testbookspage.Zeus.MDC.meters.item }} />
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.parameters.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          <li dangerouslySetInnerHTML={{ __html: t.testbookspage.Zeus.MDC.parameters.item }} />
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.onDemandReading.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          {t.testbookspage.Zeus.MDC.onDemandReading.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.historicalData.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          {t.testbookspage.Zeus.MDC.historicalData.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.taskConfig.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          {t.testbookspage.Zeus.MDC.taskConfig.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.reports.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          <li dangerouslySetInnerHTML={{ __html: t.testbookspage.Zeus.MDC.reports.item }} />
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDC.oamLogs.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          {t.testbookspage.Zeus.MDC.oamLogs.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>

    </div>
  )
},
{
  id: "zeus-mdm",
  title: t.testbookspage.Zeus.MDM.title,
  content: (
    <div className="space-y-8">

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDM.lineLossModel.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          <li dangerouslySetInnerHTML={{ __html: t.testbookspage.Zeus.MDM.lineLossModel.item }} />
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDM.measurementPoint.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          {t.testbookspage.Zeus.MDM.measurementPoint.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
          {t.testbookspage.Zeus.MDM.lineLossResult.title}
        </h3>
        <ul className="list-disc list-inside text-[var(--text-secondary)]">
          <li dangerouslySetInnerHTML={{ __html: t.testbookspage.Zeus.MDM.lineLossResult.item }} />
        </ul>
      </div>

    </div>
  )
},
     
    {
      id: "corte-religue",
      title: t.testbookspage.Streetlight.sections["corte-religue"].navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections["corte-religue"].p1 }} />

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].title}</h3>
            <AlertBox type="info" title={t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].precondition.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].precondition.content }} />
            </AlertBox>
            
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">{t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].imageCorte} 
              src="/testbooks/Streetlight/Corte.png"
            />
            
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].imageSelect} 
              src="/testbooks/Streetlight/select.png"
            />

            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].imageResult} 
              src="/testbooks/Streetlight/result.png"
            />

            <AlertBox type="tip" title={t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].postcondition.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections["corte-religue"]["7_1"].postcondition.content }} />
            </AlertBox>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].title}</h3>
            <AlertBox type="info" title={t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].precondition.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].precondition.content }} />
            </AlertBox>
            
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">{t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].imageReligue} 
              src="/testbooks/Streetlight/Religue.png"
            />

            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].imageSelect} 
              src="/testbooks/Streetlight/select.png"
            />

            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].imageResult} 
              src="/testbooks/Streetlight/result.png"
            />
            
            <AlertBox type="tip" title={t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].postcondition.title}>
              <span dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections["corte-religue"]["7_2"].postcondition.content }} />
            </AlertBox>
          </div>
        </div>
      )
    },
    {
      id: "leitura-demanda",
      title: t.testbookspage.Streetlight.sections["leitura-demanda"].navTitle,
      content: (
        <div className="space-y-6">
          <AlertBox type="info" title={t.testbookspage.Streetlight.sections["leitura-demanda"].precondition.title}>
              {t.testbookspage.Streetlight.sections["leitura-demanda"].precondition.content}
          </AlertBox>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections["leitura-demanda"].p1}
          </p>
          <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">{t.testbookspage.Streetlight.sections["leitura-demanda"].executionTitle}</h4>
          <ul className="list-decimal list-inside space-y-3 text-[var(--text-secondary)] p-5 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-sm md:text-base">
            {t.testbookspage.Streetlight.sections["leitura-demanda"].executionItems.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections["leitura-demanda"].imageDemand} 
            src="/testbooks/Streetlight/query-demand.png"
          />

          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections["leitura-demanda"].imageSelect} 
            src="/testbooks/Streetlight/select-demand.png"
          />

          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections["leitura-demanda"].imageResult} 
            src="/testbooks/Streetlight/result-demand.png"
          />
        </div>
      )
    },
    {
      id: "data-hora",
      title: t.testbookspage.Streetlight.sections["data-hora"].navTitle,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["data-hora"]["9_1"].title}</h3>
            <AlertBox type="info" title={t.testbookspage.Streetlight.sections["data-hora"]["9_1"].precondition.title}>
              {t.testbookspage.Streetlight.sections["data-hora"]["9_1"].precondition.content}
            </AlertBox>
            
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">{t.testbookspage.Streetlight.sections["data-hora"]["9_1"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["data-hora"]["9_1"].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["data-hora"]["9_1"].imageDataHora} 
              src="/testbooks/Streetlight/data_hora.png"
            />
            
            <AlertBox type="tip" title={t.testbookspage.Streetlight.sections["data-hora"]["9_1"].postcondition.title}>
              {t.testbookspage.Streetlight.sections["data-hora"]["9_1"].postcondition.content}
            </AlertBox>
          </div>
        </div>
      )
    },
    {
      id: "tela-lcd",
      title: t.testbookspage.Streetlight.sections["tela-lcd"].navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].p1}</p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].imageLeituraLcd} 
              src="/testbooks/Streetlight/leitura_lcd.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].title}</h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].executionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].imageAlterarLcd} 
              src="/testbooks/Streetlight/alterar_lcd.png"
            />
            <AlertBox type="warning" title={t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].postcondition.title}>
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].postcondition.content}
            </AlertBox>
          </div>
        </div>
      )
    },
    {
      id: "parametrizacao",
      title: t.testbookspage.Streetlight.sections.parametrizacao.navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.parametrizacao.p1}</p>
          
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.parametrizacao["11_1"].title}</h3>
            <p className="text-[var(--text-secondary)]">{t.testbookspage.Streetlight.sections.parametrizacao["11_1"].p1}</p>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.parametrizacao["11_1"].imageLeituraParametros} 
              src="/testbooks/Streetlight/leitura_parametros.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.parametrizacao["11_2"].title}</h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.parametrizacao["11_2"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.parametrizacao["11_2"].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.parametrizacao["11_2"].imageSetParametros} 
              src="/testbooks/Streetlight/set_parametros.png"
            />
            <AlertBox type="tip" title={t.testbookspage.Streetlight.sections.parametrizacao["11_2"].postcondition.title}>{t.testbookspage.Streetlight.sections.parametrizacao["11_2"].postcondition.content}</AlertBox>
          </div>
        </div>
      )
    },
    {
      id: "tarifas",
      title: t.testbookspage.Streetlight.sections.tarifas.navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.tarifas.p1}</p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.tarifas["12_1"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.tarifas["12_1"].p1 }} />
            <ImagePlaceholder 
                  label={t.testbookspage.Streetlight.sections.tarifas["12_1"].imageTariffDefinition} 
                  src="/testbooks/Streetlight/tariff_definition.png"
            />

            <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.tarifas["12_1"].p2}</p>
            <ImagePlaceholder 
                  label={t.testbookspage.Streetlight.sections.tarifas["12_1"].imageTariffSelect} 
                  src="/testbooks/Streetlight/tariff_select.png"
            />

            <div className="ml-2 md:ml-4 space-y-6 border-l-2 border-[var(--border-color)] pl-4 md:pl-6">
              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">{t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_1"].title}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_1"].items.map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
                <ImagePlaceholder 
                  label={t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_1"].imageDailyTemplate} 
                  src="/testbooks/Streetlight/daily_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">{t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_2"].title}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_2"].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <ImagePlaceholder 
                  label={t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_2"].imageWeeklyTemplate} 
                  src="/testbooks/Streetlight/weekly_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">{t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_3"].title}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_3"].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">{t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_4"].title}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"]["12_1_4"].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.tarifas["12_2"].title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.testbookspage.Streetlight.sections.tarifas["12_2"].p1 }} />
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.tarifas["12_2"].imageCurrentTariff} 
              src="/testbooks/Streetlight/current_tariff.png"
            />
            <AlertBox type="tip" title={t.testbookspage.Streetlight.sections.tarifas["12_2"].postcondition.title}>{t.testbookspage.Streetlight.sections.tarifas["12_2"].postcondition.content}</AlertBox>
          </div>
        </div>
      )
    },
    {
      id: "relatorios",
      title: t.testbookspage.Streetlight.sections.relatorios.navTitle,
      content: (
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">{t.testbookspage.Streetlight.sections.relatorios.p1}</p>
          
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.relatorios["13_1"].title}</h3>
            <AlertBox type="info" title={t.testbookspage.Streetlight.sections.relatorios["13_1"].precondition.title}>
              {t.testbookspage.Streetlight.sections.relatorios["13_1"].precondition.content}
            </AlertBox>
            
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">{t.testbookspage.Streetlight.sections.relatorios["13_1"].executionTitle}</h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.relatorios["13_1"].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder 
              label={t.testbookspage.Streetlight.sections.relatorios["13_1"].imageRelatorios} 
              src="/testbooks/Streetlight/relatorios.png"
            />
          </div>
        </div>
      )
    },
    {
      id: "alarmes",
      title: t.testbookspage.Streetlight.sections.alarmes.navTitle,
      content: (
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.alarmes.p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.alarmes.items.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections.alarmes.imageAlarmes} 
            src="/testbooks/Streetlight/alarmes.png"
          />
          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections.alarmes.imageAlarmes2} 
            src="/testbooks/Streetlight/alarmes2.png"
          />
        </div>
      )
    },
    {
      id: "apendice",
      title: t.testbookspage.Streetlight.sections.apendice.navTitle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.apendice["15_1"].title}</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.apendice["15_1"].p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.apendice["15_1"].items.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <ImagePlaceholder 
            label={t.testbookspage.Streetlight.sections.apendice["15_1"].imageStatusRele} 
            src="/testbooks/Streetlight/status_rele.png"
          />
        </div>
      )
    },
    {
      id: "changelog",
      title: t.testbookspage.Streetlight.sections.changelog.navTitle,
      content: (
        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-4">
              <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)]">{t.testbookspage.Streetlight.sections.changelog.v1_0_0.version}</h3>
              <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-md text-xs font-bold border border-[var(--accent-color)]/20">{t.testbookspage.Streetlight.sections.changelog.v1_0_0.date}</span>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {t.testbookspage.Streetlight.sections.changelog.v1_0_0.changes.map((change: string, i: number) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {change}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row h-screen bg-[var(--bg-app)] font-sans text-[var(--text-primary)] overflow-hidden" data-lenis-prevent>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed bottom-6 right-6 z-[10000] p-4 bg-[var(--accent-color)] text-white rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside className={`
          fixed inset-0 z-[9999] md:relative md:z-auto
          w-full md:w-[320px] lg:w-[380px] 
          bg-[var(--card-bg)] border-r border-[var(--border-color)] 
          flex flex-col transition-all duration-500 ease-in-out h-full
          ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'}
        `}>
          <div className="p-6 md:p-8 border-b border-[var(--border-color)] bg-gradient-to-br from-[var(--accent-color)]/5 to-transparent shrink-0">
            {/*<button 
              onClick={() => navigate('/testbooks')}
              className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all mb-6 text-sm font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar
            </button> */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                {t.testbookspage.Zeus.title}
              </h1>
             {/* <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium leading-relaxed opacity-80">
                {t.testbookspage.Streetlight.subtitle}
              </p> */}
            </div> 
          </div>

          <nav className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar">
            {contentData.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${activeSection === section.id 
                    ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20 translate-x-2' 
                    : 'hover:bg-[var(--accent-color)]/5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:translate-x-1'}
                `}
              >
                <span className="relative z-10 font-bold text-sm md:text-base tracking-tight">{section.title}</span>
                {activeSection === section.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]/80"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-app)]/50 backdrop-blur-sm shrink-0">
            <button
              onClick={() => handleExportPDF(`Testbook - ${t.testbookspage.Zeus.title}`)}
              disabled={isExporting}
              className="w-full mb-4 flex items-center justify-center gap-2 px-5 py-3 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
            >
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
              {isExporting ? "Gerando..." : "Download PDF"}
            </button>
            <div className="flex items-center justify-between gap-4">
              <LanguageSwitcher />
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">
                v1.0.0
              </div>
            </div>
          </div>
        </aside>

        <main id="content-area" className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[var(--bg-app)] relative scroll-smooth">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-color)] rounded-full blur-[150px] opacity-5 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto p-5 md:p-10 lg:p-16 relative z-[1000] pb-40">
            {contentData.map((section) => (
              <div
                key={section.id}
                style={{ display: activeSection === section.id ? "block" : "none" }}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 md:p-10 shadow-sm"
              >
                <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-8 pb-6 border-b border-[var(--border-color)]">
                  {section.title}
                </h2>
                {section.content}
              </div>
            ))}
          </div>
        </main>
        
        <TestbookPDF 
          pdfRef={pdfRef}
          title={t.testbookspage.Zeus.title}
          version="v1.0.0"
          sections={contentData}
        />
      </div>
    </PageTransition>
  );
}
