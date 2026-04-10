"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Endorser = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
};

type EndorsersPopoverProps = {
  count: number;
  endorsers: Endorser[];
  skill: string;
};

export function EndorsersPopover({ count, endorsers, skill }: EndorsersPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (count === 0) return null;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-text-secondary dark:text-text-dark-secondary hover:text-primary cursor-pointer"
        aria-label={`${count} endorsements for ${skill}`}
      >
        ({count})
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-50 p-3">
          <p className="text-xs font-semibold text-text-primary dark:text-text-dark-primary mb-2">
            Endorsed by
          </p>
          <ul className="space-y-2">
            {endorsers.map((endorser) => (
              <li key={endorser.id}>
                <Link
                  href={`/profile/${endorser.username || endorser.id}`}
                  className="flex items-center gap-2 hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary rounded p-1 -m-1"
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={endorser.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(endorser.name)}`}
                    alt={endorser.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-text-primary dark:text-text-dark-primary">
                    {endorser.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {count > endorsers.length && (
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-2">
              and {count - endorsers.length} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
