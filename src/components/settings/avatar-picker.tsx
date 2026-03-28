"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

// DiceBear 3D avatar seeds — each generates a unique 3D cartoon face
const AVATAR_SEEDS = [
  "Felix", "Aneka", "Jade", "Leo", "Mia", "Oscar", "Zara", "Kai",
  "Luna", "Max", "Aria", "Finn", "Nova", "Theo", "Iris", "Axel",
  "Sage", "Ruby", "Orion", "Cleo", "Atlas", "Lyra", "Hugo", "Piper",
  "Miles", "Wren", "Quinn", "Juno", "Ezra", "Ember", "Dash", "Ivy",
  "Rio", "Skye", "Knox", "Nora", "Beck", "Lila", "Cole", "Faye",
];

function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fdba74,fed7aa,fecaca,fde68a,ffedd5&backgroundType=gradientLinear`;
}

function isDiceBearUrl(url: string): boolean {
  return url.startsWith("https://api.dicebear.com/");
}

interface AvatarPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

export function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 20;
  const totalPages = Math.ceil(AVATAR_SEEDS.length / perPage);
  const visibleSeeds = AVATAR_SEEDS.slice(page * perPage, (page + 1) * perPage);

  const isSelected = isDiceBearUrl(selected);

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-border dark:border-border-dark hover:border-primary transition-colors cursor-pointer bg-surface dark:bg-surface-dark flex items-center justify-center"
        >
          {isSelected ? (
            <img src={selected} alt="Avatar" className="w-full h-full object-cover" />
          ) : selected ? (
            <img src={selected} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-text-tertiary">?</span>
          )}
        </button>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
            {isSelected ? "Custom Avatar" : selected ? "Uploaded Photo" : "Choose an avatar"}
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-primary hover:underline"
          >
            {isOpen ? "Close picker" : "Pick an avatar"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 bg-surface dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {visibleSeeds.map((seed) => {
              const url = getAvatarUrl(seed);
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => {
                    onChange(url);
                    setIsOpen(false);
                  }}
                  title={seed}
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden transition-all hover:scale-110 bg-white dark:bg-surface-dark",
                    selected === url
                      ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark"
                      : "hover:ring-1 hover:ring-border"
                  )}
                >
                  <img src={url} alt={seed} className="w-full h-full object-cover" loading="lazy" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border dark:border-border-dark">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-medium transition-colors",
                    page === i
                      ? "bg-primary text-white"
                      : "text-text-tertiary hover:bg-surface-hover dark:hover:bg-surface-dark-hover"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {selected && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setIsOpen(false); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
