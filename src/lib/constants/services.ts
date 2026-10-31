/**
 * Cynbit Technologies Service Catalogue
 *
 * Grounded in Cynbit's core offerings:
 * 1. AI Automation & Autonomous Agents
 * 2. Custom Software & Full-Stack Development
 * 3. Cloud Solutions & IT Architecture
 * 4. UI/UX Design & Product Strategy
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
  subServices: SubServiceOption[];
}

export const SERVICE_CATEGORIES: ServiceCategoryOption[] = [
  {
    id: "ai-automation",
    name: "AI Automation & Autonomous Agents",
    shortDescription:
      "Custom LLM integrations, autonomous agent workflows, and intelligent business process automation.",
    iconName: "Bot",
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
        description: "AI-powered review analysis, sentiment categorization, and real-time insights.",
      },
    ],
  },
  {
    id: "custom-software",
    name: "Custom Software & Full-Stack Development",
    shortDescription:
      "Enterprise web applications, high-performance mobile apps, and scalable SaaS infrastructure.",
    iconName: "Code2",
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
    id: "ui-ux-design",
    name: "UI/UX Design & Product Strategy",
    shortDescription:
      "User-centric product discovery, modern design systems, and interactive clickable prototypes.",
    iconName: "Palette",
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

export const BUDGET_RANGES = [
  { id: "under-5k", label: "< $5,000", description: "Ideal for small MVPs, discovery, or quick audits" },
  { id: "5k-15k", label: "$5,000 - $15,000", description: "Standard for standalone modules, prototypes, or redesigns" },
  { id: "15k-30k", label: "$15,000 - $30,000", description: "Full-scale custom platform or deep AI integration" },
  { id: "30k-plus", label: "$30,000+", description: "Enterprise-grade digital transformation or multi-platform systems" },
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
