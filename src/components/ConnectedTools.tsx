import React, { useEffect, useRef, useState, useId, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, X } from 'lucide-react';

interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  color: string;
  badgeBg: string;
  detail: string;
  lane: number; // 0 (top), 1 (middle), 2 (bottom)
  laneOffsetRatio: number; // 0 to 1 position within its lane
  speed: number; // horizontal speed (px per second)
  floatAmp: number; // vertical sinusoidal float amplitude in px
  floatFreq: number; // vertical float frequency
  floatPhase: number; // phase offset
  svg: React.ReactNode;
}

const TOOLS: ToolDefinition[] = [
  // Lane 0: Top band
  {
    id: 'google',
    name: 'Google',
    category: 'Sheets & Drive Sync',
    color: '#4285F4',
    badgeBg: 'rgba(66, 133, 244, 0.14)',
    detail: 'Continuous spreadsheet exports and cloud ledger backup',
    lane: 0,
    laneOffsetRatio: 0.05,
    speed: 26,
    floatAmp: 6,
    floatFreq: 0.0016,
    floatPhase: 0.2,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    )
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce & Inventory',
    color: '#95BF47',
    badgeBg: 'rgba(149, 191, 71, 0.14)',
    detail: 'Automated order ingestion and live stock deductions',
    lane: 0,
    laneOffsetRatio: 0.38,
    speed: 26,
    floatAmp: 7,
    floatFreq: 0.0014,
    floatPhase: 2.1,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#95BF47" d="M15.337 2.058c-.027-.12-.132-.2-.25-.2h-2.115c-.035 0-.07.01-.1.028-.03.018-.052.045-.065.077L11.5 5.093c-.025.062-.015.132.025.185.04.052.103.083.17.083h2.645c.105 0 .197-.07.225-.172l.772-3.23zM9.414 7.643l.86 3.655 2.84-5.918H11.37c-.12 0-.228.077-.26.195l-1.696 2.068zm-4.32 1.45L2.05 18.25c-.04.135.03.275.165.315.025.008.05.012.075.012h17.42c.14 0 .25-.11.25-.25 0-.025-.004-.05-.012-.075l-3.044-9.16-4.664 9.72c-.04.08-.12.13-.21.13-.09 0-.17-.05-.21-.13L7.75 9.093H5.094z"/>
      </svg>
    )
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Selling & DM Orders',
    color: '#E1306C',
    badgeBg: 'rgba(225, 48, 108, 0.14)',
    detail: 'Direct message checkout parsing and customer catalog tagging',
    lane: 0,
    laneOffsetRatio: 0.72,
    speed: 26,
    floatAmp: 6,
    floatFreq: 0.0018,
    floatPhase: 4.2,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="igGradConst" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="25%" stopColor="#e6683c"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="75%" stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <path fill="url(#igGradConst)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },

  // Lane 1: Middle band
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Conversational Voice & Chat',
    color: '#25D366',
    badgeBg: 'rgba(37, 211, 102, 0.14)',
    detail: 'Core natural language sales, voice note, and order parsing',
    lane: 1,
    laneOffsetRatio: 0.12,
    speed: 21,
    floatAmp: 7,
    floatFreq: 0.0013,
    floatPhase: 1.2,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.062-1.892-.452-1.579-.646-2.59-2.24-2.67-2.343-.077-.104-.633-.843-.633-1.606 0-.762.399-1.139.541-1.29.143-.153.312-.191.417-.191.104 0 .208.002.298.006.096.005.223-.037.35.267.13.312.445 1.085.484 1.164.039.078.065.17.013.273-.052.104-.078.169-.156.26-.078.091-.163.203-.234.273-.078.077-.16.16-.068.318.091.157.406.67.87 1.084.598.533 1.102.698 1.26.776.157.078.248.065.34-.039.091-.104.391-.455.495-.611.104-.156.208-.13.35-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.177L2 22l4.981-1.399A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    )
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Global Card Payments',
    color: '#635BFF',
    badgeBg: 'rgba(99, 91, 255, 0.14)',
    detail: 'International card gateway settlement and payout reconciliation',
    lane: 1,
    laneOffsetRatio: 0.42,
    speed: 21,
    floatAmp: 6,
    floatFreq: 0.0015,
    floatPhase: 3.4,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#635BFF" d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.873 15.016.4 12.355.4 6.887.4 3.09 3.276 3.09 8.214c0 4.907 3.829 6.275 6.942 7.423 2.502.925 3.356 1.695 3.356 2.664 0 .979-.869 1.453-2.19 1.453-2.227 0-5.074-1.023-6.852-1.996l-.924 5.617c1.942.858 4.887 1.426 7.742 1.426 5.698 0 9.807-2.697 9.807-7.904 0-4.646-3.568-6.326-6.995-7.747z"/>
      </svg>
    )
  },
  {
    id: 'x',
    name: 'X',
    category: 'Commercial Announcements',
    color: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.12)',
    detail: 'Public product drops and community business feedback tracking',
    lane: 1,
    laneOffsetRatio: 0.69,
    speed: 21,
    floatAmp: 8,
    floatFreq: 0.0017,
    floatPhase: 0.8,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Team & Dispatch Alerts',
    color: '#ECB22E',
    badgeBg: 'rgba(236, 178, 46, 0.14)',
    detail: 'Real-time order notifications, stock triggers, and low balance pings',
    lane: 1,
    laneOffsetRatio: 0.94,
    speed: 21,
    floatAmp: 6,
    floatFreq: 0.0014,
    floatPhase: 5.1,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#36C5F0" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
        <path fill="#2EB67D" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
        <path fill="#ECB22E" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
        <path fill="#E01E5A" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    )
  },

  // Lane 2: Bottom band
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'Cross-Border Invoicing',
    color: '#0079C1',
    badgeBg: 'rgba(0, 121, 193, 0.14)',
    detail: 'Diaspora remittance matching and overseas merchant payment receipt',
    lane: 2,
    laneOffsetRatio: 0.18,
    speed: 24,
    floatAmp: 6,
    floatFreq: 0.0016,
    floatPhase: 2.8,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#003087" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.472a.855.855 0 0 1 .843-.72h6.81c3.55 0 6.068 1.488 5.617 5.097-.478 3.822-3.167 5.787-6.52 5.787H9.288a.855.855 0 0 0-.843.72l-1.369 8.081z"/>
        <path fill="#0079C1" d="M19.167 7.73c-.565 4.516-3.743 6.84-7.705 6.84H8.47a.855.855 0 0 0-.844.72l-1.368 8.081a.641.641 0 0 0 .633.74h4.154a.855.855 0 0 0 .843-.72l.745-4.402a.855.855 0 0 1 .843-.72h1.61c3.55 0 6.33-1.442 7.142-5.467.34-1.688.084-3.15-.86-4.072"/>
      </svg>
    )
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'Relational Operations',
    color: '#FCB400',
    badgeBg: 'rgba(252, 180, 0, 0.14)',
    detail: '2-way syncing for custom supplier catalogs, SKUs, and field agents',
    lane: 2,
    laneOffsetRatio: 0.54,
    speed: 24,
    floatAmp: 7,
    floatFreq: 0.0012,
    floatPhase: 0.6,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#FCB400" d="M11.667 2.054L2.833 6.036c-.496.224-.833.72-.833 1.267v8.94c0 .546.337 1.042.833 1.267l8.834 3.982c.21.095.44.143.667.143V2.054a1.7 1.7 0 0 0-.667.0z"/>
        <path fill="#18BFFF" d="M12.333 2.054v21.574c.227 0 .457-.048.667-.143l8.834-3.982c.496-.225.833-.721.833-1.267v-8.94c0-.547-.337-1.043-.833-1.267L13 2.054a1.7 1.7 0 0 0-.667 0z"/>
        <path fill="#F82B60" d="M12 12.825l8.833-3.982L12 4.861 3.167 8.843 12 12.825z"/>
      </svg>
    )
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'General Ledger Sync',
    color: '#2CA01C',
    badgeBg: 'rgba(44, 160, 28, 0.14)',
    detail: 'Bi-directional chartered accountant reconciliation and tax summaries',
    lane: 2,
    laneOffsetRatio: 0.88,
    speed: 24,
    floatAmp: 6,
    floatFreq: 0.0015,
    floatPhase: 4.0,
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#2CA01C" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.8 17.4c-3.1 0-5.4-2.2-5.4-5.4s2.3-5.4 5.4-5.4c1.6 0 3 .6 4.1 1.7l-1.8 1.8c-.6-.6-1.4-.9-2.3-.9-1.7 0-3 1.3-3 3s1.3 3 3 3c.9 0 1.7-.3 2.3-.9l1.8 1.8c-1.1 1-2.5 1.7-4.1 1.7zm5.6-3.8l-1.8-1.8c.6-.6 1.4-.9 2.3-.9 1.7 0 3 1.3 3 3s-1.3 3-3 3c-.9 0-1.7-.3-2.3-.9l1.8-1.8c.2.2.3.4.6.4.6 0 1-.4 1-1s-.4-1-1-1c-.2 0-.4.1-.6.3z"/>
      </svg>
    )
  },
];

