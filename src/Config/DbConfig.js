import mongoose from "mongoose";
const connectDb=async()=>{
    try {
        const connection=await mongoose.connect(process.env.MONGO_URL)
        console.log(`connected to database ${connection.connection.host}`)
    } catch (error) {
        console.log(`error in connecting to database ${error}`)
        process.exit(1)
    }
}
export default connectDb