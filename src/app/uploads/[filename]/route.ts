import { readStoredUpload } from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const upload = await readStoredUpload(filename);
  if (!upload) return new Response("Not found", { status: 404 });

  return new Response(upload.buffer, {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(upload.buffer.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
