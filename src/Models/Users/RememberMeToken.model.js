import mongoose, { Schema } from "mongoose";

const RememberMeTokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: '14d',
        default: Date.now
    }
});

export const RememberMeToken = mongoose.model('RememberMeToken', RememberMeTokenSchema);
