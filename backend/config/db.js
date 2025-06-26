import mongoose from "mongoose"

const connectDb=async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL,{
            dbName:"VirtualCode"
        })
        console.log("db connected")
    } catch (error) {
        console.log(error)
    }
}

export default connectDb