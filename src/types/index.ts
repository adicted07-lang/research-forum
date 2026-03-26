export type VoteValue = "upvote" | "downvote";

export type TargetType =
  | "question"
  | "answer"
  | "listing"
  | "article"
  | "comment";

export type QuestionStatus = "open" | "answered" | "closed";

export type ListingType = "service" | "tool";

export type ProjectType = "one_time" | "ongoing" | "contract";

export type LocationPreference = "remote" | "on_site" | "hybrid";

export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected";

export type ArticleCategory =
  | "news"
  | "opinion"
  | "how_to"
  | "interview"
  | "announcement"
  | "makers";

export type ArticleStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published";

export type AdType = "feed" | "banner" | "featured_listing";

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "paused"
  | "completed";

export type CommentAward =
  | "insightful"
  | "well_researched"
  | "helpful"
  | "good_find";

export type BadgeCategory =
  | "streak"
  | "tastemaker"
  | "community"
  | "expertise"
  | "hiring";

export interface NavItem {
  label: string;
  href: string;
}
