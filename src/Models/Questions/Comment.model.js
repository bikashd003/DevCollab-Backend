import mongoose, { Schema } from "mongoose";
const CommentSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentQuestion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    parentAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
export const Comment = mongoose.model('Comment', CommentSchema);