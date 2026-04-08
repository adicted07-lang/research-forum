import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  // If the URL is a prisma+postgres:// Accelerate/proxy URL, decode the inner postgres URL
  if (url.startsWith("prisma+postgres://")) {
    try {
      const apiKey = new URL(url).searchParams.get("api_key");
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString());
        if (decoded.databaseUrl) return decoded.databaseUrl;
      }
    } catch {
      // fall through
    }
  }

  return url;
}

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password for all users
  const passwordHash = await bcrypt.hash("password123", 10);

  // ==================== AVATARS ====================

  const AVATAR_SEEDS = [
    "Felix", "Aneka", "Jade", "Leo", "Mia", "Oscar", "Zara", "Kai",
    "Luna", "Max", "Aria", "Finn", "Nova", "Theo", "Iris", "Axel",
    "Sage", "Ruby", "Orion", "Cleo", "Atlas", "Lyra", "Hugo", "Piper",
    "Miles", "Wren", "Quinn", "Juno", "Ezra", "Ember", "Dash", "Ivy",
    "Rio", "Skye", "Knox", "Nora", "Beck", "Lila", "Cole", "Faye",
  ];

  function randomAvatar(seed?: string): string {
    const s = seed || AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(s)}&backgroundColor=fdba74,fed7aa,fecaca,fde68a,ffedd5&backgroundType=gradientLinear`;
  }

  // ==================== USERS ====================

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: { image: randomAvatar("Aria") },
    create: {
      email: "alice@example.com",
      username: "alice_chen",
      name: "Alice Chen",
      role: "RESEARCHER",
      image: randomAvatar("Aria"),
      bio: "Computational biologist specializing in ML-driven genomics research.",
      about:
        "I'm a computational biologist with 8 years of experience applying machine learning to genomics problems. I've worked on everything from single-cell RNA-seq analysis to protein structure prediction. Passionate about open science and reproducible research.",
      expertise: ["machine-learning", "genomics", "bioinformatics", "Python", "R"],
      experienceYears: 8,
      hourlyRate: 150,

      isVerified: true,
      points: 340,
      emailVerified: new Date(),
      portfolioLinks: ["https://github.com/alicechen", "https://alicechen.dev"],
      socialLinks: { website: "https://alicechen.dev", twitter: "alicechen_bio", linkedin: "https://linkedin.com/in/alicechen" },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: { image: randomAvatar("Hugo") },
    create: {
      email: "bob@example.com",
      username: "bob_martinez",
      name: "Bob Martinez",
      role: "RESEARCHER",
      image: randomAvatar("Hugo"),
      bio: "Survey methodologist and biostatistician with 12 years of field experience.",
      about:
        "I specialize in survey design, statistical analysis, and biostatistics. Over my 12-year career I've worked with academic institutions, public health agencies, and private research firms on large-scale epidemiological studies.",
      expertise: ["biostatistics", "survey-methodology", "SPSS", "SAS", "R", "mixed-methods"],
      experienceYears: 12,
      hourlyRate: 120,

      isVerified: true,
      points: 580,
      emailVerified: new Date(),
      portfolioLinks: ["https://bobmartinez.research.io"],
      socialLinks: { website: "https://bobmartinez.research.io", twitter: "bobmartinez_stats", linkedin: "https://linkedin.com/in/bobmartinez" },
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: { image: randomAvatar("Luna") },
    create: {
      email: "carol@example.com",
      username: "carol_nguyen",
      name: "Carol Nguyen",
      role: "RESEARCHER",
      image: randomAvatar("Luna"),
      bio: "UX researcher focused on qualitative methods and cross-cultural usability studies.",
      about:
        "With 6 years in UX research I bring expertise in contextual inquiry, usability testing, and cross-cultural design. I've conducted studies across North America, Europe, and Southeast Asia.",
      expertise: [
        "UX-research",
        "qualitative-methods",
        "usability-testing",
        "contextual-inquiry",
        "Figma",
      ],
      experienceYears: 6,
      hourlyRate: 95,

      isVerified: false,
      points: 210,
      emailVerified: new Date(),
      socialLinks: { twitter: "carolnguyen_ux", linkedin: "https://linkedin.com/in/carolnguyen" },
    },
  });

  const techcorp = await prisma.user.upsert({
    where: { email: "admin@techcorp.com" },
    update: { image: randomAvatar("Atlas") },
    create: {
      email: "admin@techcorp.com",
      username: "techcorp_research",
      name: "TechCorp Research",
      role: "COMPANY",
      image: randomAvatar("Atlas"),
      companyName: "TechCorp Research",
      description:
        "TechCorp Research is an AI-first company building the next generation of research tools. Series B funded, we're on a mission to accelerate scientific discovery through AI.",
      industry: "Artificial Intelligence",
      companySize: "SIZE_51_200",
      website: "https://techcorp.example.com",
      hiringStatus: "ACTIVELY_HIRING",
      emailVerified: new Date(),
      socialLinks: { website: "https://techcorp.example.com", twitter: "techcorp_research", linkedin: "https://linkedin.com/company/techcorp" },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@researchhub.com" },
    update: { image: randomAvatar("Orion") },
    create: {
      email: "admin@researchhub.com",
      username: "researchhub_admin",
      name: "ResearchHub Admin",
      role: "ADMIN",
      image: randomAvatar("Orion"),
      bio: "Platform administrator for ResearchHub.",
      isVerified: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Users created");

  // ==================== ACCOUNTS ====================

  await prisma.account.createMany({
    data: [
      {
        userId: alice.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: alice.email,
        access_token: passwordHash,
      },
      {
        userId: bob.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: bob.email,
        access_token: passwordHash,
      },
      {
        userId: carol.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: carol.email,
        access_token: passwordHash,
      },
      {
        userId: techcorp.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: techcorp.email,
        access_token: passwordHash,
      },
      {
        userId: admin.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: admin.email,
        access_token: passwordHash,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Accounts created");

  // ==================== QUESTIONS ====================

  const q1 = await prisma.question.upsert({
    where: { slug: "how-handle-missing-data-longitudinal-study" },
    update: {},
    create: {
      title: "How do you handle missing data in a longitudinal study?",
      body: `I'm running a longitudinal study tracking 500 participants over 24 months with monthly surveys. I'm seeing about 15-20% missing data at various time points due to dropout and non-response.

