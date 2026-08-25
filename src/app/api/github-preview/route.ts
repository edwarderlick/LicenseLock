import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo");
  const commit = searchParams.get("commit");
  const path = searchParams.get("path") || "README.md"; // Optional, but usually README.md or LICENSE

  if (!repo || !commit) {
    return NextResponse.json({ error: "Missing repo or commit" }, { status: 400 });
  }

  try {
    const url = `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
    const res = await fetch(url, { method: "HEAD" });

    if (res.status === 200) {
      return NextResponse.json({ status: "found" });
    } else if (res.status === 404) {
      return NextResponse.json({ status: "not_found" });
    } else {
      return NextResponse.json({ status: "unavailable" });
    }
  } catch (error) {
    console.error("Github Proxy Error:", error);
    return NextResponse.json({ status: "unavailable" });
  }
}
