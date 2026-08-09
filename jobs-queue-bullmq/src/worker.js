import {Worker} from 'bullmq';
import {connection} from './queue.js';

const worker = new Worker(
    "emails",
    async (job)=>{
        console.log("processing emailing job",job.id,job.name,job.data);
        //throw new Error("test failure"); // for testing
        (await new Promise((resolve) => setTimeout(resolve,1500)),
        console.log("Emailing job completed",job.id,job.name,job.data));
    },
    {connection}
);

worker.on("completed",(job)=>{
    console.log("job completed",job.id,job.name,job.data);
});

worker.on("failed",(job,err)=>{
    console.log("job failed",job.id,job.name,job.data,err);
});