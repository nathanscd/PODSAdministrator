import { useState, type ReactNode, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileDown,
  Loader2,
  Menu,
  Image as ImageIcon,
  Info,
  AlertTriangle,
  Lightbulb,
  FileWarning,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import LanguageSwitcher from "../LanguageSwitcher";
import PageTransition from "../PageTransition";
import { TestbookPDF } from "./TestbookPDF";

export interface TestbookSection {
  id: string;
  title: string;
  content: ReactNode;
}

export function ImagePlaceholder({
  label,
  src,
}: {
  label: string;
  src?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    return (
      <div
        className="my-6 flex h-[240px] w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-app)] md:h-[320px]"
        aria-label={label}
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-70">
          <ImageIcon size={17} /> {label}
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
          <ImageIcon size={14} /> Ampliar
        </span>
      </button>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-3 border-[var(--border-color)] bg-[var(--card-bg)] p-3 sm:max-w-5xl">
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
}

export function AlertBox({
  type,
  title,
  children,
}: {
  type: "info" | "warning" | "tip" | "error";
  title: string;
  children: ReactNode;
}) {
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
}

interface TestbookPageLayoutProps {
  title: string;
  exportTitle: string;
  pdfRef: RefObject<HTMLDivElement | null>;
  isExporting: boolean;
  handleExportPDF: (title: string) => Promise<void>;
  contentData: TestbookSection[];
  showLanguageSwitcher?: boolean;
}

export default function TestbookPageLayout({
  title,
  exportTitle,
  pdfRef,
  isExporting,
  handleExportPDF,
  contentData,
  showLanguageSwitcher = true,
}: TestbookPageLayoutProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(
    contentData[0]?.id ?? "intro",
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeIndex = Math.max(
    0,
    contentData.findIndex((section) => section.id === activeSection),
  );

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    document
      .getElementById("content-area")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToRelativeSection = (offset: number) => {
    const nextIndex = Math.min(
      contentData.length - 1,
      Math.max(0, activeIndex + offset),
    );
    handleSectionClick(contentData[nextIndex].id);
  };

  const exportPdf = () => handleExportPDF(exportTitle);

  const NavigationList = () => (
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
  );

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
                  {title}
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
              <NavigationList />
            </ScrollArea>

            <div className="shrink-0 space-y-3 border-t border-[var(--border-color)] bg-[var(--bg-app)]/35 p-4">
              <Button
                onClick={exportPdf}
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
              {showLanguageSwitcher && (
                <div className="flex items-center justify-between px-1">
                  <LanguageSwitcher />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                    PODS · v1.0.0
                  </span>
                </div>
              )}
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
                      {title}
                    </SheetTitle>
                  </SheetHeader>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/testbooks")}
                    className="mx-4 mt-3 w-[calc(100%-2rem)] justify-start"
                  >
                    <ArrowLeft size={16} /> Voltar ao catálogo
                  </Button>

                  <ScrollArea className="min-h-0 flex-1 px-3 py-3">
                    <NavigationList />
                  </ScrollArea>

                  <SheetHeader className="border-t border-[var(--border-color)] px-4 py-4">
                    <Button
                      onClick={exportPdf}
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
                    {showLanguageSwitcher && (
                      <div className="mt-3 flex items-center justify-between">
                        <LanguageSwitcher />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                          v1.0.0
                        </span>
                      </div>
                    )}
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <h1 className="min-w-0 flex-1 truncate px-3 text-sm font-semibold text-[var(--text-primary)]">
                {title}
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
          title={title}
          version="v1.0.0"
          sections={contentData}
        />
      </div>
    </PageTransition>
  );
}
