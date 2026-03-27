"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { campaignSchema } from "@/lib/validations/advertising";

export async function createCampaign(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    campaignName: formData.get("campaignName"),
    adType: formData.get("adType"),
    creativeHeadline: formData.get("creativeHeadline"),
    creativeDescription: formData.get("creativeDescription"),
    creativeCtaUrl: formData.get("creativeCtaUrl"),
    creativeImage: formData.get("creativeImage") ?? "",
    budgetType: formData.get("budgetType"),
    budgetAmount: parseFloat(formData.get("budgetAmount") as string),
    bidType: formData.get("bidType"),
    bidAmount: parseFloat(formData.get("bidAmount") as string),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    targetingCategories: ((formData.get("targetingCategories") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    targetingUserType: ((formData.get("targetingUserType") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    targetingGeography: ((formData.get("targetingGeography") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;

  try {
    const campaign = await db.campaign.create({
      data: {
        campaignName: data.campaignName,
        adType: data.adType,
        creativeHeadline: data.creativeHeadline,
        creativeDescription: data.creativeDescription,
        creativeCtaUrl: data.creativeCtaUrl,
        creativeImage: data.creativeImage || null,
        budgetType: data.budgetType,
        budgetAmount: data.budgetAmount,
        bidType: data.bidType,
        bidAmount: data.bidAmount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetingCategories: data.targetingCategories,
        targetingUserType: data.targetingUserType,
        targetingGeography: data.targetingGeography,
        status: "DRAFT",
        advertiserId: session.user.id,
      },
    });
    return { id: campaign.id };
  } catch {
    return { error: "Failed to create campaign" };
  }
}

export async function submitCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return { error: "Campaign not found" };
    if (campaign.advertiserId !== session.user.id) return { error: "Unauthorized" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: campaign.campaignName,
            },
            unit_amount: Math.round(campaign.budgetAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignId,
        userId: session.user.id,
      },
      success_url: `${appUrl}/advertising?success=true`,
      cancel_url: `${appUrl}/advertising?canceled=true`,
    });

    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "PENDING_APPROVAL" },
    });

    return { url: checkoutSession.url };
  } catch {
    return { error: "Failed to submit campaign" };
  }
}

export async function getMyCampaigns() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const campaigns = await db.campaign.findMany({
      where: { advertiserId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return campaigns;
  } catch {
    return [];
  }
}

export async function getCampaignById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const campaign = await db.campaign.findUnique({
      where: { id },
    });

    if (!campaign) return null;

    const isOwner = campaign.advertiserId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) return null;

    return campaign;
  } catch {
    return null;
  }
}

export async function pauseCampaign(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const campaign = await db.campaign.findUnique({ where: { id } });

    if (!campaign) return { error: "Campaign not found" };
    if (campaign.advertiserId !== session.user.id) return { error: "Unauthorized" };
    if (campaign.status !== "ACTIVE") return { error: "Campaign is not active" };

    await db.campaign.update({
      where: { id },
      data: { status: "PAUSED" },
    });

    return { success: true };
  } catch {
    return { error: "Failed to pause campaign" };
  }
}

export async function resumeCampaign(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const campaign = await db.campaign.findUnique({ where: { id } });

    if (!campaign) return { error: "Campaign not found" };
    if (campaign.advertiserId !== session.user.id) return { error: "Unauthorized" };
    if (campaign.status !== "PAUSED") return { error: "Campaign is not paused" };

    await db.campaign.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    return { success: true };
  } catch {
    return { error: "Failed to resume campaign" };
  }
}

export async function getActiveFeedAds(limit = 2) {
  const now = new Date();

  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: "ACTIVE",
        adType: "FEED",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      take: limit,
    });
    return campaigns;
  } catch {
    return [];
  }
}

export async function getActiveBannerAd() {
  const now = new Date();

  try {
    const campaign = await db.campaign.findFirst({
      where: {
        status: "ACTIVE",
        adType: "BANNER",
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    return campaign;
  } catch {
    return null;
  }
}

export async function trackImpression(campaignId: string) {
  try {
    await db.adEvent.create({
      data: {
        campaignId,
        type: "impression",
      },
    });

    await db.campaign.update({
      where: { id: campaignId },
      data: { impressions: { increment: 1 } },
    });
  } catch {
    // silently fail — tracking should not break user experience
  }
}

export async function trackClick(campaignId: string) {
  try {
    await db.adEvent.create({
      data: {
        campaignId,
        type: "click",
      },
    });

    await db.campaign.update({
      where: { id: campaignId },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    // silently fail — tracking should not break user experience
  }
}
