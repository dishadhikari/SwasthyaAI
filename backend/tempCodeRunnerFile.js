require("dotenv").config();

const express=require("express");
const cors=require("cors");
const authroutes=require("./auth");
const app=express();

app.use(cors());
app.use(express.json());

app.use("/",authroutes);

app.get("/",(req,res)=>{
    res.json({message:"Backend is working fine"});
})

app.listen(5000,()=>{
    console.log("Server is running on port 5000 successfully");
})