import type { Tag } from "./Tag";

export type CollectionItemStatus = "owned" | "wishlist" | "sold";

export const statusLabels: Record<CollectionItemStatus, string> = {
  owned: "所有中",
  wishlist: "ほしいもの",
  sold: "売却済み",
};

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  rating: number;
  status: CollectionItemStatus;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};
