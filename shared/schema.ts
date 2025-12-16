import { z } from "zod";

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.string().default("user"),
  isBlocked: z.boolean().default(false),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const insertBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  bookFile: z.string().optional().nullable(),
  fileType: z.string().optional().nullable(),
});

export const insertReviewSchema = z.object({
  bookId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export const insertBookmarkSchema = z.object({
  bookId: z.string(),
  userId: z.string(),
});

export const insertReadingProgressSchema = z.object({
  bookId: z.string(),
  userId: z.string(),
  lastPage: z.number().default(0),
  totalPages: z.number().optional().nullable(),
});

export const insertDownloadSchema = z.object({
  bookId: z.string(),
  userId: z.string().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { id: string; createdAt: Date };

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = InsertCategory & { id: string };

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = InsertBook & { id: string; downloadCount: number; createdAt: Date };

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = InsertReview & { id: string; createdAt: Date };

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = InsertBookmark & { id: string; createdAt: Date };

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = InsertReadingProgress & { id: string; updatedAt: Date };

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = InsertDownload & { id: string; downloadedAt: Date };

export type BookWithDetails = Book & {
  category?: Category | null;
  averageRating?: number;
  reviewCount?: number;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "email">;
};
