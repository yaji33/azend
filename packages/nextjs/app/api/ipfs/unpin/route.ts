import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json({ error: "Hash is required" }, { status: 400 });
    }

    // Call Pinata Unpin Endpoint
    const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Pinata Unpin Error:", errorText);
      return NextResponse.json({ error: "Failed to unpin from Pinata" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Server Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
