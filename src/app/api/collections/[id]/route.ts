import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// [GET] /api/collections/[id] コレクションアイテムの詳細取得
export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;

    const item = await prisma.collectionItem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        imageURL: true,
        rating: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "アイテムが見つかりません" },
        { status: 404 },
      );
    }

    const result = {
      ...item,
      tags: item.tags.map((it) => it.tag),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "アイテムの取得に失敗しました" },
      { status: 500 },
    );
  }
};
