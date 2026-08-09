import express from 'express';
import {emailQueue} from './queue.js';

const app= express();
app.use(express.json());

app.post("/welcome-email",async(req,res)=>{
    const job= await emailQueue.add("send welcome email",
        {
            to:req.body.to,
            name:req.body.name
        },
        {
            attempts:3,
            backoff:{
                type:"exponential",
                delay:1000
            }
        }
    );
    res.json({mess: "welcome email job added to the queue",jobId:job.id});
});

app.listen(3000,()=>{
    console.log("server starting at https://localhost:3000");
});