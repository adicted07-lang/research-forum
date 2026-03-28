"use client";

import { useEffect, useState } from "react";
import { MessageDock, type Character } from "@/components/ui/message-dock";
import { getRecentContacts, quickSendMessage, type DockContact } from "@/server/actions/dock-contacts";

function contactToCharacter(contact: DockContact): Character {
  const colors = [
    { bg: "bg-blue-300", gradient: "#93c5fd, #dbeafe" },
    { bg: "bg-green-300", gradient: "#86efac, #dcfce7" },
    { bg: "bg-purple-300", gradient: "#c084fc, #f3e8ff" },
    { bg: "bg-yellow-300", gradient: "#fde047, #fefce8" },
  ];
  const color = colors[Math.abs(contact.name.charCodeAt(0)) % colors.length];
  const initials = contact.name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return {
    id: contact.id,
    emoji: initials,
    name: contact.name,
    online: true,
    backgroundColor: color.bg,
    gradientColors: color.gradient,
    avatar: contact.image || undefined,
  };
}

export function QuickDMDock() {
  const [contacts, setContacts] = useState<DockContact[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getRecentContacts(3).then((c) => {
      setContacts(c);
      setLoaded(true);
    });
  }, []);

  if (!loaded || contacts.length === 0) return null;

  // Build characters array: sparkle placeholder + contacts + menu placeholder
  const characters: Character[] = [
    { emoji: "💬", name: "Messages", online: false },
    ...contacts.map(contactToCharacter),
    { emoji: "⋯", name: "More", online: false },
  ];

  async function handleSend(message: string, character: Character, index: number) {
    const contact = contacts[index - 1]; // offset by 1 for sparkle
    if (!contact) return;
    await quickSendMessage(contact.threadId, message);
  }

  return (
    <MessageDock
      characters={characters}
      onMessageSend={handleSend}
      placeholder={(name) => `Message ${name}...`}
      expandedWidth={420}
      position="bottom"
      theme="light"
      closeOnSend={true}
      showSparkleButton={true}
      showMenuButton={true}
    />
  );
}
