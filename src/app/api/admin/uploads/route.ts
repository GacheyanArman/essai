import { getSession } from "@/lib/auth";
import { saveImages } from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Не удалось загрузить фотографии.";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Сессия истекла. Войдите в админ-панель заново." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter(
      (value): value is File => value instanceof File && value.size > 0,
    );
    if (!files.length) return Response.json({ error: "Фотографии не выбраны." }, { status: 400 });

    const urls = await saveImages(files);
    return Response.json({ urls });
  } catch (error) {
    console.error("Image upload failed", error);
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
