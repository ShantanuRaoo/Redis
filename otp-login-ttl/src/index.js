import express from 'express';
import Redis from 'ioredis';


const app=express();
app.use(express.json());

const redis= new Redis(process.env.REDIS_URL || "redis://localhost:6379" );

function otpkey(phone){
    return `otp:${phone}`;
}

app.post('/otp' ,async(req,res)=>{
    const {phone}=req.body;
    const otp=Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpkey(phone),otp,'EX',300);
    res.json({message:'otp sent',otp});
});

app.post('/otp/verify',async(req,res)=>{
    const {phone,otp}=req.body;
    const savedOtp= await redis.get(otpkey(phone));

    if(!savedOtp) return res.status(400).json({message:'Otp expired'});
    if(savedOtp!=otp) return res.status(400).json({message:'invalid otp'});

    // await redis.del(otpkey(phone));
    res.json({message:'Otp verified successfully'});
    await redis.del(otpkey(phone));
});

app.get('/otp/:phone/ttl',async(req,res)=>{
    const ttl=await redis.ttl(otpkey(req.params.phone));
    res.json({ttl});
});

app.listen(3000,()=>{
    console.log('server running on port 3000');
});



