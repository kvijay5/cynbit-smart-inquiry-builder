/**
 * Cynbit Technologies Service Catalogue
 *
 * Grounded in Cynbit's actual website (cynbit.in):
 *
 * Core Existing Commercial Offerings:
 * 1. AI Automation & Autonomous Agents (LLMs, Agent Workflows, Process Automation)
 * 2. Custom Software & Full-Stack Development (Next.js Web, Mobile Apps, SaaS Platforms)
 * 3. Cloud Solutions & IT Architecture (AWS/GCP/Azure, DevOps, System Modernization)
 * 4. Digital Marketing, SEO & CRM Automation (Technical SEO, Paid Media, Lead Engines)
 *
 * Proposed Prototype Addition:
 * 5. UI/UX Design & Product Strategy (Design systems & prototyping proposed for this assessment)
 */

export interface SubServiceOption {
  id: string;
  label: string;
  description: string;
}

export interface ServiceCategoryOption {
  id: string;
  name: string;
  shortDescription: string;
  iconName: string;
  offeringType: "verified_existing" | "proposed_addition";
  subServices: SubServiceOption[];
}

export const SERVICE_CATEGORIES: ServiceCategoryOption[] = [
  {
    id: "ai-automation",
    name: "AI Automation & Autonomous Agents",
    shortDescription:
      "Custom LLM integrations, autonomous agent workflows, and intelligent business process automation.",
    iconName: "Bot",
    offeringType: "verified_existing",
    subServices: [
      {
        id: "custom-llm",
        label: "Custom LLM & RAG Solutions",
        description: "Domain-specific AI knowledge bases and conversational retrieval systems.",
      },
      {
        id: "autonomous-agents",
        label: "Autonomous AI Agents",
        description: "Multi-agent workflows for operations, task automation, and decision support.",
      },
      {
        id: "workflow-automation",
        label: "Intelligent Workflow Automation",
        description: "Eliminate repetitive tasks by connecting AI pipelines directly into business tools.",
      },
      {
        id: "sentiment-analytics",
        label: "Data & Sentiment Analytics",
        description: "AI-powered review analysis, sentiment categorization, and real-time operational insights.",
      },
    ],
  },
  {
    id: "custom-software",
    name: "Custom Software & Full-Stack Development",
    shortDescription:
      "Enterprise web applications, high-performance mobile apps, and scalable SaaS infrastructure.",
    iconName: "Code2",
    offeringType: "verified_existing",
    subServices: [
      {
        id: "web-platforms",
        label: "Scalable Web Platforms",
        description: "Next.js, React, and modern TypeScript web platforms built for speed and SEO.",
      },
      {
        id: "mobile-apps",
        label: "Mobile Application Engineering",
        description: "Cross-platform mobile apps for iOS and Android using modern frameworks.",
      },
      {
        id: "saas-architecture",
        label: "SaaS Product Development",
        description: "Multi-tenant architecture, billing workflows, and secure customer portals.",
      },
      {
        id: "api-microservices",
        label: "API & Microservices Architecture",
        description: "High-throughput REST/GraphQL APIs and decoupled backend systems.",
      },
    ],
  },
  {
    id: "cloud-devops",
    name: "Cloud Solutions & IT Architecture",
    shortDescription:
      "Resilient cloud-native infrastructure, automated CI/CD pipelines, and secure cloud migration.",
    iconName: "Cloud",
    offeringType: "verified_existing",
    subServices: [
      {
        id: "cloud-infrastructure",
        label: "Cloud Architecture (AWS / GCP / Azure)",
        description: "Cost-optimized, scalable, and resilient multi-region cloud environments.",
      },
      {
        id: "devops-cicd",
        label: "DevOps & CI/CD Pipelines",
        description: "Zero-downtime deployment pipelines, containerization, and infrastructure as code.",
      },
      {
        id: "legacy-modernization",
        label: "Legacy System Modernization",
        description: "Migrate legacy codebases to modern microservices without operational downtime.",
      },
      {
        id: "security-compliance",
        label: "Security & Cloud Hardening",
        description: "Best-practice IAM policies, data encryption, and vulnerability management.",
      },
    ],
  },
  {
    id: "digital-marketing-seo",
    name: "Digital Marketing, SEO & CRM Automation",
    shortDescription:
      "Technical SEO, performance ads, conversion funnel optimization, and CRM automation engines.",
    iconName: "TrendingUp",
    offeringType: "verified_existing",
    subServices: [
      {
        id: "technical-seo",
        label: "Technical SEO & Search Dominance",
        description: "Infrastructure optimization, Core Web Vitals tuning, and organic visibility strategies.",
      },
      {
        id: "crm-automation",
        label: "CRM Automation & Lead Nurturing",
        description: "Automated pipeline workflows to convert incoming leads into active customers.",
      },
      {
        id: "performance-ads",
        label: "Performance Ads (Google & Meta)",
        description: "High-ROI paid media campaigns engineered for measurable qualified conversions.",
      },
      {
        id: "funnel-optimization",
        label: "Conversion Funnel Optimization",
        description: "Data-driven landing pages and UX testing to maximize inquiry-to-client conversion rates.",
      },
    ],
  },
  {
    id: "ui-ux-design",
    name: "UI/UX Design & Product Strategy",
    shortDescription:
      "User-centric product discovery, modern design systems, and interactive clickable prototypes (Assessment Proposal).",
    iconName: "Palette",
    offeringType: "proposed_addition",
    subServices: [
      {
        id: "user-research",
        label: "User Research & Information Architecture",
        description: "Audience persona mapping, journey maps, and navigation hierarchy.",
      },
      {
        id: "design-systems",
        label: "Component & Design Systems",
        description: "Cohesive, accessible Figma design systems ready for engineering handoff.",
      },
      {
        id: "mvp-prototyping",
        label: "Interactive MVP Prototyping",
        description: "Rapid high-fidelity prototypes to validate market fit before writing code.",
      },
      {
        id: "ui-refresh",
        label: "Website & Brand Refresh",
        description: "Modern, responsive interface designs engineered to increase user engagement.",
      },
    ],
  },
];

