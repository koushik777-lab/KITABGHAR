import mongoose from "mongoose";
import {
    type User,
    type Category,
    type Book,
    type Review,
    type Bookmark,
    type ReadingProgress,
    type Download
} from "@shared/schema";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: "user" },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
});

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    coverImage: { type: String },
    bookFile: { type: String },
    fileType: { type: String },
    downloadCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const bookmarkSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const readingProgressSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastPage: { type: Number, default: 0 },
    totalPages: { type: Number },
    updatedAt: { type: Date, default: Date.now }
});

const downloadSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    downloadedAt: { type: Date, default: Date.now }
});

// Create indexes to improve query performance and enforce uniqueness
userSchema.index({ email: 1 });
categorySchema.index({ name: 1 });
reviewSchema.index({ bookId: 1, userId: 1 }); // One review per user per book? Or just querying reviews by book.
bookmarkSchema.index({ userId: 1, bookId: 1 }, { unique: true });
readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const UserModel = mongoose.model('User', userSchema);
export const CategoryModel = mongoose.model('Category', categorySchema);
export const BookModel = mongoose.model('Book', bookSchema);
export const ReviewModel = mongoose.model('Review', reviewSchema);
export const BookmarkModel = mongoose.model('Bookmark', bookmarkSchema);
export const ReadingProgressModel = mongoose.model('ReadingProgress', readingProgressSchema);
export const DownloadModel = mongoose.model('Download', downloadSchema);
