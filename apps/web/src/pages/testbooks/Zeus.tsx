import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
  Info,
  Lightbulb,
  FileWarning,
  Menu,
  Loader2,
  FileDown,
} from "lucide-react";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLang } from "../../contexts/LangContext";
import PageTransition from "../../components/PageTransition";
import { useFavicon, useTitle } from "../../hooks/useTitle";
import { useTestbookPDF } from "../../hooks/useTestbookPDF";
import { TestbookPDF } from "../../components/Testbook/TestbookPDF";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";

const ImagePlaceholder = ({ label, src }: { label: string; src?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    return (
      <div
        className="my-6 flex h-[240px] w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-app)] md:h-[320px]"
        aria-label={label}
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-70">
          <ImageIcon size={17} />
          {label}
        </span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative my-6 block w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] text-left transition-colors hover:border-[var(--accent-color)]/50"
        aria-label={`Ampliar: ${label}`}
      >
        <img
          src={src}
          alt={label}
          className="h-auto max-h-[620px] w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <span className="absolute right-3 bottom-3 flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]/95 px-3 py-2 text-xs font-bold text-[var(--text-primary)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ImageIcon size={14} />
          Ampliar
        </span>
        <span className="sr-only">{label}</span>
      </button>

      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-3 p-3 sm:max-w-5xl bg-[var(--card-bg)] border-[var(--border-color)]">
        <DialogTitle className="px-2 pt-1 pr-10 text-[var(--text-primary)]">
          {label}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Visualização ampliada da imagem: {label}
        </DialogDescription>
        <div className="flex max-h-[78vh] items-center justify-center overflow-auto rounded-lg bg-[var(--bg-app)] p-2">
          <img
            src={src}
            alt={label}
            className="max-h-[76vh] max-w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AlertBox = ({
  type,
  title,
  children,
}: {
  type: "info" | "warning" | "tip" | "error";
  title: string;
  children: ReactNode;
}) => {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/8 text-blue-600 dark:text-blue-400 [&_[data-slot=alert-description]]:text-[var(--text-secondary)]",
    warning:
      "border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-400 [&_[data-slot=alert-description]]:text-[var(--text-secondary)]",
    tip: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 [&_[data-slot=alert-description]]:text-[var(--text-secondary)]",
    error:
      "border-red-500/30 bg-red-500/8 text-red-700 dark:text-red-400 [&_[data-slot=alert-description]]:text-[var(--text-secondary)]",
  };
  const icons = {
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />,
    tip: <Lightbulb size={18} />,
    error: <FileWarning size={18} />,
  };

  return (
    <Alert className={`my-6 px-4 py-4 ${styles[type]}`}>
      {icons[type]}
      <AlertTitle className="text-[var(--text-primary)]">{title}</AlertTitle>
      <AlertDescription className="mt-1 leading-relaxed">
        {children}
      </AlertDescription>
    </Alert>
  );
};

