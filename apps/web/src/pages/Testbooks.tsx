
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Cpu,
  Network,
  RadioTower,
} from "lucide-react";
import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react";

import PageTransition from "../components/PageTransition";
import { useFavicon, useTitle } from "../hooks/useTitle";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface TestbookItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  color: string;
}

const TESTBOOKS: TestbookItem[] = [
  {
    id: "zeus",
    title: "Zeus",
    description:
      "Descrição provisória do testbook Zeus. Adicione aqui uma breve apresentação do equipamento, suas funcionalidades e os procedimentos de teste.",
    route: "/testbook/zeus",
    icon: Cpu,
    color: "text-blue-500",
  },
  {
    id: "pantheon",
    title: "Pantheon",
    description:
      "Descrição provisória do testbook Pantheon. Adicione aqui informações sobre o produto, critérios de validação e procedimentos técnicos.",
    route: "/testbook/pantheon-ng",
    icon: RadioTower,
    color: "text-violet-500",
  },
  {
    id: "hybridnic",
    title: "Hybrid NIC",
    description:
      "Descrição provisória do testbook Hybrid NIC. Adicione aqui uma apresentação do dispositivo e suas orientações de instalação e testes.",
    route: "/testbook/hybridnic",
    icon: Network,
    color: "text-emerald-500",
  },
  {
    id: "streetlight",
    title: "Streetlight",
    description:
      "Descrição provisória do testbook Streetlight. Adicione aqui informações sobre soluções de iluminação pública e seus procedimentos.",
    route: "/testbook/streetlight",
    icon: BookOpen,
    color: "text-amber-500",
  },
];

