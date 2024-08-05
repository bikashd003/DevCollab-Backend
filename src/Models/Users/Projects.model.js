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
    image:{
        type:String,
    },
    link:{
        type:String,
        required:true
    }
},{timestamps:true})
export const Project=mongoose.model('Project',projectSchema)
