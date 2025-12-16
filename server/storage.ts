import {
  type User,
  type InsertUser,
  type Book,
  type InsertBook,
  type Category,
  type InsertCategory,
  type Review,
  type InsertReview,
  type Bookmark,
  type InsertBookmark,
  type ReadingProgress,
  type InsertReadingProgress,
  type Download,
  type InsertDownload,
  type BookWithDetails,
  type ReviewWithUser,
} from "@shared/schema";
import {
  UserModel,
  BookModel,
  CategoryModel,
  ReviewModel,
  BookmarkModel,
  ReadingProgressModel,
  DownloadModel
} from "./models";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUserBlock(id: string, isBlocked: boolean): Promise<User | undefined>;

  getBook(id: string): Promise<BookWithDetails | undefined>;
  getAllBooks(params?: { limit?: number; sort?: string; search?: string; categoryId?: string }): Promise<BookWithDetails[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;

  getCategory(id: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  getReviewsByBook(bookId: string): Promise<ReviewWithUser[]>;
  createReview(review: InsertReview): Promise<Review>;
  getAllReviews(): Promise<Review[]>;

  getBookmarksByUser(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: string, bookId: string): Promise<void>;
  isBookmarked(userId: string, bookId: string): Promise<boolean>;

  getReadingProgress(userId: string, bookId: string): Promise<ReadingProgress | undefined>;
  upsertReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;

  createDownload(download: InsertDownload): Promise<Download>;
  getAllDownloads(): Promise<Download[]>;

  getStats(): Promise<{ books: number; users: number; downloads: number; reviews: number }>;
}

export class MongoStorage implements IStorage {
  private mapDocument<T>(doc: any): T {
    if (!doc) return doc;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj as T;
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? this.mapDocument<User>(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? this.mapDocument<User>(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return this.mapDocument<User>(user);
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map(u => this.mapDocument<User>(u));
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true });
    return user ? this.mapDocument<User>(user) : undefined;
  }

  async updateUserBlock(id: string, isBlocked: boolean): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, { isBlocked }, { new: true });
    return user ? this.mapDocument<User>(user) : undefined;
  }

  async getBook(id: string): Promise<BookWithDetails | undefined> {
    const book = await BookModel.findById(id).populate('categoryId');
    if (!book) return undefined;

    const reviews = await ReviewModel.find({ bookId: id });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const bookObj = this.mapDocument<Book>(book);
    const category = book.categoryId ? this.mapDocument<Category>(book.categoryId) : null;

    // Fix: categoryId in the book object should be the ID string if needed, 
    // but here we are returning full details. 
    // The type definition expects category to be Category object or null.

    return {
      ...bookObj,
      category,
      averageRating,
      reviewCount: reviews.length,
      categoryId: book.categoryId ? (book.categoryId as any)._id.toString() : undefined
    };
  }

  async getAllBooks(params?: { limit?: number; sort?: string; search?: string; categoryId?: string }): Promise<BookWithDetails[]> {
    let query: any = {};

    if (params?.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { author: { $regex: params.search, $options: 'i' } }
      ];
    }

    if (params?.categoryId && params.categoryId !== "all") {
      query.categoryId = params.categoryId;
    }

    let sortOption: any = { createdAt: -1 };
    if (params?.sort === "downloads") {
      sortOption = { downloadCount: -1 };
    }
    // Note: 'rating' sort is harder in MongoDB without aggregation or storing avgRating. 
    // For now, we will fetch and sort in memory if sort is rating, otherwise use DB sort.

    let booksQuery = BookModel.find(query).populate('categoryId');

    if (params?.sort !== "rating") {
      booksQuery = booksQuery.sort(sortOption);
    }

    if (params?.limit && params.sort !== "rating") {
      booksQuery = booksQuery.limit(params.limit);
    }

    const books = await booksQuery;

    // Enrich with stats
    // Ideally we would use aggregation for this, but to keep it simple and match previous logic:
    // We need review stats for each book.
    // Optimization: Perform one aggregation to get all ratings.

    const allReviews = await ReviewModel.aggregate([
      { $group: { _id: "$bookId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const reviewStats = new Map(allReviews.map(r => [r._id.toString(), r]));

    let results: BookWithDetails[] = books.map(book => {
      const stats = reviewStats.get(book._id.toString());
      const bookObj = this.mapDocument<Book>(book);
      const category = book.categoryId ? this.mapDocument<Category>(book.categoryId) : null;

      return {
        ...bookObj,
        category,
        averageRating: stats?.avg || 0,
        reviewCount: stats?.count || 0,
        categoryId: book.categoryId ? (book.categoryId as any)._id.toString() : undefined
      };
    });

    if (params?.sort === "rating") {
      results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      if (params.limit) {
        results = results.slice(0, params.limit);
      }
    }

    return results;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const created = await BookModel.create(book);
    return this.mapDocument<Book>(created);
  }

  async updateBook(id: string, book: Partial<InsertBook>): Promise<Book | undefined> {
    const updated = await BookModel.findByIdAndUpdate(id, book, { new: true });
    return updated ? this.mapDocument<Book>(updated) : undefined;
  }

  async deleteBook(id: string): Promise<void> {
    await BookModel.findByIdAndDelete(id);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await BookModel.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const category = await CategoryModel.findById(id);
    return category ? this.mapDocument<Category>(category) : undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find();
    return categories.map(c => this.mapDocument<Category>(c));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const created = await CategoryModel.create(category);
    return this.mapDocument<Category>(created);
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const updated = await CategoryModel.findByIdAndUpdate(id, category, { new: true });
    return updated ? this.mapDocument<Category>(updated) : undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  }

  async getReviewsByBook(bookId: string): Promise<ReviewWithUser[]> {
    const reviews = await ReviewModel.find({ bookId }).sort({ createdAt: -1 }).populate('userId', 'name email');
    return reviews.map(r => {
      const rObj = this.mapDocument<Review>(r);
      return {
        ...rObj,
        user: (r as any).userId ? {
          id: (r as any).userId._id.toString(),
          name: (r as any).userId.name,
          email: (r as any).userId.email
        } : { id: '', name: 'Unknown', email: '' }
      };
    });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const created = await ReviewModel.create(review);
    return this.mapDocument<Review>(created);
  }

  async getAllReviews(): Promise<Review[]> {
    const reviews = await ReviewModel.find().sort({ createdAt: -1 });
    return reviews.map(r => this.mapDocument<Review>(r));
  }

  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    const bookmarks = await BookmarkModel.find({ userId }).sort({ createdAt: -1 });
    return bookmarks.map(b => this.mapDocument<Bookmark>(b));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const created = await BookmarkModel.create(bookmark);
    return this.mapDocument<Bookmark>(created);
  }

  async deleteBookmark(userId: string, bookId: string): Promise<void> {
    await BookmarkModel.findOneAndDelete({ userId, bookId });
  }

  async isBookmarked(userId: string, bookId: string): Promise<boolean> {
    const count = await BookmarkModel.countDocuments({ userId, bookId });
    return count > 0;
  }

  async getReadingProgress(userId: string, bookId: string): Promise<ReadingProgress | undefined> {
    const progress = await ReadingProgressModel.findOne({ userId, bookId });
    return progress ? this.mapDocument<ReadingProgress>(progress) : undefined;
  }

  async upsertReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress> {
    const updated = await ReadingProgressModel.findOneAndUpdate(
      { userId: progress.userId, bookId: progress.bookId },
      {
        lastPage: progress.lastPage,
        totalPages: progress.totalPages,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    return this.mapDocument<ReadingProgress>(updated);
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const created = await DownloadModel.create(download);
    return this.mapDocument<Download>(created);
  }

  async getAllDownloads(): Promise<Download[]> {
    const downloads = await DownloadModel.find().sort({ downloadedAt: -1 });
    return downloads.map(d => this.mapDocument<Download>(d));
  }

  async getStats(): Promise<{ books: number; users: number; downloads: number; reviews: number }> {
    const books = await BookModel.countDocuments();
    const users = await UserModel.countDocuments();
    const downloads = await DownloadModel.countDocuments();
    const reviews = await ReviewModel.countDocuments();

    return { books, users, downloads, reviews };
  }
}

export const storage = new MongoStorage();
