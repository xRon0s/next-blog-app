import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// [GET] /api/collections コレクション一覧の取得 (検索・タグフィルタ対応)
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tagIds = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const status = searchParams.get("status") || "";

    // 検索条件の構築
    const where: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (status) {
      conditions.push({ status });
    }

    if (tagIds.length > 0) {
      conditions.push({
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const itemsRaw = await prisma.collectionItem.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // タグを平坦化
    const items = itemsRaw.map((item) => ({
      ...item,
      tags: item.tags.map((it) => it.tag),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "コレクションの取得に失敗しました" },
      { status: 500 },
    );
  }
};
