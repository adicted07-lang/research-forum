import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgePill } from "@/components/shared/badge-pill";
import { ArticleCover } from "@/components/news/article-cover";
import { getQuestions } from "@/server/actions/questions";
import { getListings } from "@/server/actions/listings";
import { getJobs } from "@/server/actions/jobs";
import { getArticles } from "@/server/actions/articles";
import { TrendingUp, Sparkles, Briefcase, Newspaper, Brain, Globe, Dna, Activity, BarChart3, Network, HeartPulse, Atom, MessageSquare, Database, HelpCircle, ShoppingBag, MapPin, Microscope, FlaskConical, BookOpen, GraduationCap, Lightbulb, FileSearch, type LucideIcon } from "lucide-react";
import { HomepageSidebar } from "@/components/home/homepage-sidebar";

const POPULAR_TAGS = [
  "machine-learning", "climate-science", "genomics", "neuroscience", "statistics",
  "deep-learning", "epidemiology", "quantum-computing", "nlp", "bioinformatics",
];

const TAG_ICONS: Record<string, LucideIcon> = {
  "machine-learning": Brain,
  "climate-science": Globe,
  "genomics": Dna,
  "neuroscience": Activity,
  "statistics": BarChart3,
  "deep-learning": Network,
  "epidemiology": HeartPulse,
  "quantum-computing": Atom,
  "nlp": MessageSquare,
  "bioinformatics": Database,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let questions: any[] = [];
  let listings: any[] = [];
  let jobs: any[] = [];
  let articles: any[] = [];

  try { questions = (await getQuestions({ sort: "trending", limit: 4 })).questions; } catch {}
  try { listings = await getListings({ sort: "trending", limit: 4 }); } catch {}
  try { jobs = await getJobs({ sort: "newest", limit: 3 }); } catch {}
  try { articles = (await getArticles({ sort: "latest", limit: 3 })).articles; } catch {}

  return (
    <PageLayout
      sidebar={
        <HomepageSidebar
          tags={POPULAR_TAGS.map((tag) => ({ tag, icon: TAG_ICONS[tag] }))}
        />
      }
    >
      <div className="relative text-center py-16 mb-8 border-b border-border-light dark:border-border-dark-light overflow-hidden rounded-xl">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none" aria-hidden="true">
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-primary dark:text-text-dark-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>
        {/* Gradient orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" aria-hidden="true" />
        {/* Floating research icons */}
        <div className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-50" aria-hidden="true">
          <Microscope className="absolute top-4 left-[5%] w-8 h-8 text-primary/20 rotate-[-12deg]" />
          <Dna className="absolute top-3 left-[25%] w-7 h-7 text-blue-400/20 rotate-[18deg]" />
          <FlaskConical className="absolute top-6 right-[30%] w-9 h-9 text-purple-400/20 rotate-[-8deg]" />
          <Atom className="absolute top-3 right-[8%] w-8 h-8 text-teal-400/20 rotate-[15deg]" />
          <Brain className="absolute top-[40%] left-[3%] w-10 h-10 text-rose-400/20 rotate-[10deg]" />
          <GraduationCap className="absolute top-[45%] right-[4%] w-9 h-9 text-amber-400/20 rotate-[-20deg]" />
          <BookOpen className="absolute bottom-[35%] left-[12%] w-7 h-7 text-green-400/20 rotate-[22deg]" />
          <Globe className="absolute bottom-[38%] right-[15%] w-8 h-8 text-sky-400/20 rotate-[-5deg]" />
          <Lightbulb className="absolute bottom-6 left-[8%] w-8 h-8 text-yellow-400/20 rotate-[14deg]" />
          <FileSearch className="absolute bottom-4 left-[35%] w-7 h-7 text-indigo-400/20 rotate-[-18deg]" />
          <HeartPulse className="absolute bottom-5 right-[25%] w-8 h-8 text-red-400/20 rotate-[8deg]" />
          <Network className="absolute bottom-4 right-[6%] w-9 h-9 text-cyan-400/20 rotate-[-12deg]" />
        </div>
        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3 tracking-tight">
            The Intellectual Exchange
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-4 max-w-xl mx-auto">
            Where researchers exchange knowledge, hire experts, and discover tools.
          </p>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Join 500+ researchers
          </p>
        </div>
      </div>

      {/* Trending Questions */}
      <section className="mb-8">
        <SectionHeader title="Trending Questions" href="/forum" icon={TrendingUp} />
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q: any) => (
              <div key={q.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <Link href={`/forum/${q.slug}`}>
                    <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{q.title}</h3>
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{q.upvoteCount} upvotes</span>
                    <span>{q.answerCount} answers</span>
                    <div className="flex gap-1">{q.tags?.slice(0, 3).map((t: string) => <BadgePill key={t} label={t} />)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No questions yet" description="Be the first to ask." />
        )}
      </section>

      {/* Top Services */}
      <section className="mb-8">
        <SectionHeader title="Top Services & Tools" href="/marketplace" icon={Sparkles} />
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((l: any) => (
              <div key={l.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <Link href={`/marketplace/${l.slug}`}>
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{l.title}</h3>
                  </Link>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2">{l.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="List your service or tool." />
        )}
      </section>

      {/* Jobs */}
      <section className="mb-8">
        <SectionHeader title="Talent Board" href="/talent-board" icon={Briefcase} />
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((j: any) => (
              <div key={j.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <Link href={`/talent-board/${j.slug}`}>
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{j.title}</h3>
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                    <MapPin className="w-3 h-3" />
                    <span>{j.locationPreference}</span>
                    <span>·</span>
                    <span>{j.projectType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No jobs yet" description="Post a research project." />
        )}
      </section>

      {/* News */}
      <section className="mb-8">
        <SectionHeader title="News" href="/news" icon={Newspaper} />
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {articles.map((a: any) => (
              <div key={a.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md overflow-hidden hover:border-border hover:shadow-sm transition-all">
                <Link href={`/news/${a.slug}`} className="block">
                  {a.coverImage ? (
                    <Image src={a.coverImage} alt={a.title} width={400} height={225} className="w-full object-cover" style={{ aspectRatio: "16/9" }} />
                  ) : (
                    <ArticleCover category={a.category ?? "news"} title={a.title} />
                  )}
                </Link>
                <div className="p-3">
                  <Link href={`/news/${a.slug}`}>
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1 line-clamp-2">{a.title}</h3>
                  </Link>
                  <p className="text-xs text-text-tertiary">{a.readTime} min read</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No articles yet" description="Check back soon." />
        )}
      </section>
    </PageLayout>
  );
}
