"use client";

import { MessageDock, type Character } from "@/components/ui/message-dock";
import { getOrCreateThread, sendMessage } from "@/server/actions/messages";

const supportCharacters: Character[] = [
  { emoji: "🆘", name: "Help", online: false },
  {
    emoji: "❓",
    name: "FAQ",
    online: true,
    backgroundColor: "bg-blue-300",
    gradientColors: "#93c5fd, #dbeafe",
  },
  {
    emoji: "🛠",
    name: "Support",
    online: true,
    backgroundColor: "bg-green-300",
    gradientColors: "#86efac, #dcfce7",
  },
  {
    emoji: "💡",
    name: "Feedback",
    online: true,
    backgroundColor: "bg-yellow-300",
    gradientColors: "#fde047, #fefce8",
  },
  { emoji: "⋯", name: "More", online: false },
];

const helpLinks: Record<string, string> = {
  FAQ: "/forum?category=General+Discussion",
  Support: "/messages",
  Feedback: "/forum/new",
};

interface SupportDockProps {
  adminUserId?: string;
}

export function SupportDock({ adminUserId }: SupportDockProps) {
  async function handleSend(message: string, character: Character, index: number) {
    if (character.name === "FAQ") {
      window.location.href = helpLinks.FAQ;
      return;
    }

    if (character.name === "Feedback") {
      window.location.href = helpLinks.Feedback;
      return;
    }

    if (character.name === "Support" && adminUserId) {
      const thread = await getOrCreateThread(adminUserId);
      if ("id" in thread) {
        const formData = new FormData();
        formData.set("body", message);
        await sendMessage(thread.id, formData);
        window.location.href = `/messages/${thread.id}`;
      }
    }
  }

  function handleSelect(character: Character) {
    const link = helpLinks[character.name];
    if (character.name === "FAQ" && link) {
      window.location.href = link;
    }
  }

  return (
    <MessageDock
      characters={supportCharacters}
      onMessageSend={handleSend}
      onCharacterSelect={handleSelect}
      placeholder={(name) =>
        name === "Support" ? "Describe your issue..." :
        name === "Feedback" ? "Share your feedback..." :
        `Ask about ${name}...`
      }
      expandedWidth={420}
      position="bottom"
      theme="light"
      closeOnSend={false}
      showSparkleButton={true}
      showMenuButton={true}
      className="right-6 left-auto translate-x-0"
    />
  );
}
