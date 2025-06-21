import mongoose, { Schema } from "mongoose";

const BookmarkSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index to ensure a user can only bookmark a question once
BookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

export const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
