import Redis from 'ioredis';
import express from 'express';

const app=express();
app.use(express.json());

const publisher=new Redis(process.env.REDIS_URL ||"redis://localhost:6379");

app.post("/notification",async(req,res)=>{
    const payload={
        title:req.body.title || "default title",
        createdAt: new Date().toISOString(),
    }
    const receivers =await publisher.publish("notifications",JSON.stringify(payload));
    res.json({published:receivers});
});

app.listen(3000,()=>{
    console.log("app is running on http://localhost:3000");
});