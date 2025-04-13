const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        uniqe:true
    },
    password:{
        type:String,
        require:true,
    }

})

module.exports = mongoose.model("User", userSchema) 