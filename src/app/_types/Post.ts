import type { CoverImage } from "./CoverImage";
import type { Category } from "./Category";

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: Category[];
  coverImage: CoverImage;
};