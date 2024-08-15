import mongoose,{Schema} from "mongoose";
const projectSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageUrl: {
        type:String,
    },
    projectLink: {
        type:String,
        required:true
    }
},{timestamps:true})
export const Project=mongoose.model('Project',projectSchema)