/**
 * Currency Configuration
 *
 * Cynbit is based in Jaipur, India and serves both domestic Indian enterprises and
 * international clients. To prevent regional assumptions, currency is explicitly
 * configurable here, and budget brackets display dual USD/INR references.
 *
 * NOTE: All budget tiers are indicative scoping estimates for this inquiry
 * builder prototype, NOT official fixed prices or public rate cards of Cynbit.
 */
export type SupportedCurrency = "USD" | "INR";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
}

export const ACTIVE_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
};

export const BUDGET_RANGES = [
  {
    id: "under-5k",
    label: "< $5,000 USD",
    inrEquivalent: "< ₹4,00,000 INR",
    displayLabel: "< $5,000 USD (~₹4 Lakhs INR)",
    description: "Indicative scoping estimate: Ideal for small MVPs, discovery audits, or standalone modules",
  },
  {
    id: "5k-15k",
    label: "$5,000 - $15,000 USD",
    inrEquivalent: "₹4,00,000 - ₹12,00,000 INR",
    displayLabel: "$5,000 - $15,000 USD (~₹4L - ₹12L INR)",
    description: "Indicative scoping estimate: Targeted product modules, redesigns, or marketing funnels",
  },
  {
    id: "15k-30k",
    label: "$15,000 - $30,000 USD",
    inrEquivalent: "₹12,00,000 - ₹25,00,000 INR",
    displayLabel: "$15,000 - $30,000 USD (~₹12L - ₹25L INR)",
    description: "Indicative scoping estimate: Full custom SaaS platform, deep AI agents, or enterprise apps",
  },
  {
    id: "30k-plus",
    label: "$30,000+ USD",
    inrEquivalent: "₹25,00,000+ INR",
    displayLabel: "$30,000+ USD (~₹25 Lakhs+ INR)",
    description: "Indicative scoping estimate: Multi-platform enterprise systems or complex digital transformation",
  },
] as const;

export const TIMELINES = [
  { id: "urgent", label: "< 1 Month (Urgent)", description: "Fast-track development required" },
  { id: "1-3-months", label: "1 - 3 Months", description: "Standard MVP delivery cycle" },
  { id: "3-6-months", label: "3 - 6 Months", description: "Comprehensive roadmap & phased milestones" },
  { id: "exploring", label: "Flexible / Exploring", description: "Planning stage, scoping feasibility first" },
] as const;

export const SERVICE_CATEGORY_IDS = SERVICE_CATEGORIES.map((c) => c.id) as [string, ...string[]];
export const BUDGET_RANGE_IDS = BUDGET_RANGES.map((b) => b.id) as [string, ...string[]];
export const TIMELINE_IDS = TIMELINES.map((t) => t.id) as [string, ...string[]];

export const FORM_LIMITS = {
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_COMPANY_LENGTH: 100,
  MAX_PHONE_LENGTH: 25,
  MAX_REQUEST_BODY_BYTES: 100 * 1024, // 100 KB limit for payload
} as const;
