"use client";

import { MessageDock, type Character } from "@/components/ui/message-dock";
import { getOrCreateThread, sendMessage } from "@/server/actions/messages";

interface ProjectMember {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface ProjectChatDockProps {
  members: ProjectMember[];
  currentUserId: string;
}

function memberToCharacter(member: ProjectMember, index: number): Character {
  const colors = [
    { bg: "bg-blue-300", gradient: "#93c5fd, #dbeafe" },
    { bg: "bg-green-300", gradient: "#86efac, #dcfce7" },
    { bg: "bg-purple-300", gradient: "#c084fc, #f3e8ff" },
    { bg: "bg-orange-300", gradient: "#fdba74, #ffedd5" },
    { bg: "bg-pink-300", gradient: "#f9a8d4, #fce7f3" },
  ];
  const color = colors[index % colors.length];
  const name = member.name || member.username || "Member";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return {
    id: member.id,
    emoji: initials,
    name,
    online: true,
    backgroundColor: color.bg,
    gradientColors: color.gradient,
    avatar: member.image || undefined,
  };
}

export function ProjectChatDock({ members, currentUserId }: ProjectChatDockProps) {
  const otherMembers = members.filter(m => m.id !== currentUserId).slice(0, 3);

  if (otherMembers.length === 0) return null;

  const characters: Character[] = [
    { emoji: "👥", name: "Team", online: false },
    ...otherMembers.map(memberToCharacter),
    { emoji: "⋯", name: "More", online: false },
  ];

  async function handleSend(message: string, character: Character, index: number) {
    const member = otherMembers[index - 1];
    if (!member) return;

    const thread = await getOrCreateThread(member.id);
    if ("id" in thread) {
      const formData = new FormData();
      formData.set("body", message);
      await sendMessage(thread.id, formData);
    }
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
