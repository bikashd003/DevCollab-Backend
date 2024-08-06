import mongoose,{ Schema } from "mongoose";
const skillSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    proficiency:{
        type:String,
        enum:['beginner','intermediate','advanced'],
        required:true
    },
    category:{
        type:String,
        enum:['programming','design','testing','management','other'],
        required:true
    }
})
export const Skill=mongoose.model('Skill',skillSchema)