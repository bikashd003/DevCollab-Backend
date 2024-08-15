import mongoose,{ Schema } from "mongoose";
const skillSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    proficiency:{
        type: Number,
    }
})
export const Skill=mongoose.model('Skill',skillSchema)