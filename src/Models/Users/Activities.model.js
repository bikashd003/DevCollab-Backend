import mongoose,{Schema} from "mongoose";
const activitiesSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
});
export const Activity=mongoose.model('Activity',activitiesSchema)