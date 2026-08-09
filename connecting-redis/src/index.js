import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
const port = 3000;

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get("/redis", async (req,res) => {
    const reply = await redis.ping();
    res.json({redis:reply});
});

const url = process.env.MONGO_URL || "mongodb://localhost:27017/learn_mongo";
app.get("/mongo" , async(req,res) => {
   if(mongoose.connection.readyState == 0) await mongoose.connect(url);
    res.json({mongo:"connected",database:mongoose.connection.name});
});

app.listen(3000 ,() =>{
    console.log("server is running on port 3000");
});