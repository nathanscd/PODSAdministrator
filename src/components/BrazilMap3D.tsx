import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Opportunity } from "../types";
import { Map, Globe2 } from "lucide-react";

// --- CONFIGURAÇÕES DE GEOMETRIA ---
const GEO_URL_BR = "https://code.highcharts.com/mapdata/countries/br/br-all.topo.json";
const GEO_URL_LATAM = "https://code.highcharts.com/mapdata/custom/south-america.topo.json";

// --- COORDENADAS (Adicionei LatAm) ---
const UTILITY_COORDS: Record<string, [number, number]> = {
  // BRASIL
  "CEMIG": [-44.38, -18.51],
  "COPEL": [-51.93, -24.89],
  "CPFL": [-47.06, -22.90],
  "ENEL": [-46.63, -23.55], // SP
  "ENEL CE": [-39.50, -5.00], // Ceará
  "ENEL RJ": [-42.00, -22.00], // RJ
  "NEOENERGIA": [-38.54, -12.97],
  "EQUATORIAL": [-48.49, -1.45],
  "EDP": [-40.33, -20.31],
  "LIGHT": [-43.17, -22.90],
  "ENERGISA": [-56.00, -16.00], 
  "CELESC": [-50.50, -27.26],
  "RGE": [-52.50, -29.00],
  "COELBA": [-41.70, -12.97],
  "CELPE": [-36.00, -8.00],
  "ELEKTRO": [-48.00, -22.00],
  "AMAZONAS": [-60.02, -3.11],
  "RORAIMA": [-60.67, 2.82],
  
  // LATAM (Principais Hubs)
  "ENEL COLOMBIA": [-74.07, 4.71], // Bogota
  "ENEL PERU": [-77.04, -12.04], // Lima
  "ENEL CHILE": [-70.66, -33.44], // Santiago
  "EDESUR": [-58.38, -34.60], // Buenos Aires
  "UTE": [-56.16, -34.90], // Montevideo
  "ANDE": [-57.57, -25.26], // Asuncion
  "CNEL": [-79.88, -2.18], // Guayaquil (Equador)
  "ICE": [-84.09, 9.92], // Costa Rica
  "NATURGY": [-80.1, 8.5], // Panama
};

// Cores dos Grupos (HEX)
const GROUP_COLORS: Record<string, string> = {
  "1st Group": "#10b981", // Verde
  "2nd Group": "#3b82f6", // Azul
  "3rd Group": "#f59e0b", // Laranja
  "Unassigned": "#9ca3af" // Cinza
};

// Mapeamento de responsáveis (Exemplo visual)
const GROUP_MANAGERS: Record<string, string> = {
  "1st Group": "Guilherme Nogueira",
  "2nd Group": "Lígia Taniguchi",
  "3rd Group": "Nathali Sperança",
  "Unassigned": "TBD"
};

interface MapProps {
  opportunities: Opportunity[];
}

