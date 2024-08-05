import mongoose, {Schema} from "mongoose";
const socialLinkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
export const SocialLink = mongoose.model('SocialLink', socialLinkSchema);