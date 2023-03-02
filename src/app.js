const express =require("express");
require("./db/conn");
const app = express();
const port = process.env.PORT || 5000;
const path = require("path");
const hbs = require("hbs"); 
const Register = require("./models/register");
const { rmSync } = require("fs");
const cookieParser = require("cookie-parser")
const auth = require("./middleware/auth");
  
 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

   
  

//serving public file
const public_path = path.join(__dirname,"../public");
app.use(express.static(public_path));

//serving dynamic file
const dynamic_path = path.join(__dirname,"../templates/views");
app.set("view engine","hbs");
app.set("views", dynamic_path);


//serving dynamic file
const partials_path = path.join(__dirname,"../templates/partials");
hbs.registerPartials(partials_path)



app.get("/",(req,res)=>{
    res.render("home", {name:"A web developer",img:"/img/1.png"})
});
app.get("/about",(req,res)=>{
    res.render("about",{name:"Roshan sah",img:"/img/2.png"})
});
app.get("/contact",(req,res)=>{
    res.render("contact")
});
app.get("/register",(req,res)=>{
    res.render("register")
});
app.get("/secret", auth,(req,res)=>{
    // console.log(`This is my secret page token ${req.cookies.jwt}`)
    res.render("secret")
});
app.get("/login",(req,res)=>{
    res.render("login")
});
app.get("/logout",auth,async(req,res)=>{ 
   try {

    req.document.tokens=req.document.tokens.filter((currentEle)=>{
        return currentEle .token!==req.token;
    })

    res.clearCookie("jwt");
    await req.document.save();
    res.render("login");
   } catch (error) {
    res.status(500).send(error)
   }
});

// use post request 
app.post("/register",async(req,res)=>{
    try {
          const password = req.body.password;
          const confirmpassword = req.body.password;
          if(password===confirmpassword){
            const userdata = new Register({
                fullname:req.body.fullname,
                email:req.body.email,
                mobile:req.body.mobile,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword
            });
            const token = await userdata.mytoken();
            console.log("my token is "+ token);
            
            res.cookie("jwt",token,{
                expires:new Date(Date.now() +50000),
                httpOnly:true
            });
            const savedata = await userdata.save();
            res.status(201).render("home");
          }
    } catch (error) {
        res.status(400).send(error)
        
    }
});

app.post("/login",async(req,res)=>{
   try {
        const email = req.body.email;
        const password  = req.body.password;
    const useremail = await Register.findOne({email:email});
    const token = await useremail.mytoken();
    console.log("This is my token "+ token);

    res.cookie("jwt",token,{
        expires:new Date(Date.now() +50000),
        httpOnly:true
    });
    if(useremail.password===password){
        res.status(201).render("home")
    }else{
        res.send("invalid login details")
    }
   } catch (error) {
    res.status(400).send("invalid loing detail")
   }
});
 

app.listen(port,()=>{
    console.log(`the server is running port no ${port}`);
});
 