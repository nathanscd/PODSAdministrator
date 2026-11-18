import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "../../contexts/LangContext";
import { useFavicon, useTitle } from "../../hooks/useTitle";
import { useTestbookPDF } from "../../hooks/useTestbookPDF";
import TestbookPageLayout, {
  AlertBox,
  ImagePlaceholder,
} from "../../components/Testbook/TestbookPageLayout";

export default function Streetlight() {
  const { t } = useLang();
  useTitle(t.testbookspage.Streetlight.title);
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
      id: "controle-iluminacao",
      title:
        t.testbookspage.Streetlight.sections["controle-iluminacao"].navTitle,
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections["controle-iluminacao"].p1}
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_1"
                ].title
              }
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_1"
                ].precondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_1"
                ].precondition.content
              }
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_1"
                ].executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["controle-iluminacao"][
                "3_1"
              ].executionItems.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_1"
                ].imageMonitorONOFF
              }
              src="/testbooks/Streetlight/Monitor-ONOFF.png"
            />

            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].title
              }
            </h3>
            <AlertBox
              type="info"
              title={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].precondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].precondition.content
              }
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].executionTitle
              }
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections["controle-iluminacao"][
                "3_2"
              ].executionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].imageRTU
              }
              src="/testbooks/Streetlight/RTU.png"
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].imagePosition
              }
              src="/testbooks/Streetlight/Position.png"
            />

            <AlertBox
              type="tip"
              title={
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].postcondition.title
              }
            >
              {
                t.testbookspage.Streetlight.sections["controle-iluminacao"][
                  "3_2"
                ].postcondition.content
              }
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "LESS",
      title: t.testbookspage.Streetlight.sections.LESS.navTitle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.LESS["4_1"].title}
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.LESS["4_1"].p1}
          </p>

          <AlertBox
            type="info"
            title={
              t.testbookspage.Streetlight.sections.LESS["4_1"].precondition
                .title
            }
          >
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"].precondition
                .content
            }
          </AlertBox>

          <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
            {t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_1"].title}
          </h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_1"].p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.LESS["4_1"][
              "4_1_1"
            ].items.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>

          <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
            {t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"].title}
          </h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"].p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"]
                    .instruction,
              }}
            />
          </ul>

          <h5 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_1"
              ].title
            }
          </h5>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li>
              {
                t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                  "4_1_2_1"
                ].p1
              }
            </li>
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_1"
              ].imageModeDevice
            }
            src="/testbooks/Streetlight/ModeDevice.png"
          />
          <AlertBox type="info" title="Nota">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_1"
              ].note
            }
          </AlertBox>
          <h5 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_2"
              ].title
            }
          </h5>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
              "4_1_2_2"
            ].items.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_2"
              ].imageDeviceAction
            }
            src="/testbooks/Streetlight/DeviceAction.png"
          />

          <h5 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_3"
              ].title
            }
          </h5>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li>
              {
                t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                  "4_1_2_3"
                ].p1
              }
            </li>
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_3"
              ].imageThreshold
            }
            src="/testbooks/Streetlight/Threshold.png"
          />
          <AlertBox type="info" title="Nota">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_3"
              ].note
            }
          </AlertBox>

          <h5 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            {
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_4"
              ].title
            }
          </h5>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li>
              {
                t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                  "4_1_2_4"
                ].p1
              }
            </li>
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                "4_1_2_4"
              ].imageActions
            }
            src="/testbooks/Streetlight/Actions.png"
          />
          <AlertBox type="warning" title="Atenção">
            <span
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.LESS["4_1"]["4_1_2"][
                    "4_1_2_4"
                  ].warning,
              }}
            />
          </AlertBox>

          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.LESS["4_2"].title}
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.testbookspage.Streetlight.sections.LESS["4_2"].p1}
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            {t.testbookspage.Streetlight.sections.LESS["4_2"].items.map(
              (item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ),
            )}
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.LESS["4_2"].imageUpgrade
            }
            src="/testbooks/Streetlight/Upgrade.png"
          />
        </div>
      ),
    },
    {
      id: "Analysis",
      title: t.testbookspage.Streetlight.sections.Analysis.navTitle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.Analysis["5_1"].title}
          </h3>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li
              dangerouslySetInnerHTML={{
                __html: t.testbookspage.Streetlight.sections.Analysis["5_1"].p1,
              }}
            />
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.Analysis["5_1"]
                .imageLightAnalysis
            }
            src="/testbooks/Streetlight/LightAnalysis.png"
          />
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.Analysis["5_2"].title}
          </h3>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li
              dangerouslySetInnerHTML={{
                __html: t.testbookspage.Streetlight.sections.Analysis["5_2"].p1,
              }}
            />
          </ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.Analysis["5_2"]
                .imageLighitiningAnalysis
            }
            src="/testbooks/Streetlight/LighitiningAnalysis.png"
          />

          <AlertBox type="info" title="Informação">
            <span
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.Analysis["5_2"].info,
              }}
            />
          </AlertBox>

          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.testbookspage.Streetlight.sections.Analysis["5_3"].title}
          </h3>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2"></ul>
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.Analysis["5_3"]
                .imageEnergyAnalysis
            }
            src="/testbooks/Streetlight/EnergyAnalysis.png"
          />
          <ImagePlaceholder
            label={
              t.testbookspage.Streetlight.sections.Analysis["5_3"].imageGraph
            }
            src="/testbooks/Streetlight/Graph.png"
          />
        </div>
      ),
    },
    {
      id: "dispositivos",
      title: t.testbookspage.Streetlight.sections.dispositivos.navTitle,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.dispositivos["6_1"].title}
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.dispositivos["6_1"].p1,
                }}
              />
            </ul>

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_1"]
                  .imageStrategy
              }
              src="/testbooks/Streetlight/Strategy.png"
            />
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.dispositivos["6_1"].p2,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_1"]
                  .imageStrategyAdd
              }
              src="/testbooks/Streetlight/StrategyAdd.png"
            />
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.dispositivos["6_1"].p3,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_1"]
                  .imageTaskAddStrategy
              }
              src="/testbooks/Streetlight/TaskAddStrategy.png"
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_1"]
                  .imageStrategyTasks
              }
              src="/testbooks/Streetlight/StrategyTasks.png"
            />

            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t.testbookspage.Streetlight.sections.dispositivos["6_1"].p4}
            </p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              {t.testbookspage.Streetlight.sections.dispositivos[
                "6_1"
              ].items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.dispositivos["6_2"].title}
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.dispositivos["6_2"].p1,
                }}
              />
            </ul>

            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_2"]
                  .imageTask
              }
              src="/testbooks/Streetlight/Task.png"
            />
            <p
              className="text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  t.testbookspage.Streetlight.sections.dispositivos["6_2"].p2,
              }}
            />
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_2"]
                  .imageTaskAdd
              }
              src="/testbooks/Streetlight/TaskAdd.png"
            />

            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {t.testbookspage.Streetlight.sections.dispositivos["6_3"].title}
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li
                dangerouslySetInnerHTML={{
                  __html:
                    t.testbookspage.Streetlight.sections.dispositivos["6_3"].p1,
                }}
              />
            </ul>
            <ImagePlaceholder
              label={
                t.testbookspage.Streetlight.sections.dispositivos["6_3"]
                  .imageTaskLog
              }
              src="/testbooks/Streetlight/TaskLog.png"
            />
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

  return (
    <TestbookPageLayout
      title={t.testbookspage.Streetlight.title}
      exportTitle={`Testbook - ${t.testbookspage.Streetlight.title}`}
      pdfRef={pdfRef}
      isExporting={isExporting}
      handleExportPDF={handleExportPDF}
      contentData={contentData}
    />
  );
}