I've read about multiple imputation (MI) and full information maximum likelihood (FIML), but I'm not sure which approach is more appropriate for my design. My outcome variables are continuous (Likert-scale composites) and I have several time-varying covariates.

Questions:
1. Which missing data mechanism should I assume (MCAR, MAR, MNAR)?
2. Is MI or FIML more appropriate for this design?
3. How do I handle time-varying covariates in imputation?
4. What's the minimum sample size recommendation per time point after accounting for dropout?

Any guidance from researchers who've dealt with similar issues would be greatly appreciated.`,
      slug: "how-handle-missing-data-longitudinal-study",
      tags: ["missing-data", "longitudinal-study", "statistics", "imputation", "FIML"],
      category: "Statistics & Methodology",
      industry: "Healthcare",
      authorId: alice.id,
      status: "ANSWERED",
      upvoteCount: 24,
      viewCount: 342,
      answerCount: 2,
    },
  });

  const q2 = await prisma.question.upsert({
    where: { slug: "best-practices-ml-model-validation-social-science" },
    update: {},
    create: {
      title: "Best practices for ML model validation in social science research?",
      body: `I'm using machine learning models (random forests, gradient boosting) to predict outcomes in a social science dataset (n=2,400 survey respondents). My colleagues are skeptical — they want rigorous validation that goes beyond just reporting accuracy metrics.

Specifically, I need to:
- Demonstrate the model generalizes beyond the training data
- Show the model isn't just picking up on spurious correlations
- Provide interpretable results that social scientists will accept

I've done k-fold cross-validation and have decent AUC scores (~0.78), but I feel like there's more I should do. Has anyone successfully published ML-based research in social science journals? What validation approaches did you use?`,
      slug: "best-practices-ml-model-validation-social-science",
      tags: [
        "machine-learning",
        "model-validation",
        "social-science",
        "random-forest",
        "interpretability",
      ],
      category: "Research Methods",
      industry: "ICT",
      authorId: alice.id,
      status: "OPEN",
      upvoteCount: 18,
      viewCount: 201,
      answerCount: 1,
    },
  });

  const q3 = await prisma.question.upsert({
    where: { slug: "cross-cultural-ux-research-methodology" },
    update: {},
    create: {
      title: "Methodology for cross-cultural UX research across 5 countries",
      body: `I'm designing a usability study that will be conducted simultaneously in the US, Germany, Japan, Brazil, and Nigeria. The product is a B2B SaaS dashboard used by data analysts.

I'm wrestling with several methodological challenges:

1. **Translation and localization**: Should I translate the tasks and think-aloud prompts, or work with bilingual participants who can engage in English?
2. **Facilitator consistency**: We'll have local facilitators in each country. How do I ensure protocol fidelity across teams?
3. **Cultural response bias**: Particularly concerned about acquiescence bias in some cultures (tendency to agree with moderator).
4. **Sample size**: Is 5 participants per country (n=25 total) sufficient for identifying major usability issues, or should I aim for more?

Has anyone done comparative cross-cultural UX research at this scale? What worked and what didn't?`,
      slug: "cross-cultural-ux-research-methodology",
      tags: [
        "UX-research",
        "cross-cultural",
        "usability-testing",
        "methodology",
        "internationalization",
      ],
      category: "UX & Human Factors",
      industry: "Consumer Goods",
      authorId: carol.id,
      status: "OPEN",
      upvoteCount: 31,
      viewCount: 445,
      answerCount: 2,
    },
  });

  const q4 = await prisma.question.upsert({
    where: { slug: "p-values-still-relevant-modern-research" },
    update: {},
    create: {
      title: "Are p-values still relevant in modern research? What should we use instead?",
      body: `There's been a lot of debate in the statistical community about p-values — the ASA issued statements, journals have banned them, others doubled down. I'm working on a paper and trying to figure out the best approach.

My current analysis uses null hypothesis significance testing (NHST) with p < 0.05 thresholds. Reviewers at my target journal have been pushing back on this in recent submissions.

What are the practical alternatives people are actually using:
- Bayesian inference / Bayes factors?
- Effect sizes + confidence intervals only?
- False discovery rate (FDR) corrections for multiple comparisons?
- Pre-registration + equivalence testing?

I'm in behavioral science if that context helps. What do reviewers at top journals actually accept these days?`,
      slug: "p-values-still-relevant-modern-research",
      tags: ["p-values", "statistics", "Bayesian", "effect-size", "open-science"],
      category: "Statistics & Methodology",
      industry: "Healthcare",
      authorId: bob.id,
      status: "ANSWERED",
      upvoteCount: 67,
      viewCount: 892,
      answerCount: 2,
    },
  });

  const q5 = await prisma.question.upsert({
    where: { slug: "reproducibility-crisis-practical-solutions" },
    update: {},
    create: {
      title: "Practical solutions to improve reproducibility in your research workflow",
      body: `After reading about the replication crisis, I want to improve the reproducibility of my own research. I'm a cognitive psychologist running experiments with human participants.

What concrete steps have you taken to make your research more reproducible? I'm looking for practical advice on:

- Pre-registration strategies that don't stifle exploratory analysis
- Data management and sharing (GDPR concerns with human participant data)
- Code documentation and version control for analysis scripts
- Handling sensitive participant data while enabling reproduction

I already use R Markdown for analysis reports. What else should I be doing? Bonus points for advice specific to psychology/behavioral research.`,
      slug: "reproducibility-crisis-practical-solutions",
      tags: ["reproducibility", "open-science", "pre-registration", "data-management", "R"],
      category: "Open Science",
      authorId: bob.id,
      status: "OPEN",
      upvoteCount: 42,
      viewCount: 567,
      answerCount: 1,
    },
  });

  console.log("✅ Questions created");

  // ==================== ANSWERS ====================

  const a1 = await prisma.answer.create({
    data: {
      body: `Great question — missing data handling is one of the most consequential methodological decisions in longitudinal research.

**Which mechanism to assume?**

You almost certainly have MAR (Missing at Random) data, not MCAR. With 15-20% dropout in a longitudinal study, dropout is almost always related to observed variables (prior survey responses, demographics) even if not to the unobserved outcome — that's textbook MAR. True MCAR is rare and you can test it with Little's test, though it has low power.

MNAR (Missing Not at Random) is possible if, say, participants drop out specifically because their outcome got worse, but you'd need sensitivity analyses for that.

**MI vs FIML**

Both are valid under MAR and asymptotically equivalent, but they differ in practice:

- **FIML** is built into SEM software (lavaan, Mplus) and is elegant if your analysis is structural. It uses all available data without creating imputed datasets.
- **MI** is more flexible — it works with any downstream analysis, handles non-normal outcomes better with predictive mean matching (PMM), and lets you include auxiliary variables easily.

For Likert-scale composites, I'd lean toward **MI with PMM** (mice package in R). Include as many auxiliary variables as possible in the imputation model — anything correlated with missingness or your outcome.

**Time-varying covariates in imputation**

Use the "wide format" imputation approach: reshape your data so each time point is a separate variable, then impute. This preserves temporal correlations. The \`mice\` package handles this well.

**Sample size**

With 15-20% dropout and n=500 starting, you should have plenty of power at each time point assuming random dropout. The bigger concern is non-random dropout — run sensitivity analyses under MNAR assumptions using pattern mixture models.

Happy to share R code for any of this.`,
      authorId: bob.id,
      questionId: q1.id,
      isAccepted: true,
      upvoteCount: 19,
    },
  });

  const a2 = await prisma.answer.create({
    data: {
      body: `Bob's answer is excellent. I'll add a few practical notes from the ML/computational side.

For testing your MAR assumption more rigorously, create a binary missingness indicator for each variable and regress it on all observed covariates. If nothing predicts it, you're closer to MCAR. Logistic regression works fine for this.

Also worth knowing: if you're planning any predictive modeling downstream, consider using the multiple imputed datasets for model training (train on each imputed dataset separately and pool results using Rubin's rules). Don't just impute once and treat it as truth — that underestimates uncertainty.

One tool worth checking: \`missMethods\` package in R has good utilities for testing sensitivity to different missingness assumptions. For visualizing patterns, \`naniar\` is excellent.`,
      authorId: alice.id,
      questionId: q1.id,
      isAccepted: false,
      upvoteCount: 8,
    },
  });

  const a3 = await prisma.answer.create({
    data: {
      body: `Having published ML research in sociology and political science journals, here's what actually worked for us:

**Beyond cross-validation**

1. **Holdout set from a different time period or geography** — if possible, train on one cohort and test on another. Reviewers love temporal/spatial out-of-sample validation.

2. **Permutation tests** — permute your outcome variable and refit the model 1000 times to build a null distribution. Your actual AUC should be significantly above the null. This convinces skeptical methodologists.

3. **SHAP values** — use SHAP (shapley additive explanations) for interpretability. Plot SHAP beeswarm charts showing which features drive predictions. Social scientists respond well to these compared to black-box metrics.

4. **Compare against theory-driven models** — fit a logistic regression based on variables that theory predicts should matter, then show your ML model improves on it (and explain why, using SHAP).

**On your AUC**

0.78 is solid for social science data. But also report: precision-recall AUC (especially if outcome is imbalanced), calibration curves, and decision curve analysis if there's a practical application.

**Journal strategy**

*Sociological Methods & Research*, *Political Analysis*, and *Journal of Quantitative Criminology* have been receptive to ML work that follows these practices. Pre-register the validation approach before fitting the final model.`,
      authorId: bob.id,
      questionId: q2.id,
      isAccepted: false,
      upvoteCount: 14,
    },
  });

  const a4 = await prisma.answer.create({
    data: {
      body: `I've run multi-country UX studies at a similar scale. Here's what I learned:

**Translation**

Work with local facilitators who are fluent in both the product domain and the local language. Have them translate and back-translate tasks. But critically: **pilot with 1-2 local participants before the main study** to catch anything that doesn't translate conceptually, not just linguistically.

For think-aloud protocols, most B2B SaaS users in Germany, Japan, Brazil have sufficient English that you can run in English — ask during screening. In Nigeria this is almost always fine.

**Facilitator consistency**

Create a facilitator guide with specific probe questions written out (not just "probe if unclear"). Record all sessions. Do a calibration session where all facilitators watch the same recording and discuss how they would have responded. Video calls with each facilitator before the study are worth the time.

**Acquiescence bias**

Real concern especially in Japan and Nigeria in my experience. Strategies:
- Use behavioral tasks rather than opinion questions
- Include "critical incident" questions ("Tell me about a time this frustrated you")
- Compare what participants say vs. what they do during tasks — divergence is informative

**Sample size**

5 per country is fine for qualitative themes using Nielsen's law. But for comparing error rates or task completion across countries, you'll need 8-12 per country for any meaningful comparison. What's your research question — formative or comparative?`,
      authorId: carol.id,
      questionId: q3.id,
      isAccepted: true,
      upvoteCount: 22,
    },
  });

  const a5 = await prisma.answer.create({
    data: {
      body: `Adding to Carol's excellent breakdown — one thing I've seen trip up cross-cultural UX studies is the concept of "usability" itself mapping differently across cultures.

In Japan and some other East Asian contexts, users often rate usability higher even when struggling, because admitting difficulty feels socially uncomfortable. Track behavioral metrics (time on task, error count, recovery strategies) independently from self-reported satisfaction scores.

For the facilitator consistency issue, I'd recommend using a shared coding scheme for think-aloud verbalisations. Tools like Dovetail or MAXQDA let distributed teams tag and code sessions with agreed-upon codes. This also helps when you're doing cross-country comparative analysis.`,
      authorId: alice.id,
      questionId: q3.id,
      isAccepted: false,
      upvoteCount: 7,
    },
  });

  const a6 = await prisma.answer.create({
    data: {
      body: `The p-value debate has mostly settled into a pragmatic consensus in behavioral science. Here's where things stand:

**What top journals actually want (2024/2025)**

Most high-impact journals in psychology (Psych Science, JPSP, JEP:G) now expect:
1. **Effect sizes with confidence intervals** — always, no exceptions
2. **Pre-registration** — for confirmatory studies; exploratory must be labeled as such
3. **p-values are okay** but shouldn't be the only evidence; treat 0.05 as one threshold among many

**Practical recommendations**

Use the "estimation approach": report effect sizes (Cohen's d, η², odds ratios) and 95% CIs as your primary results. P-values can appear but should be secondary. This is what most reviewers now expect.

For **multiple comparisons**, FDR (Benjamini-Hochberg) is standard. Bonferroni is too conservative for exploratory work.

**Bayesian methods**

Bayes factors (BF₁₀) are increasingly accepted and have one major advantage: they can provide evidence for the null hypothesis. Use JASP for easy Bayesian analysis alongside frequentist results. But Bayesian methods require defending your priors — if you can't defend them, reviewers will ask.

**Bottom line for your paper**

Pre-register, report effect sizes + CIs prominently, include p-values for continuity with the literature, and add Bayes factors if your analysis is cleanly suited to them. This covers all reviewer preferences.`,
      authorId: bob.id,
      questionId: q4.id,
      isAccepted: true,
      upvoteCount: 45,
    },
  });

  const a7 = await prisma.answer.create({
    data: {
      body: `Strong answer from Bob. One addition: for behavioral science specifically, the **equivalence testing** approach (TOST procedure) is underused but powerful.

If your goal is to show that an effect is *negligible* (e.g., testing whether a manipulation didn't matter), TOST lets you do that rigorously — something traditional NHST can't do. Lakens' \`TOSTER\` package in R makes this easy and it's been well received in cognition and social psych journals.

Also: if you're doing power analysis for your next study, consider using the Registered Reports format at journals like *Cortex*, *PLOS ONE*, or *Royal Society Open Science*. Reviewers evaluate your methods before you collect data — acceptance is in-principle before results are known. This completely sidesteps the p-hacking concern.`,
      authorId: alice.id,
      questionId: q4.id,
      isAccepted: false,
      upvoteCount: 12,
    },
  });

  const a8 = await prisma.answer.create({
    data: {
      body: `Concrete steps that have made a real difference in my cognitive psych lab:

**Pre-registration without stifling exploration**

Use the AsPredicted format for confirmatory studies (takes 10 minutes). For exploratory analyses, simply label them clearly in your paper as "exploratory" — most journals accept this framing now. The OSF also supports "registered reports" which separate reviewer evaluation of your design from your results.

**Data management with GDPR compliance**

We use a two-tier approach:
- Raw data (with any identifying info) stays on an encrypted institutional server, never shared
- Anonymized analysis dataset goes on OSF with a README explaining what was removed

For sharing analysis code, GitHub is standard. Use \`renv\` or \`groundhog\` to lock R package versions so your analysis reproduces in 5 years.

**Practical R Markdown tips**

Since you're already using R Markdown: use \`here::here()\` for file paths (not \`setwd()\`), \`set.seed()\` at the top of every analysis chunk, and consider \`targets\` package for complex pipelines.

**Sensitive participant data**

Synthetic data generation (using \`synthpop\` package) is increasingly accepted — you generate a synthetic dataset with the same statistical properties as your real data, share that openly, and keep the real data secure. Some journals now encourage this.

The UKRN primers on reproducibility are excellent free resources if you want structured guidance.`,
      authorId: carol.id,
      questionId: q5.id,
      isAccepted: false,
      upvoteCount: 28,
    },
  });

  console.log("✅ Answers created");

  // ==================== LISTINGS ====================

  const listing1 = await prisma.listing.upsert({
    where: { slug: "statistical-analysis-consulting-service" },
    update: {},
    create: {
      title: "Statistical Analysis & Consulting Service",
      tagline: "Expert biostatistics and survey analysis for your research project",
      description: `Comprehensive statistical consulting service for academic researchers, public health professionals, and industry clients.

**Services offered:**
- Study design and power analysis
- Survey design and validation (including factor analysis, reliability testing)
- Longitudinal data analysis (mixed models, GEE, survival analysis)
- Missing data handling (multiple imputation, FIML)
- Manuscript statistical review and methods section writing
- Code review for R, SPSS, SAS, and Stata

**What you get:**
- Initial 30-minute consultation (free)
- Written analysis plan before work begins
- Fully documented, reproducible R/SAS code
- Interpreted results in plain language
- Revisions until you're satisfied

**Typical turnaround:** 1-2 weeks for standard analyses; complex projects discussed case-by-case.

Trusted by researchers at 40+ universities and research institutions. Over 200 published papers supported.`,
      slug: "statistical-analysis-consulting-service",
      type: "SERVICE",
      categoryTags: ["statistics", "biostatistics", "consulting", "R", "survey-analysis"],
      isActive: true,
      authorId: bob.id,
      pricingInfo: "From $120/hour or fixed project rates",
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { slug: "researchsurvey-pro-tool" },
    update: {},
    create: {
      title: "ResearchSurvey Pro",
      tagline: "Academic-grade survey builder with built-in validity checks",
      description: `ResearchSurvey Pro is a survey platform built specifically for researchers — not marketers.

**Key features:**
- Validated scale library (500+ psychometric scales pre-loaded)
- Automatic attention check insertion
- Response quality scoring (satisficing detection, speeder flagging)
- Direct integration with R and Python for data export
- GDPR-compliant data storage (EU servers)
- Prolific and MTurk integration for participant recruitment
- Branching logic with visual flow editor
- Multi-language support (50+ languages)

**Why researchers choose us over Qualtrics:**
- 5x cheaper for academic use
- No corporate data sharing
- Built-in IRB documentation export
- Open API for custom integrations

Free tier available (up to 100 responses/month). Academic pricing from $29/month.`,
      slug: "researchsurvey-pro-tool",
      type: "TOOL",
      categoryTags: [
        "survey",
        "data-collection",
        "psychometrics",
        "GDPR",
        "academic-research",
      ],
      isActive: true,
      authorId: carol.id,
      websiteUrl: "https://researchsurvey.example.com",
      pricingInfo: "Free tier available; academic plans from $29/month",
    },
  });

  const listing3 = await prisma.listing.upsert({
    where: { slug: "litreview-ai-tool" },
    update: {},
    create: {
      title: "LitReview AI",
      tagline: "AI-powered literature review tool built for rigorous research",
      description: `LitReview AI helps researchers discover, synthesize, and organize scientific literature at scale — without hallucinations.

**How it works:**
1. Input your research question or upload your protocol
2. AI searches 200M+ papers across PubMed, arXiv, Semantic Scholar, and more
3. Get a structured summary with direct citations (no hallucinated references)
4. Export to Zotero, Mendeley, or BibTeX

**Key capabilities:**
- PRISMA-compliant screening workflow
- Automatic identification of contradictory findings across papers
- Citation network visualization
- Systematic review support with GRADE evidence grading
- Integrates with Overleaf for direct LaTeX export

**Accuracy guarantee:** Every claim is linked to a verifiable source. We don't generate content — we summarize and organize what exists.

Used by researchers at MIT, Stanford, UCL, and 300+ other institutions. 14-day free trial, no credit card required.`,
      slug: "litreview-ai-tool",
      type: "TOOL",
      categoryTags: [
        "literature-review",
        "AI",
        "systematic-review",
        "citation-management",
        "research-tools",
      ],
      isActive: true,
      authorId: alice.id,
      websiteUrl: "https://litreview.ai.example.com",
      demoUrl: "https://litreview.ai.example.com/demo",
      pricingInfo: "14-day free trial; plans from $49/month",
    },
  });

  console.log("✅ Listings created");

  // ==================== JOBS ====================

  const job1 = await prisma.job.upsert({
    where: { slug: "ml-research-engineer-techcorp" },
    update: {},
    create: {
      title: "ML Research Engineer — Scientific AI",
      description: `TechCorp Research is looking for an ML Research Engineer to join our Scientific AI team. You'll work on foundation models for scientific literature understanding, experimental design assistance, and research workflow automation.

**What you'll do:**
- Develop and fine-tune LLMs on scientific corpora (papers, datasets, protocols)
- Build evaluation frameworks for scientific reasoning benchmarks
- Collaborate with domain scientists to identify high-value ML research directions
- Publish findings at top ML and interdisciplinary venues (NeurIPS, ICML, Nature Methods)

**Requirements:**
- PhD or MS + 3 years experience in ML/NLP
- Strong publication record or equivalent applied experience
- Proficiency in Python, PyTorch or JAX
- Experience with large-scale training infrastructure (SLURM, AWS/GCP)
- Interest in scientific applications of AI

**Nice to have:**
- Background in bioinformatics, chemistry, or another natural science
- Experience with RLHF, instruction tuning, or scientific benchmarks

**Compensation:** $180k–$240k base + equity + research budget

**Location:** Remote-first; optional hub in San Francisco`,
      slug: "ml-research-engineer-techcorp",
      researchDomain: ["machine-learning", "NLP", "scientific-AI", "foundation-models"],
      requiredSkills: ["Python", "PyTorch", "LLMs", "NLP", "research-engineering"],
      projectType: "CONTRACT",
      budgetMin: 180000,
      budgetMax: 240000,
      locationPreference: "REMOTE",
      companyId: techcorp.id,
      status: "OPEN",
      timeline: "ASAP",
    },
  });

  const job2 = await prisma.job.upsert({
    where: { slug: "freelance-ux-researcher-techcorp" },
    update: {},
    create: {
      title: "Freelance UX Researcher — AI Product Research",
      description: `TechCorp Research is seeking a freelance UX Researcher to help us understand how scientists and researchers use our AI-powered tools. This is a 3-month contract with possibility of extension.

**The work:**
- Plan and execute 15-20 user interviews with researchers across disciplines
- Conduct usability testing sessions for 2 new product features
- Synthesize findings into actionable design recommendations
- Present research findings to product and engineering teams

**Ideal background:**
- 4+ years UX research experience
- Experience researching complex/technical products
- Strong interview and synthesis skills
- Familiarity with AI tools or scientific software a plus

**Logistics:**
- Remote, flexible hours
- $85–$110/hour depending on experience
- ~20 hours/week commitment
- Start date: flexible, ideally within 4 weeks

If you've done research with academic or scientific users before, we'd especially love to hear from you.`,
      slug: "freelance-ux-researcher-techcorp",
      researchDomain: ["UX-research", "user-research", "product-research"],
      requiredSkills: [
        "user-interviews",
        "usability-testing",
        "synthesis",
        "research-planning",
      ],
      projectType: "ONE_TIME",
      budgetMin: 85,
      budgetMax: 110,
      locationPreference: "REMOTE",
      companyId: techcorp.id,
      status: "OPEN",
      timeline: "3 months, ~20 hrs/week",
    },
  });

  console.log("✅ Jobs created");

  // ==================== ARTICLES ====================

  const article1 = await prisma.article.upsert({
    where: { slug: "replication-crisis-ten-years-on" },
    update: {},
    create: {
      title: "The Replication Crisis: Ten Years On, What Have We Learned?",
      body: `It has been a decade since Brian Nosek and his collaborators published the Reproducibility Project: Psychology, finding that only 36% of 100 published psychology studies replicated successfully. The shockwave that followed reshaped how we think about scientific knowledge, statistical inference, and the incentive structures of academia.

Ten years later, what has actually changed?

## The Good

The open science movement has made genuine structural gains. Pre-registration has moved from a fringe practice to an expectation at major journals. The Center for Open Science reports over 100,000 pre-registered studies on the OSF — up from a few thousand in 2015. Registered Reports, where journals commit to publication before results are known, now exist at over 300 journals.

Data sharing norms have shifted meaningfully in fields like genomics, economics, and increasingly psychology. Tools like GitHub, OSF, and Zenodo have made sharing practical. Some journals now require analysis code for submission.

Statistical practice has improved, at least in the literature. Effect sizes and confidence intervals are more common. Researchers are more likely to acknowledge the exploratory nature of their work.

## The Less Good

The incentive structures that produced the replication crisis remain largely intact. Grants still flow toward novel findings. Tenure committees still count publications in high-impact journals, which still prefer positive results. Replication studies remain hard to publish.

P-hacking and HARKing (hypothesizing after results are known) haven't disappeared — they've become more sophisticated. The same exploratory flexibility that plagued research in 2015 can now be obscured by selective pre-registration or undisclosed deviations from pre-registered plans.

The crisis also proved to be uneven. Fields like cognitive psychology have grappled seriously with replication issues, but large swaths of clinical psychology, educational research, and applied social science have been slower to engage.

## What Comes Next

The frontier is now in intervention research — not just documenting that effects don't replicate, but understanding why. Methodological studies on effect size inflation, publication bias correction (p-curve, p-uniform, three-parameter selection models), and meta-analytic methods have matured considerably.

Multi-site replications (like ManyLabs) have demonstrated that well-powered, pre-registered replications can produce robust findings. The key is infrastructure and incentives to support this work.

The replication crisis was not a crisis of individual dishonesty. It was a systems problem — a set of incentives and norms that made it rational to behave in ways that produced unreliable science. Fixing it requires changing those systems, not just individual practices.

Ten years on, we've made a start.`,
      slug: "replication-crisis-ten-years-on",
      authorId: bob.id,
      category: "open-science",
      tags: ["replication-crisis", "open-science", "meta-science", "psychology", "statistics"],
      readTime: 8,
      status: "PUBLISHED",
      publishedAt: new Date("2025-10-15"),
      upvoteCount: 87,
    },
  });

  const article2 = await prisma.article.upsert({
    where: { slug: "ai-peer-review-promise-and-peril" },
    update: {},
    create: {
      title: "AI in Peer Review: Promise and Peril",
      body: `Journals are quietly experimenting with AI-assisted peer review, and the research community should pay attention.

The promise is real. Peer review is broken in ways everyone acknowledges: slow, inconsistent, and subject to the same biases that plague science more broadly. A 2022 study found that reviewer agreement on whether to accept a paper was barely above chance for many fields. The median time from submission to first decision has grown to 6+ months at top journals. Researchers spend enormous time on reviews that go uncompensated and unrecognized.

AI systems can provide faster, more consistent preliminary screening. They can check for statistical errors (statcheck-style), flag potential plagiarism, and identify missing citations or methodological issues that a rushed reviewer might miss. For high-volume journals receiving thousands of submissions, this has obvious appeal.

## What's Actually Being Deployed

The landscape is fragmented. *Nature Portfolio* journals have trialed AI tools for checking reporting standards compliance. *PLOS* has experimented with AI-generated reviewer summaries. Several preprint servers use automated screening for obvious quality issues.

Elsevier, Springer, and other large publishers have AI tools in development or deployment that they're understandably cagey about describing in detail.

## The Peril

The risks are several and serious.

**Homogenization**: If AI systems trained on existing literature learn what "good" science looks like, they risk encoding current paradigms as permanent. Unconventional but important work — which often looks "wrong" by existing standards — could be systematically penalized.

**Gaming**: Once researchers know what signals AI reviewers flag, they'll optimize for those signals. This is already visible in grant writing, where AI writing assistants produce proposals that score well on NIH study section criteria regardless of scientific merit.

**Liability gaps**: When an AI system recommends rejection and a human editor follows that recommendation, who is responsible for the outcome? Current frameworks don't answer this.

**Transparency**: Researchers submitting work have a legitimate interest in knowing whether AI reviewed their work, which systems were used, and how AI recommendations were weighted.

## What Good AI-Assisted Review Looks Like

AI should augment, not replace, human judgment. The most defensible uses are: automated technical checks (statistics, figure quality, reference format), workload triage (routing papers to appropriate reviewers), and reviewer matching (using publication history to find genuine experts).

Any AI involvement should be disclosed to authors. Researchers should be able to request human-only review. And the systems used should be audited for bias, particularly regarding author demographics, institutional prestige, and unconventional methodologies.

Peer review is a social contract as much as a technical process. AI can help — but only if implemented with transparency and appropriate limits on its authority.`,
      slug: "ai-peer-review-promise-and-peril",
      authorId: alice.id,
      category: "technology",
      tags: ["AI", "peer-review", "publishing", "open-science", "research-integrity"],
      readTime: 7,
      status: "PUBLISHED",
      publishedAt: new Date("2025-11-02"),
      upvoteCount: 64,
    },
  });

  const article3 = await prisma.article.upsert({
    where: { slug: "mixed-methods-research-guide" },
    update: {},
    create: {
      title: "When to Use Mixed Methods: A Practical Guide for Researchers",
      body: `"Mixed methods" has become something of a buzzword in research methodology circles — invoked often, understood less frequently. This is a practical guide to when mixed methods actually adds value, and when it's methodological overreach.

## What Mixed Methods Actually Means

Mixed methods research combines quantitative and qualitative approaches within a single study or research program. The combination can happen at different levels: data collection, analysis, or interpretation.

The key insight is that qualitative and quantitative data answer different kinds of questions. Quantitative data tells you *how much* and *how often*. Qualitative data tells you *why* and *what it means*. Used together, they can answer questions that neither approach could address alone.

## When Mixed Methods Adds Value

**Explanation**: You have a surprising quantitative finding and want to understand why. A large survey finds that higher income is associated with lower wellbeing in one demographic group. Qualitative interviews can probe the mechanisms and generate hypotheses.

**Exploration**: You're studying a phenomenon that isn't well characterized. You don't know what questions to ask in a survey because you don't know what dimensions matter. Qualitative work first, then quantitative to test and generalize.

**Validation**: You want to check whether your quantitative measures actually capture what participants mean. Cognitive interviewing (asking participants to think aloud while completing a survey) can reveal systematic misinterpretation.

**Convergence/triangulation**: Independent qualitative and quantitative strands converge on the same conclusion, strengthening your confidence in the finding.

## When Mixed Methods Doesn't Help

Mixed methods adds complexity — and cost. It requires competence in both traditions, which is genuinely hard to develop. Using it when you don't need to creates methodological theater: the appearance of rigor without the substance.

Avoid mixed methods when: your quantitative or qualitative question can stand alone, when you're adding a qualitative component to justify an N that's too small, or when you don't have the skills or resources to do both strands well.

## Practical Considerations

**Timing**: Sequential designs (qual → quant, or quant → qual) are easier to execute. Concurrent designs (running both at once) require more coordination but can complete faster.

**Weighting**: Be explicit about whether qual and quant are equal, or whether one is primary and the other supplementary (QUAL + quant, or QUAN + qual in standard notation).

**Integration**: The most common failure mode is parallel reporting — qualitative and quantitative findings presented side-by-side with no integration. Real integration means actively combining findings at the interpretation stage, noting convergence, divergence, and what the combination means beyond either strand alone.

Mixed methods done well is genuinely powerful. Done carelessly, it's twice the work for no additional insight.`,
      slug: "mixed-methods-research-guide",
      authorId: carol.id,
      category: "methodology",
      tags: [
        "mixed-methods",
        "research-design",
        "qualitative",
        "quantitative",
        "methodology",
      ],
      readTime: 9,
      status: "PUBLISHED",
      publishedAt: new Date("2025-09-22"),
      upvoteCount: 52,
    },
  });

  const article4 = await prisma.article.upsert({
    where: { slug: "learn-to-code-for-researchers" },
    update: {},
    create: {
      title: "Why Every Researcher Should Learn to Code (And How to Start)",
      body: `The question used to be whether researchers in empirical disciplines should learn to code. That debate is over. The question now is how to learn efficiently, and which skills to prioritize.

This is a practical guide for researchers who want to add computational skills to their toolkit — written by someone who learned R after a decade of SPSS, and wishes they'd started sooner.

## Why It Matters

Point-and-click statistical software creates a reproducibility problem: your analysis is locked inside menu choices that aren't recorded anywhere. Code is documentation. When your analysis is a script, anyone (including future you) can see exactly what you did, reproduce it, and verify it.

Code also dramatically expands what's possible. Web scraping, text analysis, simulation studies, API access to databases, custom visualizations — these are either impossible or very difficult without programming. The ceiling for what a single researcher can accomplish rises substantially.

## Which Language?

**R** if you're in social sciences, psychology, epidemiology, ecology, or any field with strong statistical analysis needs. The tidyverse is approachable, the statistical ecosystem is unmatched, and most methods papers release R code.

**Python** if you're in fields closer to computer science, if you anticipate working with large datasets, or if machine learning is central to your work. Python's ML ecosystem (scikit-learn, PyTorch, transformers) has no R equivalent.

**Both** eventually, if you're quantitatively oriented. They're complementary: R for statistics and visualization, Python for data engineering and ML.

## How to Actually Learn

The research on skill acquisition is clear: **deliberate practice on real problems beats tutorials**. The worst way to learn R is to work through a textbook; the best way is to take your current analysis (which you could do in SPSS or Excel) and redo it in R.

Specific recommendations:
- *R for Data Science* (Hadley Wickham, free online) for R
- *Python for Data Analysis* (Wes McKinney) for Python
- Posit Cloud (formerly RStudio Cloud) lets you run R in your browser without installing anything

Expect the first project to take 3–5x longer than your usual approach. The second will take 2x. By the fifth, you'll be faster than before and your analysis will be reproducible.

## Common Mistakes

**Starting with the "right" tool**: The best tool is the one you'll actually use. Start with whichever language your lab or collaborators use.

**Tutorial purgatory**: Completing courses without applying them to real work. Apply immediately.

**Trying to learn everything**: You need tidyverse basics and ggplot2. You don't need to understand R's object model before you can analyze data.

The investment pays off fast. Most researchers who make the transition report that it changed how they think about research design, not just analysis — because when writing code is easy, you run more exploratory analyses and catch more problems early.`,
      slug: "learn-to-code-for-researchers",
      authorId: alice.id,
      category: "education",
      tags: ["coding", "R", "Python", "reproducibility", "data-analysis", "skills"],
      readTime: 10,
      status: "PUBLISHED",
      publishedAt: new Date("2025-12-01"),
      upvoteCount: 118,
    },
  });

  const article5 = await prisma.article.upsert({
    where: { slug: "social-media-research-ethics-2025" },
    update: {},
    create: {
      title: "Ethical Challenges in Social Media Research: A 2025 Update",
      body: `Using social media data for research has never been more complicated — or more contested. Platform API changes, evolving IRB guidance, and shifting public norms around privacy have created a landscape where what is technically possible and what is ethically appropriate are increasingly misaligned.

## The API Situation

The Twitter/X API changes of 2023 effectively ended most academic social media research using that platform. What was available for free is now priced out of reach for most researchers ($42,000/year for enterprise access). Reddit followed with changes that ended third-party research access. TikTok has never had a genuine research API.

This has pushed researchers toward scraping — which is technically viable but legally and ethically complicated. The Computer Fraud and Abuse Act (CFAA) and platform terms of service create real legal risk. *hiQ v. LinkedIn* established some protections for scraping public data, but the law remains unsettled.

## IRB Guidance in 2025

IRB approaches to social media research have evolved but remain inconsistent. Key considerations that most IRBs now grapple with:

**Public vs. private**: Content posted "publicly" may not have been posted with research use in mind. The contextual integrity framework (Helen Nissenbaum) provides a useful lens: information flows appropriately when they match the norms of the context in which it was shared.

**Aggregation**: Individual data points may be innocuous; combined with other data, they can create privacy violations or enable re-identification. IRBs increasingly require a discussion of aggregation risks.

**Vulnerable populations**: Research on mental health communities, political radicals, or other sensitive groups requires heightened scrutiny even when data is technically public.

**Consent in retrospective research**: You cannot obtain consent from users whose historical posts you're studying. IRBs have developed exemptions, but these require careful documentation of why consent is not required.

## Emerging Best Practices

Store only what you need, for as long as you need it, with encryption. Never publish verbatim quotes that could identify individuals. Use differential privacy techniques when publishing aggregate statistics. Provide value back to communities studied when possible.

The AoIR Ethics Guidelines (most recent revision: 2024) remain the best starting framework. Supplement with your discipline's specific guidance.

## The Bigger Question

The underlying tension is that social media data is extraordinarily valuable for understanding human behavior at scale — and the people whose behavior you're studying didn't consent to be research subjects. This isn't a new problem in social science, but the scale and specificity of the data make it newly acute.

Researchers should be asking not just "is this legal?" and "will IRB approve it?" but "would the people I'm studying consider this an acceptable use of their data?" That's a harder question, and there's no formula — but it's the right one to start with.`,
      slug: "social-media-research-ethics-2025",
      authorId: bob.id,
      category: "ethics",
      tags: ["social-media", "research-ethics", "privacy", "IRB", "data-collection"],
      readTime: 11,
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-14"),
      upvoteCount: 73,
    },
  });

  console.log("✅ Articles created");

  // ==================== FOLLOWS ====================

  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: alice.id, followingId: carol.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: carol.id, followingId: alice.id },
      { followerId: carol.id, followingId: bob.id },
      { followerId: techcorp.id, followingId: alice.id },
      { followerId: techcorp.id, followingId: bob.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Follows created");

  // ==================== NOTIFICATIONS ====================

  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        type: "answer_accepted",
        title: "Your answer was accepted!",
        body: "Bob accepted your answer on 'How do you handle missing data in a longitudinal study?'",
        link: `/forum/how-handle-missing-data-longitudinal-study`,
        isRead: false,
      },
      {
        userId: alice.id,
        type: "new_follower",
        title: "TechCorp Research is now following you",
        body: "TechCorp Research started following your profile.",
        link: `/profile/techcorp_research`,
        isRead: true,
      },
      {
        userId: bob.id,
        type: "answer_upvote",
        title: "Your answer received 5 new upvotes",
        body: "Your answer on 'Are p-values still relevant in modern research?' is trending.",
        link: `/forum/p-values-still-relevant-modern-research`,
        isRead: false,
      },
      {
        userId: bob.id,
        type: "new_follower",
        title: "Alice Chen is now following you",
        body: "Alice Chen started following your profile.",
        link: `/profile/alice_chen`,
        isRead: true,
      },
      {
        userId: carol.id,
        type: "answer_accepted",
        title: "Your answer was accepted!",
        body: "Someone accepted your answer on 'Methodology for cross-cultural UX research across 5 countries'",
        link: `/forum/cross-cultural-ux-research-methodology`,
        isRead: false,
      },
      {
        userId: carol.id,
        type: "article_published",
        title: "Your article was published",
        body: "'When to Use Mixed Methods: A Practical Guide for Researchers' is now live.",
        link: `/news/mixed-methods-research-guide`,
        isRead: true,
      },
    ],
    skipDuplicates: false,
  });

  console.log("✅ Notifications created");

  // ==================== VOTES ====================

  await prisma.vote.createMany({
    data: [
      // Votes on answers
      { userId: alice.id, targetType: "ANSWER", targetId: a1.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "ANSWER", targetId: a1.id, value: "UPVOTE" },
      { userId: alice.id, targetType: "ANSWER", targetId: a6.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "ANSWER", targetId: a6.id, value: "UPVOTE" },
      { userId: bob.id, targetType: "ANSWER", targetId: a4.id, value: "UPVOTE" },
      { userId: alice.id, targetType: "ANSWER", targetId: a4.id, value: "UPVOTE" },
      // Votes on questions
      { userId: bob.id, targetType: "QUESTION", targetId: q1.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "QUESTION", targetId: q1.id, value: "UPVOTE" },
      { userId: alice.id, targetType: "QUESTION", targetId: q4.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "QUESTION", targetId: q4.id, value: "UPVOTE" },
      // Votes on articles
      { userId: alice.id, targetType: "ARTICLE", targetId: article1.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "ARTICLE", targetId: article1.id, value: "UPVOTE" },
      { userId: bob.id, targetType: "ARTICLE", targetId: article4.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "ARTICLE", targetId: article4.id, value: "UPVOTE" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Votes created");

  // ==================== BADGES ====================

  await prisma.badge.createMany({
    data: [
      { userId: alice.id, name: "First Answer", category: "forum" },
      { userId: alice.id, name: "Machine Learning Expert", category: "expertise" },
      { userId: alice.id, name: "Verified Researcher", category: "profile" },
      { userId: bob.id, name: "Top Contributor", category: "forum" },
      { userId: bob.id, name: "Statistics Expert", category: "expertise" },
      { userId: bob.id, name: "Verified Researcher", category: "profile" },
      { userId: bob.id, name: "500 Points Club", category: "gamification" },
      { userId: carol.id, name: "First Answer", category: "forum" },
      { userId: carol.id, name: "UX Research Expert", category: "expertise" },
      { userId: carol.id, name: "Article Author", category: "news" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Badges created");

  console.log("\n✅ Database seeding complete!");
  console.log("\nSeed accounts (all passwords: password123):");
  console.log("  alice@example.com — RESEARCHER (Alice Chen)");
  console.log("  bob@example.com — RESEARCHER (Bob Martinez)");
  console.log("  carol@example.com — RESEARCHER (Carol Nguyen)");
  console.log("  admin@techcorp.com — COMPANY (TechCorp Research)");
  console.log("  admin@researchhub.com — ADMIN");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
