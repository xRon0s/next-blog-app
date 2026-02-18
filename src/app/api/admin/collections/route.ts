import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

type RequestBody = {
  name: string;
  description: string;
  imageURL: string;
  rating: number;
  status: string;
  tagIds: string[];
};

// [POST] /api/admin/collections コレクションアイテムの新規作成
export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const requestBody: RequestBody = await req.json();
    const { name, description, imageURL, rating, status, tagIds } = requestBody;

    // tagIds で指定されるタグがDB上に存在するか確認
    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });
      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: "指定されたタグのいくつかが存在しません" },
          { status: 400 },
        );
      }
    }

    const item = await prisma.collectionItem.create({
      data: {
        name,
        description,
        imageURL,
        rating: Math.min(5, Math.max(0, rating)),
        status,
      },
    });

    // 中間テーブルにレコードを追加
    for (const tagId of tagIds) {
      await prisma.itemTag.create({
        data: {
          collectionItemId: item.id,
          tagId,
        },
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "アイテムの作成に失敗しました" },
      { status: 500 },
    );
  }
};
