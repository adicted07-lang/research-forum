// Seed 8 realistic researcher profiles into production.
// Idempotent: upserts by email, so re-running won't create duplicates.
// Usage: node -r dotenv/config scripts/seed-researchers.mjs dotenv_config_path=.env.vercel-prod
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL || "");
const prisma = new PrismaClient({ adapter });

const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// createdAt staggered over the last ~8 weeks so they look organic
const researchers = [
  {
    name: "Sofia Rossi", username: "sofia_rossi", email: "sofia.rossi@researchhub.dev",
    avatarSeed: "Sofia", bg: "ffd5dc", createdDaysAgo: 53,
    expertise: ["innovation-research", "concept-testing", "qualitative-methods", "jobs-to-be-done", "trend-analysis"],
    experienceYears: 10, hourlyRate: 190, points: 540, industry: "Food and Beverages",
    bio: "Innovation researcher helping food & beverage brands de-risk new product launches through early-stage concept testing and trend foresight.",
    about: "Over a decade running front-end innovation programmes for CPG companies across Europe. I specialise in turning fuzzy consumer needs into validated product concepts, combining ethnographic immersion with iterative concept testing and jobs-to-be-done frameworks.",
  },
  {
    name: "Daniel Okonkwo", username: "daniel_okonkwo", email: "daniel.okonkwo@researchhub.dev",
    avatarSeed: "Daniel", bg: "d6e4ff", createdDaysAgo: 46,
    expertise: ["B2B-research", "win-loss-analysis", "competitive-analysis", "market-sizing", "strategic-planning"],
    experienceYears: 13, hourlyRate: 205, points: 610, industry: "ICT",
    bio: "B2B market intelligence specialist focused on win/loss programmes and competitive landscape mapping for enterprise software vendors.",
    about: "I build always-on competitive intelligence and win/loss functions for B2B technology companies. My work has directly informed pricing, positioning, and roadmap decisions at several high-growth SaaS firms.",
  },
  {
    name: "Mei Lin", username: "mei_lin", email: "mei.lin@researchhub.dev",
    avatarSeed: "Mei", bg: "c0e8d5", createdDaysAgo: 39,
    expertise: ["quantitative-methods", "survey-design", "market-segmentation", "data-analytics", "brand-tracking"],
    experienceYears: 9, hourlyRate: 175, points: 470, industry: "Consumer Goods",
    bio: "Quantitative researcher designing segmentation and brand-tracking studies that scale across APAC markets.",
    about: "Hands-on quant researcher with deep experience in large-sample survey design, advanced segmentation, and continuous brand health tracking. Fluent in Mandarin and English, I frequently bridge global brand teams with local market realities.",
  },
  {
    name: "Omar Haddad", username: "omar_haddad", email: "omar.haddad@researchhub.dev",
    avatarSeed: "Omar", bg: "fde2b3", createdDaysAgo: 31,
    expertise: ["pricing-research", "conjoint-analysis", "choice-modeling", "quantitative-methods", "product-research"],
    experienceYears: 14, hourlyRate: 225, points: 690, industry: "Automotive",
    bio: "Pricing and choice-modelling expert building conjoint and MaxDiff studies for automotive and mobility clients.",
    about: "I help manufacturers and mobility startups optimise pricing, feature bundles, and trim strategies using conjoint analysis and discrete choice models. Fourteen years across OEMs and consultancies, with a strong applied-econometrics foundation.",
  },
  {
    name: "Isabella Moreau", username: "isabella_moreau", email: "isabella.moreau@researchhub.dev",
    avatarSeed: "Isabella", bg: "e0d4f7", createdDaysAgo: 24,
    expertise: ["UX-research", "usability-testing", "voice-of-customer", "customer-experience", "qualitative-research"],
    experienceYears: 8, hourlyRate: 180, points: 430, industry: "Healthcare",
    bio: "Mixed-methods UX researcher improving patient and clinician experiences for digital health products.",
    about: "I work at the intersection of market and UX research for healthcare and medtech. My focus is voice-of-customer programmes, usability testing of clinical software, and translating patient experience data into product priorities.",
  },
  {
    name: "Rajesh Nair", username: "rajesh_nair", email: "rajesh.nair@researchhub.dev",
    avatarSeed: "Rajesh", bg: "cce5cc", createdDaysAgo: 17,
    expertise: ["data-analytics", "social-listening", "trend-analysis", "AI-in-research", "mixed-methods"],
    experienceYears: 11, hourlyRate: 200, points: 560, industry: "Energy and Power",
    bio: "Insights analyst applying social listening and AI-assisted analysis to track sentiment in energy and utilities markets.",
    about: "I combine traditional survey research with social listening, text analytics, and emerging AI tooling to give energy and infrastructure clients a faster read on stakeholder sentiment and emerging issues.",
  },
  {
    name: "Hannah Becker", username: "hannah_becker", email: "hannah.becker@researchhub.dev",
    avatarSeed: "Hannah", bg: "ffe0b2", createdDaysAgo: 11,
    expertise: ["qualitative-methods", "focus-groups", "moderation", "ethnographic-research", "cultural-insights"],
    experienceYears: 16, hourlyRate: 210, points: 720, industry: "Packaging",
    bio: "Veteran qualitative moderator running in-depth focus groups and ethnographies across DACH and Nordic markets.",
    about: "Sixteen years as an independent qualitative researcher and moderator. I run focus groups, IDIs, and ethnographic studies, with particular strength in packaging, shopper, and sensory research for FMCG brands.",
  },
  {
    name: "Thomas Nguyen", username: "thomas_nguyen", email: "thomas.nguyen@researchhub.dev",
    avatarSeed: "Thomas", bg: "f5cba7", createdDaysAgo: 6,
    expertise: ["competitive-analysis", "market-sizing", "B2B-research", "strategic-planning", "positioning"],
    experienceYears: 7, hourlyRate: 165, points: 360, industry: "Aerospace and Defence",
    bio: "Market analyst sizing emerging opportunities and mapping competitive dynamics in aerospace and defence.",
    about: "I focus on market sizing, opportunity assessment, and competitive positioning for aerospace, defence, and dual-use technology clients. Background in strategy consulting with a quantitative bent.",
  },
];

async function main() {
  let created = 0, updated = 0;
  for (const r of researchers) {
    const createdAt = daysAgo(r.createdDaysAgo);
    const data = {
      email: r.email,
      username: r.username,
      name: r.name,
      role: "RESEARCHER",
      image: `https://api.dicebear.com/9.x/notionists/svg?seed=${r.avatarSeed}&backgroundColor=${r.bg}`,
      emailVerified: createdAt,
      bio: r.bio,
      about: r.about,
      expertise: r.expertise,
      experienceYears: r.experienceYears,
      hourlyRate: r.hourlyRate,
      availability: "AVAILABLE",
      currency: "USD",
      isVerified: true,
      points: r.points,
      createdAt,
    };
    const existing = await prisma.user.findUnique({ where: { email: r.email } });
    await prisma.user.upsert({
      where: { email: r.email },
      create: data,
      update: data,
    });
    if (existing) { updated++; console.log(`  updated  ${r.name} (${r.username})`); }
    else { created++; console.log(`  created  ${r.name} (${r.username})`); }
  }
  const total = await prisma.user.count({ where: { role: "RESEARCHER", deletedAt: null } });
  console.log(`\nDone. created=${created} updated=${updated}. Total active researchers now: ${total}`);
}

main()
  .catch((e) => { console.error("FAILED:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
