import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Box, Rocket, Globe } from 'lucide-react';

// Custom crisp SVG for Copyright / Patent icon
const CopyrightIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9.5" />
    <path d="M14.5 9.2a3.5 3.5 0 1 0 0 5.6c1.1 0 2-.6 2.5-1.4" />
  </svg>
);

// Custom crisp SVG for 3-person Team Silhouette matching reference icon
const TeamSilhouetteIcon = ({ className = "w-6 h-6 text-white", fill = "currentColor" }) => (
  <svg viewBox="0 0 36 28" fill={fill} className={className}>
    {/* Center figure */}
    <circle cx="18" cy="7" r="4.5" />
    <path d="M11 22c0-3.5 3.1-6 7-6s7 2.5 7 6v2H11v-2z" />
    {/* Left figure */}
    <circle cx="8" cy="9.5" r="3.5" />
    <path d="M3 23c0-2.8 2.5-5 5.5-5 .8 0 1.6.2 2.3.5-.8 1.1-1.3 2.5-1.3 4v1.5H3V23z" />
    {/* Right figure */}
    <circle cx="28" cy="9.5" r="3.5" />
    <path d="M26.5 24v-1.5c0-1.5-.5-2.9-1.3-4 .7-.3 1.5-.5 2.3-.5 3 0 5.5 2.2 5.5 5v1h-6.5z" />
  </svg>
);

// 3 Left Pathways (Cards 1, 3, 5)
const LEFT_PATHWAYS = [
  {
    id: 1,
    idx: 0,
    title: 'Research & Publication',
    desc: 'Guidance for documentation and research opportunities',
    accentColor: '#f43f5e',
    titleColor: 'text-[#e11d48]',
    cardBg: 'bg-[#fff0f3]',
    borderColor: 'border-[#fecdd3]',
    hoverBorder: 'hover:border-[#fda4af]',
    iconBg: 'bg-[#f43f5e]',
    icon: FileText,
    isCustomIcon: false,
  },
  {
    id: 3,
    idx: 1,
    title: 'Product Development',
    desc: 'Support for prototype to product journey',
    accentColor: '#10b981',
    titleColor: 'text-[#059669]',
    cardBg: 'bg-[#edfbf4]',
    borderColor: 'border-[#a7f3d0]',
    hoverBorder: 'hover:border-[#6ee7b7]',
    iconBg: 'bg-[#059669]',
    icon: Box,
    isCustomIcon: false,
  },
  {
    id: 5,
    idx: 2,
    title: 'Internship & Experiential Learning',
    desc: 'Opportunities for internships and real-world exposure',
    accentColor: '#8b5cf6',
    titleColor: 'text-[#7c3aed]',
    cardBg: 'bg-[#f6f2fe]',
    borderColor: 'border-[#ddd6fe]',
    hoverBorder: 'hover:border-[#c4b5fd]',
    iconBg: 'bg-[#7c3aed]',
    icon: TeamSilhouetteIcon,
    isCustomIcon: true,
  },
];

// 3 Right Pathways (Cards 2, 4, 6)
const RIGHT_PATHWAYS = [
  {
    id: 2,
    idx: 3,
    title: 'Intellectual Property & Patent',
    desc: 'Orientation and support for IP pathways',
    accentColor: '#f97316',
    titleColor: 'text-[#ea580c]',
    cardBg: 'bg-[#fff6ee]',
    borderColor: 'border-[#fed7aa]',
    hoverBorder: 'hover:border-[#fdba74]',
    iconBg: 'bg-[#ea580c]',
    icon: CopyrightIcon,
    isCustomIcon: true,
  },
  {
    id: 4,
    idx: 4,
    title: 'Incubation & Entrepreneurship',
    desc: 'Connection to incubators and innovation partners',
    accentColor: '#22c55e',
    titleColor: 'text-[#16a34a]',
    cardBg: 'bg-[#f0faf2]',
    borderColor: 'border-[#bbf7d0]',
    hoverBorder: 'hover:border-[#86efac]',
    iconBg: 'bg-[#16a34a]',
    icon: Rocket,
    isCustomIcon: false,
  },
  {
    id: 6,
    idx: 5,
    title: 'National & International Showcase',
    desc: 'Preparation for relevant national and global platforms (e.g. UN AI for Good)',
    accentColor: '#0284c7',
    titleColor: 'text-[#0284c7]',
    cardBg: 'bg-[#edf6fd]',
    borderColor: 'border-[#bae6fd]',
    hoverBorder: 'hover:border-[#7dd3fc]',
    iconBg: 'bg-[#0284c7]',
    icon: Globe,
    isCustomIcon: false,
  },
];

