import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function cleanup() {
  const testEmails = [
    "alice@example.com",
    "bob@example.com",
    "carol@example.com",
    "admin@techcorp.com",
  ];

  const testUsers = await db.user.findMany({
    where: { email: { in: testEmails } },
    select: { id: true, email: true, name: true },
  });

  console.log(`Found ${testUsers.length} test accounts to clean up:`);
  testUsers.forEach((u) => console.log(`  - ${u.email} (${u.name})`));

  if (testUsers.length === 0) {
    console.log("No test accounts found. Already cleaned up.");
    return;
  }

  const ids = testUsers.map((u) => u.id);

  console.log("\nDeleting related data...");

  // Delete in order to respect foreign keys
  const deletions = [
    { name: "AdEvents", fn: () => db.adEvent.deleteMany({ where: { campaign: { userId: { in: ids } } } }) },
    { name: "Campaigns", fn: () => db.campaign.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "AuditLogs", fn: () => db.auditLog.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Reports", fn: () => db.report.deleteMany({ where: { OR: [{ reporterId: { in: ids } }, { targetUserId: { in: ids } }] } }) },
    { name: "ProjectDocuments", fn: () => db.projectDocument.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "ProjectMembers", fn: () => db.projectMember.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Projects", fn: () => db.project.deleteMany({ where: { ownerId: { in: ids } } }) },
    { name: "Applications", fn: () => db.application.deleteMany({ where: { OR: [{ applicantId: { in: ids } }, { job: { authorId: { in: ids } } }] } }) },
    { name: "Messages", fn: () => db.message.deleteMany({ where: { senderId: { in: ids } } }) },
    { name: "MessageThreads", fn: () => db.messageThread.deleteMany({ where: { OR: [{ participantAId: { in: ids } }, { participantBId: { in: ids } }] } }) },
    { name: "Notifications", fn: () => db.notification.deleteMany({ where: { OR: [{ userId: { in: ids } }, { actorId: { in: ids } }] } }) },
    { name: "NewsletterSubs", fn: () => db.newsletterSubscription.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "CollectionItems", fn: () => db.collectionItem.deleteMany({ where: { collection: { userId: { in: ids } } } }) },
    { name: "Collections", fn: () => db.collection.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Bookmarks", fn: () => db.bookmark.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Follows", fn: () => db.follow.deleteMany({ where: { OR: [{ followerId: { in: ids } }, { followingId: { in: ids } }] } }) },
    { name: "TagFollows", fn: () => db.tagFollow.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Reviews", fn: () => db.review.deleteMany({ where: { OR: [{ authorId: { in: ids } }, { listing: { authorId: { in: ids } } }] } }) },
    { name: "Votes", fn: () => db.vote.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Comments", fn: () => db.comment.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Answers", fn: () => db.answer.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Questions", fn: () => db.question.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Articles", fn: () => db.article.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Jobs", fn: () => db.job.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Listings", fn: () => db.listing.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Datasets", fn: () => db.dataset.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Grants", fn: () => db.grant.deleteMany({ where: { authorId: { in: ids } } }) },
    { name: "Badges", fn: () => db.badge.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Sessions", fn: () => db.session.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Accounts", fn: () => db.account.deleteMany({ where: { userId: { in: ids } } }) },
    { name: "Users", fn: () => db.user.deleteMany({ where: { id: { in: ids } } }) },
  ];

  for (const { name, fn } of deletions) {
    try {
      const result = await fn();
      if (result.count > 0) console.log(`  Deleted ${result.count} ${name}`);
    } catch (e: any) {
      console.log(`  ⚠ ${name}: ${e.message}`);
    }
  }

  console.log("\n✓ Cleanup complete!");
}

cleanup()
  .catch(console.error)
  .finally(() => db.$disconnect());
