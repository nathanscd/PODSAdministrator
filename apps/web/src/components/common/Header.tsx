"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[10000] transition-all duration-1000 ease-in-out animate-in fade-in duration-[2000ms] ${
        scrolled
          ? "bg-white/85 text-white backdrop-blur-md border-b border-[#C5A46D]/15"
          : "bg-transparent text-black border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1400px] mx-auto flex justify-between items-center px-[3vw] py-[0.4rem]">
        
        <div className="flex items-center">
          <Link
            href="/"
            className="font-primary text-black text-[1.3vw] transition-opacity duration-400 opacity-100 hover:opacity-50"
          >
            HEPHAESTUS
          </Link>
        </div>

        <div className="flex items-center gap-6">
          
          <div className="relative group/nav">
            <span className="px-4 py-2 text-black font-sans text-[0.75rem] font-normal tracking-[0.15em] uppercase transition-colors duration-300 flex items-center cursor-crosshair group-hover/nav:text-[#C5A46D]">
              Arsenal
            </span>
            
            <div className="absolute -mt-[0.8vh] top-full left-1/2 -translate-x-1/2 translate-y-[12px] scale-[0.98] w-[850px] rounded-[4px] bg-[#0A0A0A] border border-[#C5A46D]/15 shadow-[0_40px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(0,0,0,1)] opacity-0 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden blur-[8px] before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-[8px] group-hover/nav:scale-100 group-hover/nav:blur-0">
              <div className="flex flex-col">
                <div className="flex bg-[#0A0A0A]">
                  
                  <div className="flex-1 p-[2.5rem] border-r border-dashed border-[#C5A46D]/15 flex flex-col gap-[2.5rem] last:border-r-0">
                    <Link href="/athena" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        SYS.001
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Athena
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Business intelligence impulsionada por IA e linguagem
                      </span>
                    </Link>
                    <Link href="/atlas" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        SYS.004
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Atlas
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Monitoramento de infraestrutura e visibilidade operacional
                      </span>
                    </Link>
                  </div>
                  
                  <div className="flex-1 p-[2.5rem] border-r border-dashed border-[#C5A46D]/15 flex flex-col gap-[2.5rem] last:border-r-0">
                    <Link href="/hephaestus" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        SYS.002
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Hephaestus
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Crie fluxos de trabalho inteligentes conectando sistemas
                      </span>
                    </Link>
                    <Link href="/orion" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        SYS.005
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Orion
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Visualize, monitore e controle toda sua operação em tempo real
                      </span>
                    </Link>
                  </div>

                  <div className="flex-1 p-[2.5rem] border-r border-dashed border-[#C5A46D]/15 flex flex-col gap-[2.5rem] last:border-r-0">
                    <Link href="/hermes" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        SYS.003
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Hermes
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Integrações de dados fluidas para toda a sua operação
                      </span>
                    </Link>
                  </div>
                  
                </div>
                
                <div className="flex justify-between items-center px-[2.5rem] py-[1.5rem] bg-[#050505] border-t border-[#C5A46D]/15">
                  <span className="text-[#7C7C7C] font-sans text-[0.7rem] tracking-[0.2em] font-medium uppercase">
                    NEW: AI AGENT PROPERTIES
                  </span>
                  <Link href="/changelog" className="text-[#C5A46D] font-['UnifrakturMaguntia',_cursive] text-[1.2rem] transition-all duration-300 cursor-crosshair hover:text-white hover:translate-x-[4px]">
                    Ver Manuscritos &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group/nav">
            <span className="px-4 py-2 text-black font-sans text-[0.75rem] font-normal tracking-[0.15em] uppercase transition-colors duration-300 flex items-center cursor-crosshair group-hover/nav:text-[#C5A46D]">
              Ordem
            </span>
            
            <div className="absolute -mt-[0.8vh] top-full left-1/2 -translate-x-1/2 translate-y-[12px] scale-[0.98] w-[650px] rounded-[4px] bg-[#0A0A0A] border border-[#C5A46D]/15 shadow-[0_40px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(0,0,0,1)] opacity-0 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden blur-[8px] before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-[8px] group-hover/nav:scale-100 group-hover/nav:blur-0">
              <div className="flex flex-col">
                <div className="flex bg-[#0A0A0A]">
                  
                  <div className="flex-1 p-[2.5rem] border-r border-dashed border-[#C5A46D]/15 flex flex-col gap-[2.5rem] last:border-r-0">
                    <Link href="/philosophy" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        ORG.01
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Filosofia
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Engineering beyond traditional software
                      </span>
                    </Link>
                    <Link href="/careers" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        ORG.03
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Carreiras
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Join the team building the next era of tech
                      </span>
                    </Link>
                  </div>
                  
                  <div className="flex-1 p-[2.5rem] border-r border-dashed border-[#C5A46D]/15 flex flex-col gap-[2.5rem] last:border-r-0">
                    <Link href="/process" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        ORG.02
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Processo
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        How we design, build and scale systems
                      </span>
                    </Link>
                    <Link href="/manifesto" className="flex flex-col transition-transform duration-300 hover:translate-x-[6px] cursor-crosshair group/card">
                      <span className="text-[#8B1E16] font-sans text-[0.7rem] tracking-[0.25em] mb-[0.8rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        ORG.04
                      </span>
                      <span className="text-[#fff1d8] font-['UnifrakturMaguntia',_cursive] text-[1.8rem] leading-[1.1] mb-[0.5rem] transition-colors duration-300 group-hover/card:text-[#C5A46D]">
                        Manifesto
                      </span>
                      <span className="text-[#7C7C7C] font-sans text-[0.85rem] leading-[1.5] transition-colors duration-300 group-hover/card:text-[#fff1d8]">
                        Leaving the Dark Ages of operations behind
                      </span>
                    </Link>
                  </div>
                  
                </div>
                
                <div className="flex justify-between items-center px-[2.5rem] py-[1.5rem] bg-[#050505] border-t border-[#C5A46D]/15">
                  <span className="text-[#7C7C7C] font-sans text-[0.7rem] tracking-[0.2em] font-medium uppercase">
                    OUR STORY
                  </span>
                  <Link href="/about" className="text-[#C5A46D] font-['UnifrakturMaguntia',_cursive] text-[1.2rem] transition-all duration-300 cursor-crosshair hover:text-white hover:translate-x-[4px]">
                    Os Fundamentos &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center">
          <Link
            href="/contact"
            className="px-[2.2rem] py-[0.8rem] bg-transparent text-[#C5A46D] border border-[#C5A46D] rounded-[2px] font-sans text-[0.75rem] tracking-[0.2em] uppercase cursor-crosshair transition-all duration-500 hover:bg-[#C5A46D] hover:text-black hover:-translate-y-[2px] hover:shadow-[0_10px_25px_rgba(197,164,109,0.2)]"
          >
            Entre em Contato
          </Link>
        </div>

      </nav>
    </header>
  );
};

export default Header;