// Potential network pairs across adjacent lanes to evaluate proximity
const POTENTIAL_LINKS: [number, number][] = [
  [0, 3], // Google <-> WhatsApp
  [1, 4], // Shopify <-> Stripe
  [2, 5], // Instagram <-> X
  [3, 7], // WhatsApp <-> PayPal
  [4, 8], // Stripe <-> Airtable
  [5, 9], // X <-> QuickBooks
  [3, 4], // WhatsApp <-> Stripe
  [4, 5], // Stripe <-> X
  [5, 6], // X <-> Slack
  [7, 8], // PayPal <-> Airtable
  [8, 9], // Airtable <-> QuickBooks
  [1, 2], // Shopify <-> Instagram
  [0, 1], // Google <-> Shopify
];

export const ConnectedTools: React.FC = () => {
  const { isDark } = useTheme();
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const svgPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const activeNodeRef = useRef<string | null>(null);
  activeNodeRef.current = activeNodeId;

  // Active detail modal/drawer on mobile for tapped tool
  const [mobileDetailTool, setMobileDetailTool] = useState<ToolDefinition | null>(null);

  // Accessible unique ID for section ARIA
  const sectionTitleId = useId();

  // Keep track of horizontal positions in world coordinates for seamless drift
  // Initialize each node's x offset based on laneOffsetRatio
  const worldOffsetsRef = useRef<number[]>(TOOLS.map(() => 0));
  const lastTimeRef = useRef<number | null>(null);

  // Smooth continuous animation loop
  useEffect(() => {
    let animId: number;

    const animate = (timestamp: number) => {
      const stage = stageRef.current;
      if (!stage) {
        animId = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaSec = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const rect = stage.getBoundingClientRect();
      const stageW = rect.width || 900;
      const stageH = rect.height || 300;

      // Safe virtual wrap boundaries so nodes glide seamlessly across viewport
      const wrapBuffer = 120; // px past the edges before wrapping
      const virtualWidth = stageW + wrapBuffer * 2;

      // Lane heights (3 distinct horizontal channels)
      const laneYMap = [
        stageH * 0.18, // Lane 0
        stageH * 0.50, // Lane 1
        stageH * 0.82, // Lane 2
      ];

      const currentCoords: { x: number; y: number }[] = [];

      for (let i = 0; i < TOOLS.length; i++) {
        const tool = TOOLS[i];
        const isHovered = activeNodeRef.current === tool.id;

        // Slow down smoothly when inspected/hovered
        const speedMultiplier = isHovered ? 0.08 : 1.0;
        worldOffsetsRef.current[i] += tool.speed * speedMultiplier * deltaSec;

        // Calculate continuous wrapped X position
        const initialX = tool.laneOffsetRatio * virtualWidth;
        const rawX = (initialX + worldOffsetsRef.current[i]) % virtualWidth;
        const posX = rawX - wrapBuffer;

        // Gentle sinusoidal vertical float: shifts vertically by a few pixels organically
        const laneBaseY = laneYMap[tool.lane];
        const floatY = Math.sin(timestamp * tool.floatFreq + tool.floatPhase) * tool.floatAmp;
        const posY = laneBaseY + floatY;

        currentCoords.push({ x: posX, y: posY });

        // Update DOM transform directly without React re-render for 60fps performance
        const nodeEl = nodeRefs.current[i];
        if (nodeEl) {
          nodeEl.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0)`;
        }
      }

      // Dynamic proximity-based data-flow lines between nearby nodes
      for (let l = 0; l < POTENTIAL_LINKS.length; l++) {
        const [aIdx, bIdx] = POTENTIAL_LINKS[l];
        const p1 = currentCoords[aIdx];
        const p2 = currentCoords[bIdx];
        const pathEl = svgPathsRef.current[l];
        const pulseEl = pulseRefs.current[l];

        if (p1 && p2 && pathEl) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Proximity threshold: show connection when within 250px
          const maxDist = 250;
          if (dist < maxDist && p1.x > -40 && p1.x < stageW + 40 && p2.x > -40 && p2.x < stageW + 40) {
            const opacity = Math.max(0, 1 - dist / maxDist) * 0.75;
            pathEl.style.opacity = opacity.toFixed(3);

            // Subtle curved line
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 12;
            const d = `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
            pathEl.setAttribute('d', d);

            if (pulseEl) {
              pulseEl.style.opacity = (opacity * 1.2).toFixed(3);
              const t = ((timestamp * 0.0006 + l * 0.17) % 1);
              const oneMinusT = 1 - t;
              const px = oneMinusT * oneMinusT * p1.x + 2 * oneMinusT * t * midX + t * t * p2.x;
              const py = oneMinusT * oneMinusT * p1.y + 2 * oneMinusT * t * midY + t * t * p2.y;
              pulseEl.setAttribute('cx', px.toFixed(1));
              pulseEl.setAttribute('cy', py.toFixed(1));
            }
          } else {
            pathEl.style.opacity = '0';
            if (pulseEl) {
              pulseEl.style.opacity = '0';
            }
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section
      aria-labelledby={sectionTitleId}
      className={`py-20 sm:py-28 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#08110F] text-white border-[#182E26]' : 'bg-[#FFFFFF] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      {/* Background ambient lighting */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-30' : 'bg-grid-light opacity-50'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[340px] rounded-full blur-[140px] pointer-events-none ${
        isDark ? 'bg-[#B8F36B]/5' : 'bg-[#B8F36B]/15'
      }`} />

      {/* Header Container */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center">
        {/* Eyebrow in Kopa Blue / Soft Slate */}
        <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
          isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#60A5FA]' : 'bg-[#2563EB]'}`} />
          <span>BUILT TO CONNECT WITH THE TOOLS YOUR BUSINESS ALREADY USES</span>
        </div>

        {/* Section Heading in Manrope */}
        <h2 
          id={sectionTitleId}
          className={`text-2xl sm:text-4xl lg:text-[2.75rem] font-heading font-semibold tracking-tight leading-[1.15] mb-3 ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}
          style={{ textWrap: 'balance' }}
        >
          Works with the tools your business already uses.
        </h2>

        {/* Minimal Subtitle in Manrope */}
        <p className={`text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-[#475569]'
        }`}>
          Kopa is architected to seamlessly unify your everyday commercial activity across the platforms you already rely on.
        </p>
      </div>

      {/* 
        CONTINUOUSLY FLOATING ECOSYSTEM STAGE
        - 10 connector logos drifting horizontally in smooth infinite loop
        - Each logo moves at a designated speed and lane (zero collisions)
        - Sinusoidal vertical float (gently shifts by a few pixels)
        - Organic data-flow lines with glowing pulses connecting nearby nodes
        - Interactive pause and detailed inspection
      */}
      <div className="relative max-w-6xl mx-auto h-[320px] sm:h-[350px] px-4 select-none overflow-hidden">
        <div ref={stageRef} className="relative w-full h-full">
          {/* Background SVG network connection lines & traveling data pulses */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="networkLineGradDynamic" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Dynamic proximity links */}
            {POTENTIAL_LINKS.map((_, idx) => (
              <g key={idx}>
                <path
                  ref={(el) => {
                    svgPathsRef.current[idx] = el;
                  }}
                  fill="none"
                  stroke={isDark ? "url(#networkLineGradDynamic)" : "rgba(37, 99, 235, 0.12)"}
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  style={{ opacity: 0, transition: 'opacity 0.25s ease' }}
                />
                <circle
                  ref={(el) => {
                    pulseRefs.current[idx] = el;
                  }}
                  r="2.5"
                  fill="#60A5FA"
                  className="filter drop-shadow-[0_0_4px_#60A5FA]"
                  style={{ opacity: 0 }}
                />
              </g>
            ))}
          </svg>

          {/* 10 Floating Connectors */}
          {TOOLS.map((tool, idx) => {
            const isHovered = activeNodeId === tool.id;

            return (
              <div
                key={tool.id}
                ref={(el) => {
                  nodeRefs.current[idx] = el;
                }}
                onMouseEnter={() => setActiveNodeId(tool.id)}
                onMouseLeave={() => setActiveNodeId(null)}
                onFocus={() => setActiveNodeId(tool.id)}
                onBlur={() => setActiveNodeId(null)}
                onClick={() => setMobileDetailTool(mobileDetailTool?.id === tool.id ? null : tool)}
                tabIndex={0}
                role="button"
                aria-label={`${tool.name} connector: ${tool.category}. ${tool.detail}`}
                className="absolute top-0 left-0 -ml-7 -mt-7 will-change-transform z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] rounded-2xl"
              >
                <div 
                  className={`relative group flex items-center justify-center rounded-2xl transition-all duration-200 ${
                    isHovered
                      ? isDark
                        ? 'bg-[#132640] border-[#60A5FA] shadow-2xl scale-110 ring-2 ring-[#60A5FA]/60 z-30'
                        : 'bg-white border-[#2563EB] shadow-2xl scale-110 ring-2 ring-[#2563EB]/60 z-30'
                      : isDark
                      ? 'bg-[#0D1B2E] hover:bg-[#132640] border-[#243B56] shadow-lg z-10'
                      : 'bg-white hover:bg-[#F7FAFC] border-[#DCE6F0] shadow-md z-10'
                  } border p-3 sm:p-3.5`}
                  style={{
                    boxShadow: isHovered
                      ? `0 14px 28px -6px ${tool.badgeBg}, 0 4px 12px rgba(0,0,0,0.3)`
                      : undefined,
                  }}
                >
                  {/* Normalized SVG logo */}
                  {tool.svg}

                  {/* Desktop Hover / Focus Tooltip */}
                  {isHovered && (
                    <div
                      role="tooltip"
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 px-3.5 py-2 rounded-xl text-xs font-sans whitespace-nowrap shadow-2xl pointer-events-none z-50 flex items-center gap-2 border animate-in fade-in zoom-in-95 duration-150 ${
                        isDark
                          ? 'bg-[#0D1B2E] text-white border-[#243B56]'
                          : 'bg-[#2563EB] text-white border-[#0F3B82]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tool.color }} />
                      <div>
                        <div className="font-heading font-bold text-white text-[12px]">{tool.name}</div>
                        <div className="text-[10px] text-slate-300 font-mono">{tool.category}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        TOUCH INSPECTION BANNER (Comfortable for mobile & tablet users)
      */}
      {mobileDetailTool && (
        <div className="max-w-md mx-auto px-4 mt-4">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-start justify-between gap-3 text-left transition-all ${
              isDark ? 'bg-[#132640] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{mobileDetailTool.svg}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-heading font-bold">{mobileDetailTool.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                    isDark
                      ? 'text-[#60A5FA] bg-[#60A5FA]/15 border-[#60A5FA]/30'
                      : 'text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/25'
                  }`}>
                    {mobileDetailTool.category}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 leading-snug ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
                  {mobileDetailTool.detail}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileDetailTool(null)}
              className="p-1 rounded-md text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Close integration info"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Accessible reassurance caption */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-6 sm:mt-8">
        <div className={`inline-flex items-center gap-2 text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} />
          <span>Unified seamlessly into your single Kopa ledger</span>
        </div>
      </div>
    </section>
  );
};
