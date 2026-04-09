import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new (PrismaNeonHttp as any)(connectionString);
const db = new PrismaClient({ adapter });

const researchers = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@researchhub.dev",
    username: "priya_sharma",
    bio: "Consumer insights strategist with 12 years of experience in FMCG and retail sectors. Specializes in ethnographic research, shopper behavior studies, and translating qualitative findings into actionable brand strategies.",
    about:
      "I lead consumer insights programs for Fortune 500 brands, blending traditional qualitative methods with digital ethnography. My work has shaped product launches across 15+ markets. I'm passionate about uncovering the 'why' behind purchase decisions and helping teams move beyond surface-level survey data.",
    expertise: ["consumer-insights", "ethnographic-research", "brand-strategy", "qualitative-methods", "shopper-behavior"],
    experienceYears: 12,
    hourlyRate: 185,
    points: 620,
  },
  {
    name: "Marcus Johnson",
    email: "marcus.johnson@researchhub.dev",
    username: "marcus_johnson",
    bio: "Quantitative researcher specializing in conjoint analysis, MaxDiff, and advanced survey design. Builds custom choice models for pricing and product optimization across tech and healthcare.",
    about:
      "With 15 years in quantitative market research, I've designed and analyzed over 300 conjoint studies. I focus on helping companies make better pricing and feature trade-off decisions using choice-based modeling. Former Ipsos and Kantar, now independent consultant.",
    expertise: ["conjoint-analysis", "survey-design", "pricing-research", "quantitative-methods", "choice-modeling"],
    experienceYears: 15,
    hourlyRate: 220,
    points: 750,
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka@researchhub.dev",
    username: "yuki_tanaka",
    bio: "UX researcher bridging the gap between market research and product design. Expert in usability testing, concept validation, and jobs-to-be-done frameworks for SaaS and fintech products.",
    about:
      "I combine UX research rigor with market research scale. Over 9 years, I've built research operations at two unicorn startups and now consult for growth-stage companies. I believe the best product decisions come from triangulating behavioral data, user interviews, and market signals.",
    expertise: ["UX-research", "usability-testing", "concept-testing", "jobs-to-be-done", "product-research"],
    experienceYears: 9,
    hourlyRate: 175,
    points: 480,
  },
  {
    name: "Amara Okafor",
    email: "amara.okafor@researchhub.dev",
    username: "amara_okafor",
    bio: "Competitive intelligence analyst with deep expertise in market sizing, win/loss analysis, and strategic landscape mapping for B2B technology companies.",
    about:
      "I've spent 11 years helping B2B tech companies understand their competitive position. My frameworks for win/loss analysis and market opportunity sizing have been adopted by sales and strategy teams at companies ranging from Series B startups to enterprise giants. I teach a popular workshop on CI best practices.",
    expertise: ["competitive-analysis", "market-sizing", "win-loss-analysis", "B2B-research", "strategic-planning"],
    experienceYears: 11,
    hourlyRate: 195,
    points: 560,
  },
  {
    name: "Carlos Mendez",
    email: "carlos.mendez@researchhub.dev",
    username: "carlos_mendez",
    bio: "Data analytics leader focused on integrating survey data with behavioral and transactional datasets. Builds dashboards and predictive models for brand health tracking programs.",
    about:
      "I sit at the intersection of market research and data science. Over 14 years, I've built brand tracking systems for CPG companies, developed churn prediction models using NPS data, and created real-time competitive dashboards. I believe market research needs to embrace modern data engineering to stay relevant.",
    expertise: ["data-analytics", "brand-tracking", "predictive-modeling", "dashboard-design", "data-integration"],
    experienceYears: 14,
    hourlyRate: 210,
    points: 690,
  },
  {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@researchhub.dev",
    username: "sarah_mitchell",
    bio: "Focus group moderator and qualitative research specialist with expertise in healthcare, pharma, and patient experience studies. Certified in multiple projective techniques.",
    about:
      "I've moderated over 500 focus groups and 2,000+ in-depth interviews across healthcare and pharma. My specialty is making patients and HCPs comfortable discussing sensitive topics. I also train junior researchers in moderation techniques and qualitative analysis using frameworks like thematic analysis and grounded theory.",
    expertise: ["focus-groups", "qualitative-research", "healthcare-research", "patient-experience", "moderation"],
    experienceYears: 16,
    hourlyRate: 200,
    points: 720,
  },
  {
    name: "Wei Zhang",
    email: "wei.zhang@researchhub.dev",
    username: "wei_zhang",
    bio: "Market segmentation expert combining cluster analysis with behavioral economics principles. Helps brands identify and target high-value customer segments across APAC and North American markets.",
    about:
      "My 10 years in segmentation research have taught me that demographics alone never tell the full story. I use latent class analysis, behavioral clustering, and needs-based frameworks to create segments that actually drive marketing ROI. I've worked across automotive, telecom, and financial services.",
    expertise: ["market-segmentation", "cluster-analysis", "behavioral-economics", "customer-profiling", "targeting"],
    experienceYears: 10,
    hourlyRate: 180,
    points: 510,
  },
  {
    name: "Elena Petrov",
    email: "elena.petrov@researchhub.dev",
    username: "elena_petrov",
    bio: "Trend analyst and foresight researcher tracking emerging consumer behaviors, cultural shifts, and technology adoption patterns. Published author on Gen Z consumer trends.",
    about:
      "I help brands see around corners. With 8 years in trend analysis and strategic foresight, I combine social listening, cultural analysis, and primary research to identify emerging opportunities. My trend reports have been featured in AdAge and Marketing Week. I focus on the intersection of culture, technology, and consumer behavior.",
    expertise: ["trend-analysis", "consumer-behavior", "cultural-insights", "social-listening", "foresight"],
    experienceYears: 8,
    hourlyRate: 165,
    points: 430,
  },
  {
    name: "David Kim",
    email: "david.kim@researchhub.dev",
    username: "david_kim",
    bio: "Survey methodology expert and sampling statistician. Designs complex multi-mode survey programs for government agencies, NGOs, and large-scale commercial trackers.",
    about:
      "Accurate measurement is everything. Over 18 years, I've designed sampling frameworks for national health surveys, political polls, and global brand trackers. I specialize in reducing non-response bias, optimizing questionnaire flow, and ensuring data quality in online panels. Former chief methodologist at a top-10 research firm.",
    expertise: ["survey-design", "sampling-methodology", "data-quality", "questionnaire-design", "statistical-methods"],
    experienceYears: 18,
    hourlyRate: 240,
    points: 800,
  },
  {
    name: "Fatima Al-Hassan",
    email: "fatima.alhassan@researchhub.dev",
    username: "fatima_alhassan",
    bio: "Customer experience researcher specializing in journey mapping, voice-of-customer programs, and NPS optimization for financial services and e-commerce brands.",
    about:
      "I've built CX measurement programs from scratch for three major banks and two leading e-commerce platforms. My approach combines touchpoint surveys, behavioral analytics, and qualitative deep-dives to create journey maps that actually drive operational improvements. I'm a certified CCXP and regular speaker at CX conferences.",
    expertise: ["customer-experience", "journey-mapping", "NPS", "voice-of-customer", "CX-strategy"],
    experienceYears: 13,
    hourlyRate: 190,
    points: 580,
  },
  {
    name: "James O'Brien",
    email: "james.obrien@researchhub.dev",
    username: "james_obrien",
    bio: "Brand strategy researcher with deep expertise in brand equity measurement, positioning studies, and advertising effectiveness testing using implicit and explicit methods.",
    about:
      "For 20 years, I've helped brands understand what they mean to people. From brand health trackers to ad copy testing, I use a mix of survey-based equity models, implicit association testing, and semiotics to uncover brand truth. I've worked on some of the world's most valuable brands across automotive, luxury, and FMCG.",
    expertise: ["brand-strategy", "brand-equity", "advertising-research", "positioning", "semiotics"],
    experienceYears: 20,
    hourlyRate: 250,
    points: 780,
  },
  {
    name: "Anika Patel",
    email: "anika.patel@researchhub.dev",
    username: "anika_patel",
    bio: "Mixed-methods researcher combining quantitative rigor with qualitative depth for product innovation and concept development in consumer technology and D2C brands.",
    about:
      "I believe the best insights come from methodological pluralism. Over 7 years, I've run everything from large-scale concept tests to in-home ethnographies for consumer tech companies. I specialize in early-stage innovation research using design thinking principles, and I'm a strong advocate for democratizing research within organizations.",
    expertise: ["mixed-methods", "innovation-research", "concept-testing", "design-thinking", "product-research"],
    experienceYears: 7,
    hourlyRate: 155,
    points: 350,
  },
];

async function main() {
  console.log("Seeding 12 market research researchers...");

  const passwordHash = await bcrypt.hash("researcher123", 10);

  for (const r of researchers) {
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}`;

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email: r.email } });

    if (existing) {
      await db.user.update({
        where: { email: r.email },
        data: {
          name: r.name,
          image: avatarUrl,
          bio: r.bio,
          about: r.about,
          expertise: r.expertise,
          experienceYears: r.experienceYears,
          hourlyRate: r.hourlyRate,
          points: r.points,
        },
      });
      console.log(`  Updated: ${r.name} (${existing.id})`);
    } else {
      const user = await db.user.create({
        data: {
          email: r.email,
          username: r.username,
          name: r.name,
          role: "RESEARCHER",
          image: avatarUrl,
          bio: r.bio,
          about: r.about,
          expertise: r.expertise,
          experienceYears: r.experienceYears,
          hourlyRate: r.hourlyRate,
          availability: "AVAILABLE",
          isVerified: true,
          points: r.points,
          emailVerified: new Date(),
        },
      });

      // Create credentials account separately
      await db.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: r.email,
          access_token: passwordHash,
        },
      });

      console.log(`  Seeded: ${r.name} (${user.id})`);
    }
  }

  console.log("Done seeding researchers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
