import mongoose, { Schema } from 'mongoose';

const editorSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            default: '',
        },
        chatHistory: [
            {
                username: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                message: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true
    });

const Editor = mongoose.model('Editor', editorSchema);

export default Editor;
