import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type RequestBody = {
  name: string;
  color: string;
};

// [PUT] /api/admin/tags/[id] タグの更新
export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const { id } = await routeParams.params;
    const requestBody: RequestBody = await req.json();
    const { name, color } = requestBody;

    const tag = await prisma.tag.update({
      where: { id },
      data: { name, color },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "タグの更新に失敗しました" },
      { status: 500 },
    );
  }
};

// [DELETE] /api/admin/tags/[id] タグの削除
export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const { id } = await routeParams.params;

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "タグの削除に失敗しました" },
      { status: 500 },
    );
  }
};
