"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const visibility = (formData.get("visibility") as string) || "private";
  const tagsRaw = formData.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (!name || !description) return { error: "Name and description are required" };

  try {
    const project = await db.project.create({
      data: {
        name,
        description,
        slug: generateSlug(name),
        ownerId: session.user.id,
        visibility,
        tags,
        members: {
          create: { userId: session.user.id, role: "owner" },
        },
      },
    });
    return { slug: project.slug };
  } catch {
    return { error: "Failed to create project" };
  }
}

export async function getMyProjects() {
  const session = await auth();
  if (!session?.user?.id) return { projects: [] };

  try {
    const memberships = await db.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            owner: { select: { name: true, username: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
    return { projects: memberships.map((m) => ({ ...m.project, myRole: m.role })) };
  } catch {
    return { projects: [] };
  }
}

export async function getProjectBySlug(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, name: true, username: true, image: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, username: true, image: true } },
          },
        },
      },
    });

    if (!project) return null;

    // Check access
    if (project.visibility === "private") {
      const isMember = project.members.some((m) => m.userId === session.user.id);
      if (!isMember) return null;
    }

    return project;
  } catch {
    return null;
  }
}

export async function addProjectMember(projectSlug: string, username: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const project = await db.project.findUnique({ where: { slug: projectSlug } });
    if (!project) return { error: "Project not found" };
    if (project.ownerId !== session.user.id) return { error: "Only the owner can add members" };

    const user = await db.user.findFirst({ where: { username, deletedAt: null } });
    if (!user) return { error: "User not found" };

    await db.projectMember.create({
      data: { projectId: project.id, userId: user.id },
    });
    return { success: true };
  } catch {
    return { error: "Failed to add member" };
  }
}

export async function getProjectDocuments(projectId: string) {
  try {
    return await db.projectDocument.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true, username: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function createDocument(projectId: string, title: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const doc = await db.projectDocument.create({
      data: { projectId, title, body, authorId: session.user.id },
    });
    return { id: doc.id };
  } catch {
    return { error: "Failed to create document" };
  }
}

export async function updateDocument(docId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.projectDocument.update({
      where: { id: docId },
      data: { body, version: { increment: 1 } },
    });
    return { success: true };
  } catch {
    return { error: "Failed to update document" };
  }
}

export async function getDocument(docId: string) {
  try {
    return await db.projectDocument.findUnique({
      where: { id: docId },
      include: { author: { select: { name: true, username: true } } },
    });
  } catch {
    return null;
  }
}
