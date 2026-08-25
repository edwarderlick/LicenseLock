import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Default to studionet or fallback to localhost RPC
    const GENLAYER_RPC_URL = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
    
    const response = await fetch(GENLAYER_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GenLayer Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to GenLayer node" },
      { status: 500 }
    );
  }
}