// Ordered for 2-column mobile grid: Row 1 (1 & 2), Row 2 (3 & 4), Row 3 (5 & 6)
const MOBILE_PATHWAYS = [
  LEFT_PATHWAYS[0],
  RIGHT_PATHWAYS[0],
  LEFT_PATHWAYS[1],
  RIGHT_PATHWAYS[1],
  LEFT_PATHWAYS[2],
  RIGHT_PATHWAYS[2],
];

// Desktop Card Component
const DesktopPathwayCard = ({ pathway }) => {
  const Icon = pathway.icon;
  return (
    <div
      className={`w-full rounded-2xl ${pathway.cardBg} border ${pathway.borderColor} ${pathway.hoverBorder} p-3.5 lg:p-4 flex items-center gap-3.5 lg:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group cursor-default relative`}
    >
      <div
        className={`w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 rounded-full ${pathway.iconBg} flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105`}
      >
        {pathway.isCustomIcon ? (
          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="white" />
        ) : (
          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.4} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-sm lg:text-[15px] xl:text-base leading-snug tracking-tight ${pathway.titleColor}`}>
          {pathway.title}
        </h3>
        <p className="text-xs lg:text-[13px] text-slate-600 mt-1 leading-relaxed font-normal">
          {pathway.desc}
        </p>
      </div>
    </div>
  );
};

// Mobile Card Component (Compact 2-col)
const MobilePathwayCard = ({ pathway }) => {
  const Icon = pathway.icon;
  return (
    <div
      className={`w-full rounded-xl ${pathway.cardBg} border ${pathway.borderColor} p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 shadow-xs`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-full ${pathway.iconBg} flex items-center justify-center shadow-xs`}
        >
          {pathway.isCustomIcon ? (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
          ) : (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.4} />
          )}
        </div>
        <h3 className={`font-bold text-xs sm:text-sm leading-tight tracking-tight ${pathway.titleColor}`}>
          {pathway.title}
        </h3>
      </div>
      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
        {pathway.desc}
      </p>
    </div>
  );
};

