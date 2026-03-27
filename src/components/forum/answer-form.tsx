"use client";

import { useRef, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { createAnswer } from "@/server/actions/answers";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

interface AnswerFormProps {
  questionId: string;
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bodyHtml, setBodyHtml] = useState("");

  if (!session) {
    return (
      <div className="bg-white border border-border-light rounded-md p-6 text-center dark:bg-surface-dark dark:border-border-dark-light">
        <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-3">
          Sign in to post an answer
        </p>
        <Link
          href="/login"
          className="inline-flex px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("body", bodyHtml);

    startTransition(async () => {
      const result = await createAnswer(questionId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        // Refresh to show new answer
        window.location.reload();
      }
    });
  };

  if (success) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-md p-4 text-success text-sm font-medium">
        Your answer was posted successfully!
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-4">
        Your Answer
      </h3>

      <form ref={formRef} onSubmit={handleSubmit}>
        <RichTextEditor
          content={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Write your answer here..."
        />

        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {isPending ? "Posting..." : "Post Answer"}
          </button>
        </div>
      </form>
    </div>
  );
}
