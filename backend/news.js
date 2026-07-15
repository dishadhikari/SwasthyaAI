const express=require("express");
const axios=require ("axios");
const router=express.Router();

router.get("/news",async(req,res)=>
{
    console.log("✅ news.js route called");
    try
    {
        const response=await axios.get("https://gnews.io/api/v4/search",
            {
                params:{
                    q: "health",
                    lang: "en",
                    max: 10,
                    apikey:process.env.GNEWS_API_KEY
                }
            }
        );
        console.log("TOTAL FROM GNEWS:", response.data.articles.length);

        res.json(response.data.articles);
    }
    catch(error)
    {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);
        console.log("MESSAGE:", error.message);

        res.status(500).json({ message: "Failed to fetch news" });
    }
});
module.exports=router;