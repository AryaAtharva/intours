const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name:{
        type : String ,
        required:[true , 'user must have a name']

    },
    email:{
        type : String,
        required:[true , 'Email is required .'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail , 'please provide a valid email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    passwordChangedAt :{
        type:Date
    },
    active : {
        type:Boolean,
        default:true,
        select:false
    },
    passwordResetToken:String,   
    passwordResetExpires:Date,
    password:{
        type:String,
        required:[true , 'PassWord is required'],
        minlength:[8,'minimum length should be 8 characters'],
        select : false
    },
    confirmPassword:{
        type:String,
        required:[true , 'Confirm PassWord is required'],
        validate:{
            // only works on create and  save 
        validator: function(el){
            return el === this.password;
        },
        message:'password and confirm password not the same'
        }
    }
});
userSchema.pre('save',async function(next){
    
    //only run is password was actually modeified 

    if(!this.isModified('password'))
    {
        next();
    }
    //hashing password
    this.password= await bcrypt.hash(this.password,12);
    //remove confirm password
    this.confirmPassword=undefined;
    next();
});
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew)
    {
        return next();
    }
    this.passwordChangedAt=Date.now() - 1000;
    next();
});

userSchema.pre(/^find/ ,function(next){
    this.find({active :{$ne :false}});
    next();
});

userSchema.methods.correctPassword= async function(candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);

};
userSchema.methods.createPasswordResetToken = function(){

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        this.passwordResetToken =crypto.createHash('sha256').update(resetToken).digest('hex');

        console.log({resetToken},this.passwordResetToken);

        this.passwordResetExpires = Date.now() + 10*60*1000;

        return resetToken;

};

userSchema.methods.changePasswordAfter = function(JWTtimestamp){
    if(this.passwordChangedAt)
    {
        const changedTimeStamp = parseInt( this.passwordChangedAt.getTime()/1000,10);
        // console.log(changedTimeStamp,JWTtimestamp);
        return JWTtimestamp<changedTimeStamp;
    }
    
    return false;
};



const User = mongoose.model('User', userSchema);
module.exports = User ;