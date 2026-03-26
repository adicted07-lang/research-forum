"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { acceptAnswer } from "@/server/actions/answers";

interface AcceptAnswerButtonProps {
  answerId: string;
}

export function AcceptAnswerButton({ answerId }: AcceptAnswerButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      await acceptAnswer(answerId);
    });
  };

  return (
    <button
      onClick={handleAccept}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-success text-success text-xs font-semibold rounded-md hover:bg-success/10 transition-colors disabled:opacity-60"
    >
      <CheckCircle className="w-3.5 h-3.5" />
      {isPending ? "Accepting..." : "Accept Answer"}
    </button>
  );
}
