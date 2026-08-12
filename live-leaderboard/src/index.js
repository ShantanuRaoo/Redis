import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app=express();
app.use(express.json());

const redis=new Redis(process.env.RDIS_URL || "redis://localhost:6379");

app.post("/leaderboard/score",async(req,res)=>{
    const user={
        uid:req.body.uid,
        score:req.body.score,
    }
    const newscore=await redis.zincrby("leaderboard",user.score,user.uid);
    res.json({uid:user.uid ,score:newscore});

});

app.get("/leaderboard",async(req,res)=>{
    const raw=await redis.zrevrange("leaderboard",0,9,"WITHSCORES");
    const leaderboard=[];
    for(let i=0;i<raw.length;i+=2){
        leaderboard.push({uid:raw[i],score:raw[i+1]});
    }
    res.json({leaderboard})
});

app.get("/leaderboard/:uid/rank",async(req,res)=>{
    const {uid}=req.params;
    const rank= await redis.zrevrank("leaderboard",uid);
    if(rank==null) return res.status(404).json({error:"user not found"});
    const score=await redis.zscore("leaderboard",uid);
    res.json({uid , rank:rank+1,score:score});
});

app.listen(3000,()=>{
    console.log("app is starting at https://localhost:3000");
});