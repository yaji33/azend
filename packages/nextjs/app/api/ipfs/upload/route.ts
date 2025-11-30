import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

   
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    
    const metadata = JSON.stringify({
      name: `Azend Event Banner - ${Date.now()}`,
    });
    pinataFormData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    pinataFormData.append("pinataOptions", options);

    // Send to Pinata API
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Pinata Error:", resData);
      return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
    }
    return NextResponse.json({ ipfsHash: resData.IpfsHash }, { status: 200 });
  } catch (e) {
    console.error("Server Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
