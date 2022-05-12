const express = require('express');
const mongodb = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const res = require('express/lib/response');
const router = express();
router.use(express.json())
router.use(cors())
dotenv.config()
var DB_URL = process.env.mongodb
var PORT = 8080;

const mongoClient = mongodb.MongoClient;


//Register a user

router.post('/register',async (req,res)=> {
    try{

        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        const data = {
           email:req.body.email,
           password:req.body.password
        }
        let x = await db.collection("Register").findOne({email:data.email});
        // if(x.email==data.email){
        //     res.json({message:"User already registered",statusCode:409})
        //     return
        // }
        await db.collection("Register").insertOne(data);
        res.json({message:"Registered Successfully",statusCode:200})
        client.close();  
    }
    catch(error){
        console.log(error)
        res.sendStatus(500);
    }
})

//Login a user
router.post("/login",async(req,res)=> {
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        const record = await db.collection('Register').findOne({ email: req.body.email });
        if(!record){
          res.status(404).json({message:"User not found"})
        }else {
            const checkUser= (req.body.password===record.password)?true:false;
            if(!checkUser){
              res.status(500).json({message:"Incorrect Password"})
        }else {
            let today = new Date().toLocaleString();
            let userContext = {
                email:req.body.email,
                password:req.body.password,
                loggedIn:today,
            };

            multiLineData = {
                email:req.body.email,
                date:new Date().toLocaleString()
            }
           await db.collection("Context").findOne({ email: req.body.email })?''
           :await db.collection("Context").insertOne(userContext);
        //    await db.collection("Multiline").findOne({ email: req.body.email })?''
        //    :await db.collection("Multiline").insertOne(multiLineData)
             res.status(200).json({message:"Login Successful"})    
        }
        } client.close()
    }catch(error){
            console.log(error)
    }
    
})

//Create Multiline
router.post("/comment/create",async(req,res)=> {
    
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        
        const db = client.db('Sample')
        let multilineData = {
            email:req.body.email,
            mobile:req.body.mobile,
            query:req.body.queryTitle,
            desc:req.body.description
        }

            await db.collection('Comments').insertOne(multilineData)
            
        
        res.status(200).json({message:"Created Successful"})    
    }
    catch(error){
        console.log(error)
}
 
})

//Read Context
router.get("/details/:id",async(req,res)=> {
    
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        let Data = await db.collection('Context').findOne({"email":req.params.id})
        res.status(200).json({Data})    
    }
    catch(error){
        console.log(error)
}
 
})

router.post("/logout",async(req,res)=> {
    
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        const email = req.body.email;
        let loggedData = await db.collection('Context').findOne({email:email});
        await db.collection('Context').deleteMany({"email":loggedData.email});
        await db.collection('Multiline').deleteMany({"email":loggedData.email});
        res.status(200).json({message:"Logout Successful"})    
    }
    catch(error){
        console.log(error)
}
})


router.get("/getcomments/:id",async(req,res)=> {
    
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        let loggedData = await db.collection('Context').findOne({email: req.params.id});
        let multiLineLog = await db.collection('Comments').findOne({email:req.params.id})
        let Data = await db.collection('Comments').find({"email":req.params.id}).toArray();
        res.status(200).json({Data}) 
    }
    catch(error){
        console.log(error)
}
 
})

router.delete("/deletecomment/:id",async (req,res)=>{
    try{
        const client = await mongoClient.connect(DB_URL,{useUnifiedTopology:true})
        const db = client.db('Sample')
        del = req.params.id
         await db.collection("Comments").deleteOne({"mobile":del})
        client.close()
        res.status(200).json({
            message : "Delete Success"
        })
    }
    catch(error){
        console.log(error)
    }
})


router.post("/commentedit/:id",async(req,res)=> {
    
    try{
        const client = await mongoClient.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('Sample')
        let multilineData = {
            mobile:req.params.id,
            query:req.body.queryTitle,
            desc:req.body.description,
        }

        let loggedData = await db.collection('Comments').findOne({mobile: req.params.id});
    
        if(loggedData){
            await db.collection('Comments').updateOne({"mobile":loggedData.mobile},
            {$set:{'query':multilineData.query,'desc':multilineData.desc}})
    
        }
        res.status(200).json({message:"Updated Successful"})    
    }
    catch(error){
        console.log(error)
}
 
})

router.get("/testingApi",async(req,res) => {
    res.send("Express test")
    console.log("test");
})

router.listen(PORT,()=>{
    console.log("Server is up and running "+ PORT);
})