export default function Zeus() {
  const { t } = useLang();
  useTitle(t.testbookspage.Zeus.title);
  useFavicon("/testbooks/Testbook.png");
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("intro");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExporting, pdfRef, handleExportPDF } = useTestbookPDF();

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    document
      .getElementById("content-area")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const contentData = [
    {
      id: "intro",
      title: t.testbookspage.Streetlight.sections.intro.navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.intro["1_1"].title}
            </h3>
            <p
              className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg"
              dangerouslySetInnerHTML={{
                __html: t.testbookspage.Streetlight.sections.intro["1_1"].p1,
              }}
            />
            <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
              {t.testbookspage.Streetlight.sections.intro["1_1"].p2}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AlertBox
                type="tip"
                title={
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertTip
                    .title
                }
              >
                {
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertTip
                    .content
                }
              </AlertBox>
              <AlertBox
                type="info"
                title={
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertInfo
                    .title
                }
              >
                {
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertInfo
                    .content
                }
              </AlertBox>
              <AlertBox
                type="warning"
                title={
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertWarning
                    .title
                }
              >
                {
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertWarning
                    .content
                }
              </AlertBox>
              <AlertBox
                type="error"
                title={
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertError
                    .title
                }
              >
                {
                  t.testbookspage.Streetlight.sections.intro["1_1"].alertError
                    .content
                }
              </AlertBox>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.intro["1_2"].title}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.intro["1_2"].p1}
            </p>
            <ul className="space-y-3 mt-4">
              {t.testbookspage.Streetlight.sections.intro["1_2"].items.map(
                (item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-[var(--accent-color)] shrink-0 mt-0.5"
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "NMS",
      title: t.testbookspage.Streetlight.sections.NMS.navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.NMS["2_1"].title}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"].p1}
            </p>

            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections.NMS["2_1"].precondition
                  .title
              }
            >
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"].precondition
                  .content
              }
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].title}
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"].p1}
            </p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.NMS["2_1"][
                "2_1_1"
              ].items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-[var(--text-primary)] leading-relaxed font-bold">
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"]
                  .instruction
              }
            </p>

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_1"]
                  .imageDashboard
              }
              src="/testbooks/Streetlight/NMS-Dashboard.png"
            />

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].title}
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"].p1}
            </p>
            <p className="text-[var(--text-primary)] font-bold leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"]
                  .rssiTitle
              }
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"]
                  .rssiContent
              }
            </p>
            <p className="text-[var(--text-primary)] font-bold leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"]
                  .lqiTitle
              }
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_1"]["2_1_2"]
                  .lqiContent
              }
            </p>

            <h5 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.NMS["2_2"].title}
            </h5>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .title
              }
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .p1
              }
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .imageNetwork
              }
              src="/testbooks/Streetlight/Network.png"
            />
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.NMS["2_2"][
                    "2_2_1_network"
                  ].p2,
              }}
            />
            <AlertBox
              type="warning"
              title={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .warningCall.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_network"
                    ].warningCall.content,
                }}
              />
            </AlertBox>

            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .infoExport.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_network"
                    ].infoExport.content,
                }}
              />
            </AlertBox>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br />
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_network"
                    ].p3,
                }}
              />
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .imageBtnNetwork
              }
              src="/testbooks/Streetlight/Btn-Network.png"
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .imageStatisticalInfo
              }
              src="/testbooks/Streetlight/StatisticalInfo.png"
            />
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br />
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_network"
                    ].p4,
                }}
              />
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .imageGatewayInfo
              }
              src="/testbooks/Streetlight/GatewayInfo.png"
            />
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br />
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .p5
              }
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_network"]
                  .imageNodeInfo
              }
              src="/testbooks/Streetlight/NodeInfo.png"
            />
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .title
              }
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .p1
              }
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .imageDevice
              }
              src="/testbooks/Streetlight/Device.png"
            />

            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .infoDisplay.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_device"
                    ].infoDisplay.content,
                }}
              />
            </AlertBox>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <br />
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.NMS["2_2"][
                      "2_2_1_device"
                    ].p2,
                }}
              />
            </p>

            <p className="text-[var(--text-primary)] font-bold leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .diagnoseTitle
              }
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .diagnoseContent
              }
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .imageDiagnose
              }
              src="/testbooks/Streetlight/Diagnose.png"
            />

            <AlertBox
              type="warning"
              title={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .warningDiagnose.title
              }
            >
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .warningDiagnose.content
              }
            </AlertBox>

            <p className="text-[var(--text-primary)] font-bold leading-relaxed">
              {
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .statsTitle
              }
            </p>
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.NMS["2_2"][
                    "2_2_1_device"
                  ].statsContent,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.NMS["2_2"]["2_2_1_device"]
                  .imageStatsOPP
              }
              src="/testbooks/Streetlight/StatsOPP.png"
            />
          </div>
        </div>
      ),
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
              <li
                dangerouslySetInnerHTML={{
                  __html: t.testbookspage.Zeus.MDC.meters.item,
                }}
              />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.parameters.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              <li
                dangerouslySetInnerHTML={{
                  __html: t.testbookspage.Zeus.MDC.parameters.item,
                }}
              />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.onDemandReading.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              {t.testbookspage.Zeus.MDC.onDemandReading.items.map(
                (item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ),
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.historicalData.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              {t.testbookspage.Zeus.MDC.historicalData.items.map(
                (item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ),
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.taskConfig.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              {t.testbookspage.Zeus.MDC.taskConfig.items.map(
                (item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ),
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.reports.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              <li
                dangerouslySetInnerHTML={{
                  __html: t.testbookspage.Zeus.MDC.reports.item,
                }}
              />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDC.oamLogs.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              {t.testbookspage.Zeus.MDC.oamLogs.items.map(
                (item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ),
              )}
            </ul>
          </div>
        </div>
      ),
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
              <li
                dangerouslySetInnerHTML={{
                  __html: t.testbookspage.Zeus.MDM.lineLossModel.item,
                }}
              />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDM.measurementPoint.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              {t.testbookspage.Zeus.MDM.measurementPoint.items.map(
                (item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ),
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Zeus.MDM.lineLossResult.title}
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)]">
              <li
                dangerouslySetInnerHTML={{
                  __html: t.testbookspage.Zeus.MDM.lineLossResult.item,
                }}
              />
            </ul>
          </div>
        </div>
      ),
    },

    {
      id: "corte-religue",
      title: t.testbookspage.Streetlight.sections["corte-religue"].navTitle,
      content: (
        <div className="space-y-8">
          <p
            className="text-[var(--text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: t.testbookspage.Streetlight.sections["corte-religue"].p1,
            }}
          />

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .title
              }
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .precondition.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                      .precondition.content,
                }}
              />
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["corte-religue"][
                "7_1"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .imageCorte
              }
              src="/testbooks/Streetlight/Corte.png"
            />

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .imageSelect
              }
              src="/testbooks/Streetlight/select.png"
            />

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .imageResult
              }
              src="/testbooks/Streetlight/result.png"
            />

            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                  .postcondition.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections["corte-religue"]["7_1"]
                      .postcondition.content,
                }}
              />
            </AlertBox>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .title
              }
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .precondition.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                      .precondition.content,
                }}
              />
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["corte-religue"][
                "7_2"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .imageReligue
              }
              src="/testbooks/Streetlight/Religue.png"
            />

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .imageSelect
              }
              src="/testbooks/Streetlight/select.png"
            />

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .imageResult
              }
              src="/testbooks/Streetlight/result.png"
            />

            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                  .postcondition.title
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections["corte-religue"]["7_2"]
                      .postcondition.content,
                }}
              />
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "leitura-demanda",
      title: t.testbookspage.Streetlight.sections["leitura-demanda"].navTitle,
      content: (
        <div className="space-y-6">
          <AlertBox
            type="info"
            title={
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .precondition.title
            }
          >
            {
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .precondition.content
            }
          </AlertBox>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections["leitura-demanda"].p1}
          </p>
          <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            {
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .executionTitle
            }
          </h4>
          <ul className="list-decimal list-inside space-y-3 text-[var(--text-secondary)] p-5 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-sm md:text-base">
            {t.testbookspage.Streetlight.sections[
              "leitura-demanda"
            ].executionItems.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .imageDemand
            }
            src="/testbooks/Streetlight/query-demand.png"
          />

          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .imageSelect
            }
            src="/testbooks/Streetlight/select-demand.png"
          />

          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections["leitura-demanda"]
                .imageResult
            }
            src="/testbooks/Streetlight/result-demand.png"
          />
        </div>
      ),
    },
    {
      id: "data-hora",
      title: t.testbookspage.Streetlight.sections["data-hora"].navTitle,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections["data-hora"]["9_1"].title}
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .precondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .precondition.content
              }
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["data-hora"][
                "9_1"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .imageDataHora
              }
              src="/testbooks/Streetlight/data_hora.png"
            />

            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .postcondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["data-hora"]["9_1"]
                  .postcondition.content
              }
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "tela-lcd",
      title: t.testbookspage.Streetlight.sections["tela-lcd"].navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].title}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"].p1}
            </p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["tela-lcd"][
                "10_1"
              ].items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["tela-lcd"]["10_1"]
                  .imageLeituraLcd
              }
              src="/testbooks/Streetlight/leitura_lcd.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"].title}
            </h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["tela-lcd"][
                "10_2"
              ].executionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"]
                  .imageAlterarLcd
              }
              src="/testbooks/Streetlight/alterar_lcd.png"
            />
            <AlertBox
              type="warning"
              title={
                t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"]
                  .postcondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["tela-lcd"]["10_2"]
                  .postcondition.content
              }
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "parametrizacao",
      title: t.testbookspage.Streetlight.sections.parametrizacao.navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.parametrizacao.p1}
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections.parametrizacao["11_1"]
                  .title
              }
            </h3>
            <p className="text-[var(--text-secondary)]">
              {t.testbookspage.Streetlight.sections.parametrizacao["11_1"].p1}
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.parametrizacao["11_1"]
                  .imageLeituraParametros
              }
              src="/testbooks/Streetlight/leitura_parametros.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections.parametrizacao["11_2"]
                  .title
              }
            </h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections.parametrizacao["11_2"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.parametrizacao[
                "11_2"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.parametrizacao["11_2"]
                  .imageSetParametros
              }
              src="/testbooks/Streetlight/set_parametros.png"
            />
            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections.parametrizacao["11_2"]
                  .postcondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections.parametrizacao["11_2"]
                  .postcondition.content
              }
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "tarifas",
      title: t.testbookspage.Streetlight.sections.tarifas.navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.tarifas.p1}
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.tarifas["12_1"].title}
            </h3>
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: t.testbookspage.Streetlight.sections.tarifas["12_1"].p1,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.tarifas["12_1"]
                  .imageTariffDefinition
              }
              src="/testbooks/Streetlight/tariff_definition.png"
            />

            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.tarifas["12_1"].p2}
            </p>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.tarifas["12_1"]
                  .imageTariffSelect
              }
              src="/testbooks/Streetlight/tariff_select.png"
            />

            <div className="ml-2 md:ml-4 space-y-6 border-l-2 border-[var(--border-color)] pl-4 md:pl-6">
              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  {
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_1"
                    ].title
                  }
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"][
                    "12_1_1"
                  ].items.map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
                <ImagePlaceholder
                  label={
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_1"
                    ].imageDailyTemplate
                  }
                  src="/testbooks/Streetlight/daily_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  {
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_2"
                    ].title
                  }
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"][
                    "12_1_2"
                  ].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <ImagePlaceholder
                  label={
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_2"
                    ].imageWeeklyTemplate
                  }
                  src="/testbooks/Streetlight/weekly_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  {
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_3"
                    ].title
                  }
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"][
                    "12_1_3"
                  ].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  {
                    t.testbookspage.Streetlight.sections.tarifas["12_1"][
                      "12_1_4"
                    ].title
                  }
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  {t.testbookspage.Streetlight.sections.tarifas["12_1"][
                    "12_1_4"
                  ].items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.tarifas["12_2"].title}
            </h3>
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: t.testbookspage.Streetlight.sections.tarifas["12_2"].p1,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.tarifas["12_2"]
                  .imageCurrentTariff
              }
              src="/testbooks/Streetlight/current_tariff.png"
            />
            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections.tarifas["12_2"]
                  .postcondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections.tarifas["12_2"]
                  .postcondition.content
              }
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "relatorios",
      title: t.testbookspage.Streetlight.sections.relatorios.navTitle,
      content: (
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.relatorios.p1}
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.relatorios["13_1"].title}
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections.relatorios["13_1"]
                  .precondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections.relatorios["13_1"]
                  .precondition.content
              }
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections.relatorios["13_1"]
                  .executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.relatorios[
                "13_1"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.relatorios["13_1"]
                  .imageRelatorios
              }
              src="/testbooks/Streetlight/relatorios.png"
            />
          </div>
        </div>
      ),
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
            {t.testbookspage.Streetlight.sections.alarmes.items.map(
              (item: string, i: number) => (
                <li key={i}>{item}</li>
              ),
            )}
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
      ),
    },
    {
      id: "apendice",
      title: t.testbookspage.Streetlight.sections.apendice.navTitle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.apendice["15_1"].title}
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.apendice["15_1"].p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.apendice["15_1"].items.map(
              (item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ),
            )}
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.apendice["15_1"]
                .imageStatusRele
            }
            src="/testbooks/Streetlight/status_rele.png"
          />
        </div>
      ),
    },
    {
      id: "changelog",
      title: t.testbookspage.Streetlight.sections.changelog.navTitle,
      content: (
        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-4">
              <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)]">
                {t.testbookspage.Streetlight.sections.changelog.v1_0_0.version}
              </h3>
              <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-md text-xs font-bold border border-[var(--accent-color)]/20">
                {t.testbookspage.Streetlight.sections.changelog.v1_0_0.date}
              </span>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {t.testbookspage.Streetlight.sections.changelog.v1_0_0.changes.map(
                (change: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />{" "}
                    {change}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const activeIndex = contentData.findIndex(
    (section) => section.id === activeSection,
  );

  const goToRelativeSection = (offset: number) => {
    const nextIndex = Math.min(
      contentData.length - 1,
      Math.max(0, activeIndex + offset),
    );
    handleSectionClick(contentData[nextIndex].id);
  };

  return (
    <PageTransition>
      <div
        className="h-screen overflow-hidden bg-[var(--bg-app)] font-sans text-[var(--text-primary)]"
        data-lenis-prevent
      >
        <div className="flex h-full">
          <aside className="hidden h-full w-[300px] shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--card-bg)] md:flex lg:w-[340px]">
            <div className="shrink-0 px-5 pt-5 pb-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/testbooks")}
                className="mb-5 -ml-2 text-[var(--text-secondary)]"
              >
                <ArrowLeft size={16} /> Voltar ao catálogo
              </Button>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--accent-color)] text-[var(--text-primary)]">
                    <BookOpen size={19} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                  >
                    v1.0.0
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="mb-2 border-[var(--border-color)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Documentação técnica
                </Badge>
                <h1 className="text-xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
                  {t.testbookspage.Zeus.title}
                </h1>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border-color)]/60">
                    <div
                      className="h-full rounded-full bg-[var(--accent-color)] transition-[width] duration-300"
                      style={{
                        width: `${((activeIndex + 1) / contentData.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium tabular-nums text-[var(--text-secondary)]">
                    {activeIndex + 1}/{contentData.length}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-[var(--border-color)]" />

            <ScrollArea className="min-h-0 flex-1 px-3 py-4">
              <nav aria-label="Seções do testbook" className="space-y-1">
                {contentData.map((section, index) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleSectionClick(section.id)}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-[var(--accent-color)]/10 text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--accent-color)]/5 hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold ${
                          isActive
                            ? "border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                            : "border-[var(--border-color)] bg-[var(--bg-app)]"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="line-clamp-2 text-sm font-medium leading-snug">
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>

            <div className="shrink-0 space-y-3 border-t border-[var(--border-color)] bg-[var(--bg-app)]/35 p-4">
              <Button
                onClick={() =>
                  handleExportPDF(`Testbook - ${t.testbookspage.Zeus.title}`)
                }
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <FileDown size={17} />
                )}
                {isExporting ? "Gerando PDF..." : "Download PDF"}
              </Button>
              <div className="flex items-center justify-between px-1">
                <LanguageSwitcher />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                  PODS · v1.0.0
                </span>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)]/95 px-4 backdrop-blur md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Abrir navegação"
                    >
                      <Menu size={18} />
                    </Button>
                  }
                />
                <SheetContent
                  side="left"
                  className="w-[min(88vw,340px)] gap-0 border-[var(--border-color)] bg-[var(--card-bg)] p-0"
                  data-lenis-prevent
                >
                  <SheetHeader className="border-b border-[var(--border-color)] px-5 py-5">
                    <div className="mb-3 flex flex-wrap gap-2 pr-8">
                      <Badge variant="outline">Documentação técnica</Badge>
                      <Badge
                        variant="secondary"
                        className="bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                      >
                        v1.0.0
                      </Badge>
                    </div>
                    <SheetTitle className="text-left text-[var(--text-primary)]">
                      {t.testbookspage.Zeus.title}
                    </SheetTitle>
                  </SheetHeader>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/testbooks")}
                    className="mx-4 mt-3 w-[calc(100%-2rem)] justify-start"
                  >
                    <ArrowLeft size={16} />
                    Voltar ao catálogo
                  </Button>

                  <ScrollArea className="min-h-0 flex-1 px-3 py-3">
                    <nav aria-label="Seções do testbook" className="space-y-1">
                      {contentData.map((section, index) => {
                        const isActive = activeSection === section.id;
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => handleSectionClick(section.id)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "bg-[var(--accent-color)]/10 text-[var(--text-primary)]"
                                : "text-[var(--text-secondary)] hover:bg-[var(--accent-color)]/5"
                            }`}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--border-color)] text-[11px] font-semibold">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="line-clamp-2 text-sm font-medium leading-snug">
                              {section.title}
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                  </ScrollArea>

                  <SheetHeader className="border-t border-[var(--border-color)] px-4 py-4">
                    <Button
                      onClick={() =>
                        handleExportPDF(
                          `Testbook - ${t.testbookspage.Zeus.title}`,
                        )
                      }
                      disabled={isExporting}
                      className="w-full"
                    >
                      {isExporting ? (
                        <Loader2 className="animate-spin" size={17} />
                      ) : (
                        <FileDown size={17} />
                      )}
                      {isExporting ? "Gerando PDF..." : "Download PDF"}
                    </Button>
                    <div className="mt-3 flex items-center justify-between">
                      <LanguageSwitcher />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                        v1.0.0
                      </span>
                    </div>
                  </SheetHeader>
                </SheetContent>
              </Sheet>

              <h1 className="min-w-0 flex-1 truncate px-3 text-sm font-semibold text-[var(--text-primary)]">
                {t.testbookspage.Zeus.title}
              </h1>
            </header>

            <main
              id="content-area"
              className="min-w-0 flex-1 overflow-y-auto bg-[var(--bg-app)] scroll-smooth"
              data-lenis-prevent
            >
              <div className="mx-auto w-full max-w-4xl px-4 py-5 pb-28 sm:px-6 md:px-8 md:py-9 lg:px-10 lg:py-12">
                {contentData.map((section, index) => (
                  <Card
                    key={section.id}
                    style={{
                      display: activeSection === section.id ? "block" : "none",
                    }}
                    className="overflow-visible rounded-[20px] border-[var(--border-color)] bg-[var(--card-bg)] py-0 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.28)] ring-0"
                  >
                    <CardHeader className="px-5 pt-6 pb-5 sm:px-8 md:px-10 md:pt-9">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <Badge
                          variant="secondary"
                          className="h-7 border border-[var(--accent-color)]/15 bg-[var(--accent-color)]/10 px-3 text-[11px] uppercase tracking-[0.16em] text-[var(--accent-color)]"
                        >
                          Seção {String(index + 1).padStart(2, "0")}
                        </Badge>
                        <span className="hidden text-xs font-medium text-[var(--text-secondary)] sm:block">
                          {index + 1} de {contentData.length}
                        </span>
                      </div>
                      <CardTitle className="text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[2.25rem] md:text-[2.75rem]">
                        {section.title}
                      </CardTitle>
                      <Separator className="mt-7 bg-[var(--border-color)]" />
                    </CardHeader>
                    <CardContent className="px-5 pb-7 sm:px-8 md:px-10 md:pb-9">
                      <div className="min-w-0 text-[15px] leading-7 [&_*]:max-w-full [&_h3]:mt-2 [&_h3]:mb-4 [&_h3]:tracking-tight [&_h4]:mt-5 [&_h4]:mb-3 [&_h5]:mt-5 [&_h5]:mb-3 [&_p]:leading-7 [&_ul]:my-4 [&_ol]:my-4 [&_li]:leading-7 [&_img]:rounded-xl [&_pre]:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto">
                        {section.content}
                      </div>

                      <Separator className="mt-10 bg-[var(--border-color)]" />
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => goToRelativeSection(-1)}
                          disabled={activeIndex === 0}
                          className="h-auto min-h-12 justify-start px-3 py-2.5"
                        >
                          <ArrowLeft size={16} />
                          <span className="min-w-0 text-left">
                            <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                              Anterior
                            </span>
                            <span className="block truncate text-xs text-[var(--text-primary)]">
                              {activeIndex > 0
                                ? contentData[activeIndex - 1].title
                                : "—"}
                            </span>
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => goToRelativeSection(1)}
                          disabled={activeIndex === contentData.length - 1}
                          className="h-auto min-h-12 justify-end px-3 py-2.5"
                        >
                          <span className="min-w-0 text-right">
                            <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                              Próxima
                            </span>
                            <span className="block truncate text-xs text-[var(--text-primary)]">
                              {activeIndex < contentData.length - 1
                                ? contentData[activeIndex + 1].title
                                : "—"}
                            </span>
                          </span>
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>

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
