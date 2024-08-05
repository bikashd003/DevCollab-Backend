import mongoose, {Schema} from "mongoose";
const contactSchema = new Schema({
    phoneNumber:{
        type:Number,
        unique:true
    },
    state:{
        type:String,
        
    },
    city:{
        type:String
    },
    country:{
        type:String
    },
    pincode:{
        type:Number
    }
})
export const Contact = mongoose.model('Contact',contactSchema)