export default function Testbooks() {
  useTitle("Testbooks - Biblioteca Técnica");
  useFavicon("/testbooks/Testbook.png");

  const navigate = useNavigate();

  return (
    <PageTransition>
      <main className="min-h-screen bg-[var(--bg-app)] px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto w-full max-w-7xl">

          {/* Cabeçalho */}
          <header className="mb-10 md:mb-14">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen
                    size={17}
                    className="text-[var(--accent-color)]"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Documentação técnica
                  </span>
                </div>

                <h1 className="m-0 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                  Testbooks
                </h1>

                <p className="mt-3 mb-0 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  Biblioteca de manuais, guias técnicos e procedimentos
                  de validação. Selecione um testbook para acessar seu
                  conteúdo.
                </p>
              </div>

              <Badge
                variant="outline"
                className="w-fit rounded-full border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
              >
                {TESTBOOKS.length} testbooks disponíveis
              </Badge>
            </div>
          </header>

          {/* Biblioteca */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Biblioteca
              </h2>
            </div>

            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TESTBOOKS.map((testbook, index) => {
                const Icon = testbook.icon;

                return (
                  <Link
                    key={testbook.id}
                    to={testbook.route}
                    className="
                      group block h-full rounded-[1.5rem]
                      outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--accent-color)]
                      focus-visible:ring-offset-4
                      focus-visible:ring-offset-[var(--bg-app)]
                    "
                  >
                    <Card
                      className="
                        relative flex h-full flex-col gap-0 overflow-hidden
                        rounded-[1.5rem]
                        border border-[var(--border-color)]
                        bg-[var(--card-bg)]
                        p-0 shadow-sm
                        transition-all duration-300
                        group-hover:-translate-y-1.5
                        group-hover:border-[var(--accent-color)]/40
                        group-hover:shadow-xl
                      "
                    >
                      {/* Capa do testbook */}
                      <div className="relative p-3 pb-0">
                        <div className="
                          relative flex h-44 flex-col justify-between
                          overflow-hidden rounded-[1.1rem]
                          border border-[var(--border-color)]
                          bg-[var(--bg-app)]
                          p-5
                          transition-colors duration-300
                          group-hover:border-[var(--accent-color)]/25
                        ">
                          {/* Elementos decorativos */}
                          <div className="
                            pointer-events-none absolute
                            -right-12 -top-16 size-48
                            rounded-full border border-[var(--accent-color)]/10
                            transition-transform duration-700
                            group-hover:scale-110
                          " />

                          <div className="
                            pointer-events-none absolute
                            -right-6 -top-10 size-32
                            rounded-full border border-[var(--accent-color)]/10
                          " />

                          <div className="
                            pointer-events-none absolute
                            bottom-0 left-0 right-0 h-24
                            bg-gradient-to-t
                            from-[var(--accent-color)]/8 to-transparent
                          " />

                          {/* Identificação */}
                          <div className="relative z-10 flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="
                                rounded-md border-[var(--border-color)]
                                bg-[var(--card-bg)]/70
                                px-2 py-1
                                text-[9px] font-bold uppercase
                                tracking-[0.16em]
                                text-[var(--text-secondary)]
                                backdrop-blur-md
                              "
                            >
                              Technical manual
                            </Badge>

                            <span className="
                              font-mono text-[10px] font-medium
                              tracking-widest
                              text-[var(--text-secondary)]/60
                            ">
                              {String(index + 1).padStart(2, "0")} / 04
                            </span>
                          </div>

                          {/* Símbolo principal */}
                          <div className="relative z-10 flex items-end justify-between">
                            <div className="
                              flex size-[3.75rem] items-center justify-center
                              rounded-2xl
                              border border-[var(--accent-color)]/20
                              bg-[var(--accent-color)]/10
                              shadow-sm
                              transition-all duration-300
                              group-hover:scale-105
                              group-hover:bg-[var(--accent-color)]/15
                            ">
                              <Icon
                                size={29}
                                strokeWidth={1.5}
                                className={testbook.color}
                              />
                            </div>

                            <span className="
                              font-mono text-[10px] font-bold
                              uppercase tracking-[0.2em]
                              text-[var(--text-secondary)]/50
                            ">
                              PODS / TB
                            </span>
                          </div>

                          {/* Número de fundo */}
                          <span className="
                            pointer-events-none absolute
                            bottom-[-2.4rem] right-1
                            select-none
                            text-[8rem] font-black leading-none
                            tracking-tighter
                            text-[var(--accent-color)]/[0.045]
                          ">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Informações */}
                      <CardContent className="flex flex-1 flex-col px-5 pb-3 pt-5">
                        <h3 className="
                          m-0 text-[1.4rem] font-bold
                          tracking-tight
                          text-[var(--text-primary)]
                          transition-colors duration-200
                          group-hover:text-[var(--accent-color)]
                        ">
                          {testbook.title}
                        </h3>

                        <p className="
                          mt-2 mb-0
                          min-h-[4.5rem]
                          text-xs leading-[1.7]
                          text-[var(--text-secondary)]
                        ">
                          {testbook.description}
                        </p>
                      </CardContent>

                      {/* Acesso */}
                      <CardFooter className="px-5 pb-5 pt-2 border-t-0">
                        <div className="
                          flex w-full items-center justify-between
                          
                          pt-4
                        ">
                          <span className="
                            text-[11px] font-semibold
                            text-[var(--text-secondary)]
                            transition-colors duration-200
                            group-hover:text-[var(--text-primary)]
                          ">
                            Explorar documentação
                          </span>

                          <div className="
                            flex size-8 items-center justify-center
                            rounded-full
                            border border-[var(--border-color)]
                            bg-[var(--bg-app)]
                            text-[var(--text-secondary)]
                            transition-all duration-300
                            group-hover:border-[var(--accent-color)]
                            group-hover:bg-[var(--accent-color)]
                            group-hover:text-white
                            group-hover:translate-x-0.5
                          ">
                            <ArrowUpRight size={15} />
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>

          </section>

          {/* Rodapé discreto */}
          <footer className="mt-12 border-t border-[var(--border-color)] pt-5">
            <p className="m-0 text-[10px] text-[var(--text-secondary)]">
              Biblioteca de documentação técnica 
            </p>
          </footer>
        </div>
      </main>
    </PageTransition>
  );
}
