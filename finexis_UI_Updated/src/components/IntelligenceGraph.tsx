import SectionHeading from "./SectionHeading";

const categories = [
  { key: "accounts", label: "Accounts", color: "#12161C" },
  { key: "transactions", label: "Transactions", color: "#8A93A1" },
  { key: "upi", label: "UPIs", color: "#0E6E5E" },
  { key: "merchants", label: "Merchants", color: "#4A6FA5" },
  { key: "devices", label: "Devices", color: "#D97706" },
  { key: "crypto", label: "Crypto", color: "#C0392B" },
];

// ambient nodes, grouped loosely by category for a hairball-with-structure look
const nodes: { x: number; y: number; r: number; fill: string; key?: boolean }[] = [
  // accounts
  { x: 110, y: 130, r: 6, fill: "#12161C", key: true },
  { x: 165, y: 135, r: 4, fill: "#12161C" },
  { x: 120, y: 175, r: 4, fill: "#12161C" },
  { x: 155, y: 185, r: 4, fill: "#12161C" },
  { x: 95, y: 165, r: 3.5, fill: "#12161C" },
  // transactions
  { x: 350, y: 55, r: 4, fill: "#8A93A1" },
  { x: 405, y: 50, r: 4, fill: "#8A93A1" },
  { x: 365, y: 90, r: 6, fill: "#8A93A1", key: true },
  { x: 415, y: 85, r: 3.5, fill: "#8A93A1" },
  { x: 390, y: 40, r: 3.5, fill: "#8A93A1" },
  // upi
  { x: 590, y: 135, r: 4, fill: "#0E6E5E" },
  { x: 645, y: 140, r: 4, fill: "#0E6E5E" },
  { x: 605, y: 180, r: 6, fill: "#0E6E5E", key: true },
  { x: 655, y: 185, r: 3.5, fill: "#0E6E5E" },
  // merchants
  { x: 590, y: 315, r: 4, fill: "#4A6FA5" },
  { x: 650, y: 320, r: 4, fill: "#4A6FA5" },
  { x: 605, y: 355, r: 6, fill: "#4A6FA5", key: true },
  { x: 655, y: 360, r: 3.5, fill: "#4A6FA5" },
  // devices
  { x: 350, y: 400, r: 4, fill: "#D97706" },
  { x: 410, y: 395, r: 4, fill: "#D97706" },
  { x: 365, y: 425, r: 3.5, fill: "#D97706" },
  { x: 400, y: 430, r: 3.5, fill: "#D97706" },
  // crypto
  { x: 110, y: 315, r: 4, fill: "#C0392B" },
  { x: 165, y: 320, r: 4, fill: "#C0392B" },
  { x: 120, y: 355, r: 6, fill: "#C0392B", key: true },
  { x: 155, y: 365, r: 3.5, fill: "#C0392B" },
];

const ambientEdges: [number, number, number, number][] = [
  // within-cluster
  [110, 130, 165, 135], [110, 130, 120, 175], [120, 175, 155, 185], [95, 165, 120, 175],
  [350, 55, 405, 50], [350, 55, 365, 90], [365, 90, 415, 85], [390, 40, 365, 90],
  [590, 135, 645, 140], [590, 135, 605, 180], [645, 140, 655, 185],
  [590, 315, 650, 320], [590, 315, 605, 355], [650, 320, 655, 360],
  [350, 400, 410, 395], [350, 400, 365, 425], [410, 395, 400, 430],
  [110, 315, 165, 320], [110, 315, 120, 355], [165, 320, 155, 365],
  // necklace between adjacent clusters
  [165, 135, 350, 55], [415, 85, 590, 135], [655, 185, 590, 315],
  [605, 355, 410, 395], [365, 425, 165, 320], [95, 165, 110, 315],
  // a few long diagonals through the middle for hairball density
  [155, 185, 605, 355], [415, 85, 400, 430],
];

const highlightPath: [number, number, number, number][] = [
  [120, 175, 365, 90],
  [365, 90, 605, 180],
  [605, 180, 605, 355],
  [605, 355, 120, 355],
];

export default function IntelligenceGraph() {
  return (
    <section className="border-b border-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="The intelligence graph"
          heading="Every account, transaction, and device — one graph"
          description="Accounts, transactions, UPIs, merchants, devices, and crypto wallets sit in a single graph. Pick any node and follow it back to its source."
        />

        <div className="mx-auto max-w-3xl rounded-xl border border-line bg-paper p-4 sm:p-8">
          <svg viewBox="0 0 760 460" className="h-auto w-full">
            {ambientEdges.map((e, i) => (
              <line key={i} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} stroke="#D8DCE2" strokeWidth="1.2" />
            ))}
            {highlightPath.map((e, i) => (
              <line
                key={i}
                x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]}
                stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"
                className="flow-line"
              />
            ))}
            {nodes.map((n, i) => (
              <g key={i}>
                {n.key && <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke={n.fill} strokeWidth="1.5" opacity="0.35" />}
                <circle cx={n.x} cy={n.y} r={n.r} fill={n.fill} />
              </g>
            ))}
          </svg>
        </div>

        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2">
          {categories.map((c) => (
            <span key={c.key} className="flex items-center gap-1.5 text-[13px] text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            <span className="h-[2px] w-4 rounded-full" style={{ backgroundColor: "#D97706" }} />
            Traced path
          </span>
        </div>
      </div>
    </section>
  );
}
