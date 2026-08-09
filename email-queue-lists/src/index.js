import express from 'express';
import Redis from 'ioredis';

const app= express();
app.use(express.json());

const redis=new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY='queue:emails';
app.post("/emails",async(req,res)=>{
    const job={
        to:req.body.to,
        subject:req.body.from,
        body:req.body.body,
        created_at: new Date().toISOString()
    };
    await redis.lpush(QUEUE_KEY,JSON.stringify(job));
    res.json({queued:"true",job});
});

app.get("/emails",async(req,res)=>{
    // if(QUEUE_KEY.len()==0) return res.json({mess:'No job to do'});
    // while(QUEUE_KEY.len()>0){
    //     const rawjob=await redis.rpop(QUEUE_KEY);
    //     const job=JSON.parse(rawjob);
    //     res.json({mess:'email sent',job});
    // }
    const rawjob=await redis.rpop(QUEUE_KEY);
    if(!rawjob) return res.json({mess:'No job to do'});
    const job=JSON.parse(rawjob);
    res.json({mess:'email sent',job})
});

app.listen(3000,()=>{
    console.log('server starting at port 3000');
})