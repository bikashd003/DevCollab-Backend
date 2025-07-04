import mongoose, { Schema } from "mongoose";
const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })
const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: [commentSchema],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]

}, { timestamps: true })
export const Blog = mongoose.model("Blog", blogSchema)