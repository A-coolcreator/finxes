import { ArrowLeftRight, Smartphone, Building2, GitBranch, ShoppingCart, Bitcoin, Users } from "lucide-react";
import SectionHeading from "./SectionHeading";

const capabilities = [
  {
    icon: ArrowLeftRight,
    name: "Transaction Intelligence",
    desc: "Normalise and classify financial transactions across 100+ bank formats, statement layouts, and export structures.",
  },
  {
    icon: GitBranch,
    name: "Fund Flow Intelligence",
    desc: "Trace movement of funds across accounts, institutions, and layers, hop by hop, automatically.",
  },
  {
    icon: Smartphone,
    name: "UPI Intelligence",
    desc: "Analyse UPI IDs, VPAs, merchants, QR activity, and payment networks across all major rails.",
  },
  {
    icon: Building2,
    name: "Entity Intelligence",
    desc: "Identify and classify banks, merchants, payment gateways, loan apps, and high-risk institutions.",
  },
  {
    icon: ShoppingCart,
    name: "Digital Spends Tracking",
    desc: "Map e-commerce, OTT, travel, and lifestyle expenditure patterns to surface lifestyle inflation, undisclosed income, and asset concealment.",
  },
  {
    icon: Bitcoin,
    name: "Crypto Intelligence",
    desc: "Detect on-ramp and off-ramp activity across exchanges, P2P platforms, and crypto VPAs linked back to bank transactions and UPI flows.",
  },
  {
    icon: Users,
    name: "Mule Intelligence",
    desc: "Identify mule account networks, layering patterns, and rapid pass-through behaviour across accounts and institutions.",
  },
];

const Card = ({ c }: { c: typeof capabilities[number] }) => (
  <div className="rounded-xl border border-line bg-white p-7 transition-shadow hover:shadow-card">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forensic-50">
      <c.icon size={20} className="text-forensic-600" />
    </span>
    <p className="mt-5 font-display text-[18px] font-semibold text-ink">{c.name}</p>
    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{c.desc}</p>
  </div>
);

export default function PlatformCapabilities() {
  const row1 = capabilities.slice(0, 4);
  const row2 = capabilities.slice(4);

  return (
    <section id="platform" className="border-b border-line bg-paper py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Platform Capabilities"
          heading="Seven intelligence layers, one investigation"
          description="Each capability works in combination, so a single case upload runs through all seven automatically."
        />

        {/* Mobile / tablet: single responsive grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
          {capabilities.map((c) => <Card key={c.name} c={c} />)}
        </div>

        {/* Desktop: row of 4, then row of 3 centred */}
        <div className="hidden lg:flex lg:flex-col lg:gap-5">
          <div className="grid grid-cols-4 gap-5">
            {row1.map((c) => <Card key={c.name} c={c} />)}
          </div>
          <div className="grid grid-cols-3 gap-5 mx-auto w-3/4">
            {row2.map((c) => <Card key={c.name} c={c} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
