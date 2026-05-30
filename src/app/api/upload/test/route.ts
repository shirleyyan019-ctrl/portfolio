import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (!hasToken) {
    return NextResponse.json({
      status: "error",
      message: "BLOB_READ_WRITE_TOKEN is not set",
      hint: "Go to Vercel Dashboard → Storage → Your Blob Store → Connect to project, then redeploy",
    });
  }

  try {
    // Try listing existing blobs
    const blobs = await list();
    return NextResponse.json({
      status: "ok",
      message: "Blob storage is connected and working",
      blobCount: blobs.blobs.length,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Blob storage token exists but something is wrong",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
