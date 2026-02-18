import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

type RequestBody = {
  name: string;
  color: string;
};

// [POST] /api/admin/tags タグの新規作成
export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const requestBody: RequestBody = await req.json();
    const { name, color } = requestBody;

    const tag = await prisma.tag.create({
      data: { name, color },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "タグの作成に失敗しました" },
      { status: 500 },
    );
  }
};