const InnovationPathways = () => {
  const containerRef = useRef(null);
  const cardWrapperRefs = useRef([]);
  const centerRef = useRef(null);
  const [connectors, setConnectors] = useState([]);

  // Calculate pixel-exact connector lines and endpoint dots
  const calculateConnectors = useCallback(() => {
    if (!containerRef.current || !centerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerRect = centerRef.current.getBoundingClientRect();

    if (containerRect.width === 0 || centerRect.width === 0) return;

    const centerX = centerRect.left + centerRect.width / 2 - containerRect.left;
    const centerY = centerRect.top + centerRect.height / 2 - containerRect.top;
    const ringRadius = centerRect.width / 2;

    const items = [
      { idx: 0, isLeft: true, color: '#f43f5e' },
      { idx: 1, isLeft: true, color: '#10b981' },
      { idx: 2, isLeft: true, color: '#8b5cf6' },
      { idx: 3, isLeft: false, color: '#f97316' },
      { idx: 4, isLeft: false, color: '#22c55e' },
      { idx: 5, isLeft: false, color: '#0284c7' },
    ];

    const lines = [];

    items.forEach(({ idx, isLeft, color }) => {
      const cardEl = cardWrapperRefs.current[idx];
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();

      // Anchor point on the card's inner edge (right for left cards, left for right cards)
      const startX = isLeft
        ? cardRect.right - containerRect.left + 2
        : cardRect.left - containerRect.left - 2;

      let startY = cardRect.top + cardRect.height / 2 - containerRect.top;

      // Ensure middle cards (Product & Incubation) are perfectly horizontal
      if (idx === 1 || idx === 4) {
        if (Math.abs(startY - centerY) < 10) {
          startY = centerY;
        }
      }

      // Calculate perimeter intersection on the central circle's outer ring
      const theta = Math.atan2(startY - centerY, startX - centerX);
      const endX = centerX + ringRadius * Math.cos(theta);
      const endY = centerY + ringRadius * Math.sin(theta);

      lines.push({
        id: idx,
        startX,
        startY,
        endX,
        endY,
        color,
      });
    });

    setConnectors(lines);
  }, []);

  useEffect(() => {
    calculateConnectors();
    const timer = setTimeout(calculateConnectors, 60);

    const handleResize = () => {
      requestAnimationFrame(calculateConnectors);
    };

    window.addEventListener('resize', handleResize);

    let ro;
    if (containerRef.current && window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        requestAnimationFrame(calculateConnectors);
      });
      ro.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [calculateConnectors]);

  return (
    <section className="py-16 md:py-20 bg-[#faf8f5] border-b border-slate-200/80 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Reference-Styled Graphic Card Frame */}
        <div className="bg-white rounded-3xl border-2 border-[#cde4f7] shadow-xl shadow-slate-900/5 p-6 sm:p-8 lg:p-10 xl:p-12 relative">
          
          {/* Header (Top-Left aligned as shown in reference) */}
          <div className="mb-8 lg:mb-10 text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0a2540] tracking-tight leading-tight">
              Innovation Acceleration Pathways
            </h2>
            <p className="mt-1 text-sm sm:text-base lg:text-lg font-medium text-[#1e3a8a]/85">
              For selected high-potential projects
            </p>
          </div>

          {/* DESKTOP & TABLET VIEW: 3 Left Cards, Center Concept Circle, 3 Right Cards */}
          <div className="hidden md:block">
            <div ref={containerRef} className="relative w-full">
              {/* SVG Connector Lines Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ overflow: 'visible' }}
              >
                {connectors.map((conn) => (
                  <g key={conn.id}>
                    {/* Connection Line */}
                    <line
                      x1={conn.startX}
                      y1={conn.startY}
                      x2={conn.endX}
                      y2={conn.endY}
                      stroke={conn.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Card Endpoint Dot */}
                    <circle
                      cx={conn.startX}
                      cy={conn.startY}
                      r="4.5"
                      fill={conn.color}
                    />
                    {/* Circle Endpoint Dot */}
                    <circle
                      cx={conn.endX}
                      cy={conn.endY}
                      r="4.5"
                      fill={conn.color}
                    />
                  </g>
                ))}
              </svg>

              {/* 3-Column Visual Layout */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-6 lg:gap-x-12 xl:gap-x-16 items-center">
                {/* LEFT COLUMN: Pathways 1, 3, 5 */}
                <div className="flex flex-col gap-4 lg:gap-5 justify-between">
                  {LEFT_PATHWAYS.map((pathway) => (
                    <div
                      key={pathway.id}
                      ref={(el) => (cardWrapperRefs.current[pathway.idx] = el)}
                      className="w-full relative"
                    >
                      <DesktopPathwayCard pathway={pathway} />
                    </div>
                  ))}
                </div>

                {/* CENTER COLUMN: Central Concept Circle */}
                <div className="flex items-center justify-center px-1">
                  <div
                    ref={centerRef}
                    className="w-[185px] h-[185px] lg:w-[210px] lg:h-[210px] xl:w-[220px] xl:h-[220px] rounded-full border-2 border-[#bae6fd] bg-[#e8f4fc]/80 p-2.5 lg:p-3.5 flex items-center justify-center relative flex-shrink-0 shadow-md shadow-sky-500/10"
                  >
                    <div className="w-full h-full rounded-full bg-white border border-sky-100/90 shadow-sm flex flex-col items-center justify-center text-center p-3">
                      <TeamSilhouetteIcon
                        className="w-9 h-9 lg:w-11 lg:h-11 text-[#0a2540] mb-1.5"
                        fill="#0a2540"
                      />
                      <span className="text-[11px] lg:text-xs font-bold text-[#0a2540] leading-tight">
                        Selected
                      </span>
                      <span className="text-xs lg:text-sm xl:text-[15px] font-black text-[#0a2540] leading-tight tracking-tight">
                        High-Potential
                      </span>
                      <span className="text-[11px] lg:text-xs font-bold text-[#0a2540] leading-tight">
                        Student Projects
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Pathways 2, 4, 6 */}
                <div className="flex flex-col gap-4 lg:gap-5 justify-between">
                  {RIGHT_PATHWAYS.map((pathway) => (
                    <div
                      key={pathway.id}
                      ref={(el) => (cardWrapperRefs.current[pathway.idx] = el)}
                      className="w-full relative"
                    >
                      <DesktopPathwayCard pathway={pathway} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW (< 768px): Central Concept on Top + 2 Cards Per Row Grid */}
          <div className="block md:hidden">
            {/* Prominent Central Concept Circle */}
            <div className="flex justify-center mb-6">
              <div className="w-[165px] h-[165px] rounded-full border-2 border-[#bae6fd] bg-[#e8f4fc]/80 p-2 flex items-center justify-center shadow-sm">
                <div className="w-full h-full rounded-full bg-white border border-sky-100 shadow-sm flex flex-col items-center justify-center text-center p-2.5">
                  <TeamSilhouetteIcon className="w-8 h-8 text-[#0a2540] mb-1" fill="#0a2540" />
                  <span className="text-[11px] font-bold text-[#0a2540] leading-tight">
                    Selected
                  </span>
                  <span className="text-xs font-black text-[#0a2540] leading-tight">
                    High-Potential
                  </span>
                  <span className="text-[11px] font-bold text-[#0a2540] leading-tight">
                    Student Projects
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Cards-Per-Row Mobile Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              {MOBILE_PATHWAYS.map((pathway) => (
                <MobilePathwayCard key={pathway.id} pathway={pathway} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InnovationPathways;
