import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type RequestBody = {
  name: string;
  description: string;
  imageURL: string;
  rating: number;
  status: string;
  tagIds: string[];
};

// [PUT] /api/admin/collections/[id] コレクションアイテムの更新
export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const { id } = await routeParams.params;
    const requestBody: RequestBody = await req.json();
    const { name, description, imageURL, rating, status, tagIds } = requestBody;

    // アイテムの存在確認
    const existingItem = await prisma.collectionItem.findUnique({
      where: { id },
    });
    if (!existingItem) {
      return NextResponse.json(
        { error: "アイテムが見つかりません" },
        { status: 404 },
      );
    }

    // アイテムの更新
    const item = await prisma.collectionItem.update({
      where: { id },
      data: {
        name,
        description,
        imageURL,
        rating: Math.min(5, Math.max(0, rating)),
        status,
      },
    });

    // 既存の中間テーブルのレコードを削除して再作成
    await prisma.itemTag.deleteMany({
      where: { collectionItemId: id },
    });

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
      { error: "アイテムの更新に失敗しました" },
      { status: 500 },
    );
  }
};

// [DELETE] /api/admin/collections/[id] コレクションアイテムの削除
export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  try {
    const { id } = await routeParams.params;

    await prisma.collectionItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "アイテムの削除に失敗しました" },
      { status: 500 },
    );
  }
};
