const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Intellectual Exchange",
    url: BASE_URL,
    description: "A professional platform for researchers, academics, and companies.",
    // TODO: Add social media URLs when available
    sameAs: [],
  };
}

export function questionSchema(question: {
  title: string;
  body: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null };
  answers: { body: string; isAccepted: boolean; createdAt: Date; author: { name: string | null } }[];
}) {
  const accepted = question.answers.find((a) => a.isAccepted);
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.title,
      text: question.body.slice(0, 500),
      dateCreated: question.createdAt.toISOString(),
      dateModified: question.updatedAt.toISOString(),
      author: { "@type": "Person", name: question.author.name || "Anonymous" },
      answerCount: question.answers.length,
      acceptedAnswer: accepted
        ? {
            "@type": "Answer",
            text: accepted.body.slice(0, 500),
            dateCreated: accepted.createdAt.toISOString(),
            author: { "@type": "Person", name: accepted.author.name || "Anonymous" },
          }
        : undefined,
    },
  };
}

export function articleSchema(article: {
  title: string;
  body: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage: string | null;
  author: { name: string | null };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.author.name || "Anonymous" },
    publisher: { "@type": "Organization", name: "The Intellectual Exchange", url: BASE_URL },
    image: article.coverImage || undefined,
    url: `${BASE_URL}/news/${article.slug}`,
  };
}

export function jobSchema(job: {
  title: string;
  slug: string;
  locationPreference: string;
  projectType: string;
  createdAt: Date;
  company: { companyName: string | null };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.createdAt.toISOString(),
    hiringOrganization: { "@type": "Organization", name: job.company.companyName || "Unknown" },
    jobLocationType: job.locationPreference === "REMOTE" ? "TELECOMMUTE" : undefined,
    url: `${BASE_URL}/talent-board/${job.slug}`,
  };
}

export function personSchema(user: {
  name: string | null;
  username: string;
  bio?: string | null;
  about?: string | null;
  expertise?: string[];
  socialLinks?: Record<string, string> | null;
}) {
  const sameAs = user.socialLinks
    ? Object.values(user.socialLinks).filter(Boolean)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name || user.username,
    url: `${BASE_URL}/profile/${user.username}`,
    description: (user.about || user.bio)?.slice(0, 160) || undefined,
    jobTitle: user.bio?.slice(0, 100) || undefined,
    knowsAbout: user.expertise && user.expertise.length > 0 ? user.expertise : undefined,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
  };
}

export function organizationProfileSchema(company: {
  companyName: string | null;
  username: string;
  description?: string | null;
  website?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.companyName || company.username,
    url: company.website || `${BASE_URL}/profile/${company.username}`,
    description: company.description?.slice(0, 160) || undefined,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

export function howToSchema(name: string, steps: { name: string; text: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
}
