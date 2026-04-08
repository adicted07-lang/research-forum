"use client";

import { useRouter } from "next/navigation";
import { ActionSearchBar, type Action } from "@/components/ui/action-search-bar";
import {
  HelpCircle,
  ShoppingBag,
  FileText,
  Briefcase,
  Search,
  Users,
  Database,
  Clock,
} from "lucide-react";

const researchActions: Action[] = [
  {
    id: "1",
    label: "Ask a Question",
    icon: <HelpCircle className="h-4 w-4 text-blue-500" />,
    description: "Forum",
    short: "",
    end: "Create",
  },
  {
    id: "2",
    label: "Browse Forum",
    icon: <Search className="h-4 w-4 text-orange-500" />,
    description: "Questions",
    short: "⌘K",
    end: "Navigate",
  },
  {
    id: "3",
    label: "List a Service",
    icon: <ShoppingBag className="h-4 w-4 text-purple-500" />,
    description: "Marketplace",
    short: "",
    end: "Create",
  },
  {
    id: "4",
    label: "Write an Article",
    icon: <FileText className="h-4 w-4 text-green-500" />,
    description: "News",
    short: "",
    end: "Create",
  },
  {
    id: "5",
    label: "Post a Job",
    icon: <Briefcase className="h-4 w-4 text-blue-500" />,
    description: "Talent Board",
    short: "",
    end: "Create",
  },
  {
    id: "6",
    label: "Find Researchers",
    icon: <Users className="h-4 w-4 text-teal-500" />,
    description: "Browse",
    short: "",
    end: "Navigate",
  },
  {
    id: "7",
    label: "Upload Dataset",
    icon: <Database className="h-4 w-4 text-amber-500" />,
    description: "Datasets",
    short: "",
    end: "Create",
  },
  {
    id: "8",
    label: "Schedule Office Hours",
    icon: <Clock className="h-4 w-4 text-red-500" />,
    description: "Live Q&A",
    short: "",
    end: "Create",
  },
];

export function QuickActions() {
  return <ActionSearchBar actions={researchActions} />;
}
