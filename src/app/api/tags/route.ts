import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// [GET] /api/tags タグ一覧の取得
export const GET = async () => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "タグの取得に失敗しました" },
      { status: 500 },
    );
  }
};
