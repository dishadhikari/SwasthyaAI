const jwt=require("jsonwebtoken");
function auth(req,res,next)
{
    const header=req.headers.authorization;
    if(!header)
    {
        return res.status(401).json({error:"No token"});
    }
    const token=header.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decoded;
    next();
}
module.exports=auth;