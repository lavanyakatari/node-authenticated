const express = require ("express")
const mongoose = require("mongoose")
const dotEnv = require("dotenv")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session  = require('express-session')
const mongoDBStore = require('connect-mongodb-session')(session)
const User = require("./models/User")
const bcrypt = require("bcryptjs")

const app = express();
dotEnv.config();
app.use(bodyParser.json());


app.set("view engine", 'ejs')
app.use(express.static('public'))

//middleware for getting register

app.use(express.urlencoded({extended:true}))

const PORT = process.env.PORT || 8000

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Succesfully!");
    })
    .catch((error) => {
        console.log(`${error}`);
    });

const store = new mongoDBStore({
    uri:process.env.MONGO_URI,
    collection:"mySession"
})

app.use(session({
    secret: 'this is scret',
    resave: false,
    saveUninitialized: true, 
    store:store 
 }))

 

 const checkAuth = (req, res, next) => {
    if (req.session.isAuthicated) {
        next()
    } else {
        res.redirect('/signup')
    }
}

    app.get('/signup' ,(req,res) => {
        res.render('register')
    })

    app.get("/login", (req,res) => {
        res.render("login")
    })

    app.get('/dashboard',checkAuth,(req,res)=>{
        res.render('welcome')
    })

    app.post('/register',async(req,res) => {
        const {username,email,password} = req.body;
        let user = await User.findOne({email});
        if(user){
            res.redirect('/signup')
        }
        const hashpassword = bcrypt.hash(10,password)
        
            const newUser = new User({
                username,
                email,
                password:hashpassword,
    
            })
            await newUser.save();
            req.session.personal = newUser.username;
            res.redirect('/login')

        
    })

    app.post('/user-login',async(req,res) => {
        const {username,password} = req.body;
        const user = await User.findOne({email})
        if(!user){
           return res.redirect('/signup')
        }

        const checkPassword = await bcrypt.compare(password,User.password)
        if(!checkPassword){
           return res.redirect('/signup')
        }
        req.session.isAuthenticated = true
        res.redirect('/dashboard')
    })

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
}
)