export default function GeographicMap3D({ opportunities }: MapProps) {
  const [view, setView] = useState<'BR' | 'LATAM'>('BR');
  const [hoveredMarker, setHoveredMarker] = useState<any | null>(null);

  // Processamento dos dados
  const mapData = useMemo(() => {
    const uniqueUtilities: Record<string, { group: string, value: number, coords: [number, number], manager: string }> = {};

    opportunities.forEach(opp => {
      // Tenta match exato ou parcial
      const utilName = Object.keys(UTILITY_COORDS).find(key => 
        opp.utility?.toUpperCase().includes(key)
      );

      if (utilName) {
        if (!uniqueUtilities[utilName]) {
          const group = opp.technicalSalesGroup || "Unassigned";
          // Limpa o nome do grupo para pegar a chave correta
          const groupKey = Object.keys(GROUP_COLORS).find(k => group.includes(k)) || "Unassigned";
          
          uniqueUtilities[utilName] = {
            group: groupKey,
            manager: GROUP_MANAGERS[groupKey] || "Unknown",
            value: 0,
            coords: UTILITY_COORDS[utilName]
          };
        }
        uniqueUtilities[utilName].value += 1;
      }
    });

    return Object.entries(uniqueUtilities).map(([name, data]) => ({ name, ...data }));
  }, [opportunities]);

  // Configuração de Projeção baseada na View
  const projectionConfig = view === 'BR' 
    ? { scale: 800, center: [-52, -16] as [number, number] } // Foco Brasil
    : { scale: 450, center: [-60, -22] as [number, number] }; // Foco América do Sul

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      height: '100%',
      position: 'relative',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Controles de Visualização */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        zIndex: 50, 
        display: 'flex', 
        gap: '8px',
        background: '#ffffff',
        padding: '4px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => setView('BR')}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: view === 'BR' ? '#000' : 'transparent',
            color: view === 'BR' ? '#fff' : '#000',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Map size={12} /> BRASIL
        </button>
        <button 
          onClick={() => setView('LATAM')}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: view === 'LATAM' ? '#000' : 'transparent',
            color: view === 'LATAM' ? '#fff' : '#000',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Globe2 size={12} /> LATAM
        </button>
      </div>

      {/* Container 3D */}
      <div style={{
        width: '100%',
        height: '600px', // Mais alto
        transform: 'perspective(1200px) rotateX(25deg)', // Leve inclinação (mesa tática)
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s ease',
        position: 'relative'
      }}>
        <ComposableMap 
          projection="geoMercator"
          projectionConfig={projectionConfig}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={projectionConfig.center}>
             {/* Mapa Base */}
            <Geographies geography={view === 'BR' ? GEO_URL_BR : GEO_URL_LATAM}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { 
                        fill: "#e5e7eb", // Cinza claro base
                        stroke: "#fff", 
                        strokeWidth: 0.8, 
                        outline: "none",
                        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.1))" // Sombra em cada estado/país
                      },
                      hover: { fill: "#d1d5db", stroke: "#fff", strokeWidth: 1, outline: "none" },
                      pressed: { fill: "#d1d5db", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Pinos e Conexões */}
            {mapData.map((data) => {
              const color = GROUP_COLORS[data.group] || GROUP_COLORS["Unassigned"];
              const isHovered = hoveredMarker === data.name;
              
              return (
                <Marker 
                  key={data.name} 
                  coordinates={data.coords}
                  onMouseEnter={() => setHoveredMarker(data.name)}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  {/* Sombra no chão */}
                  <circle r={4} fill="rgba(0,0,0,0.2)" transform="scale(1, 0.4) translate(0, 10)" />
                  
                  {/* Haste do Pino */}
                  <line 
                    x1={0} y1={0} x2={0} y2={-25} 
                    stroke={color} 
                    strokeWidth={isHovered ? 3 : 2} 
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  {/* Cabeça do Pino */}
                  <circle 
                    r={isHovered ? 8 : 5} 
                    cy={-25} 
                    fill={color} 
                    stroke="#fff" 
                    strokeWidth={2}
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Label Estático (Sempre visível, mas discreto) */}
                  {!isHovered && (
                    <text
                      textAnchor="middle"
                      y={-38}
                      style={{ 
                        fontFamily: "sans-serif", 
                        fontSize: "8px", 
                        fill: "#4b5563", 
                        fontWeight: "900",
                        textShadow: "0px 0px 3px #fff",
                        pointerEvents: 'none'
                      }}
                    >
                      {data.name}
                    </text>
                  )}

                  {/* MODAL / TOOLTIP FLUTUANTE NO HOVER */}
                  {isHovered && (
                    <g transform="translate(15, -60)">
                      {/* Fundo do Tooltip */}
                      <rect 
                        x={0} y={0} 
                        width={140} height={65} 
                        rx={8} 
                        fill="#ffffff" 
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.2))" }}
                      />
                      
                      {/* Conteúdo de Texto */}
                      <text x={10} y={20} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }}>
                        {data.name}
                      </text>
                      
                      <text x={10} y={35} style={{ fontSize: '8px', fill: '#6b7280' }}>
                        Group: <tspan fill={color} fontWeight="bold">{data.group}</tspan>
                      </text>
                      
                      <text x={10} y={50} style={{ fontSize: '8px', fill: '#6b7280' }}>
                        Manager: <tspan fontWeight="bold" fill="#000">{data.manager}</tspan>
                      </text>
                    </g>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legenda */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        marginTop: '-20px', 
        zIndex: 10,
        background: 'rgba(255,255,255,0.8)',
        padding: '10px 20px',
        borderRadius: '20px',
        backdropFilter: 'blur(5px)'
      }}>
        {Object.entries(GROUP_COLORS).map(([group, color]) => (
          <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', letterSpacing: '0.05em' }}>{group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}