"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const AVATAR_EMOJIS = [
  { emoji: "🧙‍♂️", bg: "bg-green-300", label: "Wizard" },
  { emoji: "🦄", bg: "bg-purple-300", label: "Unicorn" },
  { emoji: "🐵", bg: "bg-yellow-300", label: "Monkey" },
  { emoji: "🤖", bg: "bg-red-300", label: "Robot" },
  { emoji: "🦊", bg: "bg-orange-300", label: "Fox" },
  { emoji: "🐼", bg: "bg-gray-300", label: "Panda" },
  { emoji: "🦉", bg: "bg-amber-300", label: "Owl" },
  { emoji: "🐸", bg: "bg-emerald-300", label: "Frog" },
  { emoji: "🦁", bg: "bg-yellow-400", label: "Lion" },
  { emoji: "🐧", bg: "bg-sky-300", label: "Penguin" },
  { emoji: "🐱", bg: "bg-pink-300", label: "Cat" },
  { emoji: "🐶", bg: "bg-amber-200", label: "Dog" },
  { emoji: "🦋", bg: "bg-blue-300", label: "Butterfly" },
  { emoji: "🐙", bg: "bg-rose-300", label: "Octopus" },
  { emoji: "🦜", bg: "bg-lime-300", label: "Parrot" },
  { emoji: "🐝", bg: "bg-yellow-200", label: "Bee" },
  { emoji: "🦖", bg: "bg-teal-300", label: "Dinosaur" },
  { emoji: "👨‍🚀", bg: "bg-indigo-300", label: "Astronaut" },
  { emoji: "🥷", bg: "bg-slate-400", label: "Ninja" },
  { emoji: "🧑‍🔬", bg: "bg-cyan-300", label: "Scientist" },
];

interface AvatarPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

export function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAvatar = AVATAR_EMOJIS.find((a) => a.emoji === selected);

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {/* Current selection preview */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-border dark:border-border-dark hover:border-primary transition-colors cursor-pointer",
            selectedAvatar?.bg || "bg-surface dark:bg-surface-dark"
          )}
        >
          {selectedAvatar ? selectedAvatar.emoji : "😀"}
        </button>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
            {selectedAvatar ? selectedAvatar.label : "Choose an avatar"}
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-primary hover:underline"
          >
            {isOpen ? "Close picker" : "Pick a fun avatar"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-surface dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
          {AVATAR_EMOJIS.map((avatar) => (
            <button
              key={avatar.emoji}
              type="button"
              onClick={() => {
                onChange(avatar.emoji);
                setIsOpen(false);
              }}
              title={avatar.label}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110",
                avatar.bg,
                selected === avatar.emoji
                  ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark"
                  : "hover:ring-1 hover:ring-border"
              )}
            >
              {avatar.emoji}
            </button>
          ))}
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              title="Remove avatar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs bg-red-100 dark:bg-red-900/30 text-red-500 hover:scale-110 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
