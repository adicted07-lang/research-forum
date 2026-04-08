const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://researchhub.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Intellectual Exchange",
    url: BASE_URL,
    description: "A professional platform for researchers, academics, and companies.",
    sameAs: [],
  };
}

export function questionSchema(question: {
  title: string;
  body: string;
  slug: string;
  createdAt: Date;
  author: { name: string | null };
  answers: { body: string; createdAt: Date; author: { name: string | null } }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.title,
      text: question.body.slice(0, 500),
      dateCreated: question.createdAt.toISOString(),
      author: { "@type": "Person", name: question.author.name || "Anonymous" },
      answerCount: question.answers.length,
      acceptedAnswer: question.answers[0]
        ? {
            "@type": "Answer",
            text: question.answers[0].body.slice(0, 500),
            dateCreated: question.answers[0].createdAt.toISOString(),
            author: { "@type": "Person", name: question.answers[0].author.name || "Anonymous" },
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
  coverImage: string | null;
  author: { name: string | null };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt?.toISOString(),
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
    url: `${BASE_URL}/hire/${job.slug}`,
  };
}

export function personSchema(user: {
  name: string | null;
  username: string;
  bio?: string | null;
  about?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name || user.username,
    url: `${BASE_URL}/profile/${user.username}`,
    description: (user.about || user.bio)?.slice(0, 160) || undefined,
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
