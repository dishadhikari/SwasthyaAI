require("dotenv").config({ path: __dirname + "/.env" });

const express=require("express");
const cors=require("cors");
const authroutes=require("./auth");
const buildprompt=require("./prompt");
const axios=require("axios");
const pool=require("./db");
const auth=require("./middleware");
const newsroute=require("./news");
const { asyncWrapProviders } = require("async_hooks");

const app=express();

app.use(cors());
app.use(express.json());

app.use("/",authroutes);
app.use("/",newsroute); // provides GET /news (live articles from GNews API)

app.get("/",(req,res)=>{
    res.json({message:"Backend is working fine"});
})

app.post("/generateplan",async(req,res)=>{
    try{
        console.log("BODY:", req.body);
    const answers=req.body; 

    const prompt=buildprompt(answers);
    const response=await axios.post("https://api.groq.com/openai/v1/chat/completions",{
        model:"llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
    })
    console.log("AI RESPONSE:", response.data);
    const text=response.data.choices[0].message.content;

    const start=text.indexOf("{");
    const end=text.lastIndexOf("}");
    const json=JSON.parse(text.slice(start,end+1));
    res.json(json);}
    catch (err) {
        console.log("ERROR STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data);
        res.status(500).json(err.response?.data || { error: "failed" });
      }
})

// Requires login (Google OAuth -> JWT). Plan is now tied to the logged-in user,
// not a hardcoded userid.
app.post("/saveplan",auth,async(req,res)=>{
    try{
      const {plan}=req.body;
      if(!plan){
        return res.status(400).json({error:"plan is required"});
      }
      const userid=req.user.id;
      const result=await pool.query(
        "insert into workout(userid,goal,level,plan) values ($1,$2,$3,$4) returning *",
        [userid,plan.goal,plan.level,plan]
      );
      res.json(result.rows[0]);
    }catch(err){
      console.error("SAVEPLAN ERROR:", err);
      res.status(500).json({error: err.message || "Failed to save plan"});
    }
});

app.get("/getplan/:id",async(req,res)=>{
    try{
      const {id}=req.params;
      const result=await pool.query("select * from workout where id=$1",[id]);
      if (!result.rows.length) {
        return res.status(404).json({ error: "Plan not found" });
      }
      const row=result.rows[0];
      // The workout.plan column is jsonb, so pg already returns it as a parsed
      // object. Only fall back to JSON.parse if it ever comes back as text.
      const parsedPlan = typeof row.plan === "string" ? JSON.parse(row.plan) : row.plan;
      res.json({
        ...row,
        plan: parsedPlan,
      });
    }catch(err){
      console.error("GETPLAN ERROR:", err);
      res.status(500).json({error: err.message || "Failed to load plan"});
    }
});

app.get("/myworkouts",auth,async (req,res)=>{
  try{
    const userid=req.user.id;
    const result=await pool.query(
      "select * from workout where userid=$1 order by created_at desc",
      [userid]
    );
    res.status(200).json(result.rows);
  }catch(err){
    console.error("MYWORKOUT ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to load your workouts" });
  }
})

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

app.listen(5000,()=>{
    console.log("Server is running on port 5000 successfully");
})
