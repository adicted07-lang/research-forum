import { getQuestions } from "@/server/actions/questions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let count = 0;
  try {
    const result = await getQuestions({ sort: "trending", limit: 1 });
    count = result.questions.length;
  } catch {}

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px" }}>ResearchHub</h1>
      <p>Questions found: {count}</p>
    </div>
  );
}
