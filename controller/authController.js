const User = require('./../models/userModel');
const {promisify} =require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const { token } = require('morgan');


const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES_IN});
};
const createSendToken= (user , statusCode, res) =>{
    const token = signToken(user._id);

    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly : true 
        };
        if(process.env.NODE_ENV=== 'production')
        {
            cookieOptions.secure = true;
        }
    res.cookie('jwt',token,cookieOptions);
    
        /// undefining password
        user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    });
};

exports.signup = catchAsync(async(req,res,next)=>{
    
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        role:req.body.role,
        confirmPassword:req.body.confirmPassword,
        passwordChangedAt:req.body.passwordChangedAt
    });
    const url  = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    createSendToken(newUser , 201 ,res);
    // const token = signToken(newUser._id);
    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:
    //         {
    //             user:newUser
    //         }
    // });

    
} );

exports.login = catchAsync( async (req,res,next)=>{
    const {email , password } = req.body;
    if(!email || !password)
    {
       return next(new AppError('Please Enter Email and Password.',400));
    }

    // check email and password
    const user =await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password,user.password)))
    {
        return next(new AppError('Incorrect email or password', 401));
    }
    //token generation

    createSendToken(user , 200 ,res);


    // const token = signToken(user._id);
    // res.status(200).json({
    //     status : 'success',
    //     token
    // });


});

exports.logout = (req,res)=>{
    res.cookie('jwt','loggedout',{
        expires: new Date(Date.now() +10*1000),
        httpOnly:true
    });
    res.status(200).json({
            status: 'success'
        });
};
exports.protect =catchAsync( async (req,res,next)=>{
    //get the token if it exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt)
    {
        token = req.cookies.jwt;
    }
  

    if(!token)
    {
        return next(new AppError('not logged in',401));
    }
    //verification of token 
    const decoded = await promisify (jwt.verify)(token,process.env.JWT_SECRET_KEY);
    //console.log(decoded);

    //check if user still exists 
    const currentUser = await User.findById(decoded.id);
    if(!currentUser)
    {
        return next(new AppError('The user belonging to this token does not exixts anymore',401));
    }

    //check if user changed password after
    if(currentUser.changePasswordAfter(decoded.iat))
    {
        return next(new AppError('User recently changed password. please try again',401));
    }
    //access granted
    req.user =currentUser;res.locals.user = currentUser;
    next();
});

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        //roles is an array
        if(!roles.includes(req.user.role))
        {
            return next(new AppError('You do not have permission to this request',403));
        }
        next();
    } ;
};


exports.forgotPassword = catchAsync(async (req,res,next) =>{
    const user =await User.findOne({email : req.body.email});
    if(!user)
    {
        return next(new AppError('There is no user with email address',404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    


    try{

        const resetUrl =`${req.protocol}://${req.get('host')}/newPassword/${resetToken}`;
        await new Email(user , resetUrl).sendPasswordReset();
        
    }catch(err)
    {
            user.passwordResetToken=undefined;
            user.passwordResetExpires=undefined;
            await user.save({validateBeforeSave:false});


            return next(new AppError('There was an error sending the email.Try again later!!',500));
    }

    

    res.status(200).json({
        status:'success',
        message:'token sent to mail.'
    });

});

exports.resetPassword =catchAsync( async(req, res,next)=>{
    //get user based on token
    const hashedToken =crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken:hashedToken , 
        passwordResetExpires:{$gt:Date.now()}
    });
    //if token not expired and there is user , set new password
    if(!user)
    {
        return next(new AppError('token is invalid or has expired',400));

    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();

    // update chandgedpasswordat property in user model

    //log the user in send JWT 
    createSendToken(user , 200 ,res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status : 'success',
    //     token
    // });


});

exports.updatePassword = catchAsync( async (req, res,next)=>{
    //get user
    const user = await User.findById(req.user.id).select('+password');


    //check if password is correct 
    if(!(await user.correctPassword(req.body.passwordCurrent , user.password)))
    {
        return next(new AppError('Your current password is wrong'), 401);
    }
    //if password is correct update

    user.password = req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    await user.save();

    //log user in ,send jwt
    createSendToken(user , 200 ,res);
});

// only for rendered pages
exports.isLoggedIn = async (req,res,next)=>{
    
    if(req.cookies.jwt)
    {
        try{
        const decoded = await promisify (jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET_KEY);

        //check if user still exists 
        const currentUser = await User.findById(decoded.id);
        if(!currentUser)
        {
            return next();
        }

        //check if user changed password after
        if(currentUser.changePasswordAfter(decoded.iat))
        {
            return next();
        }
        // There is a logged in user

        res.locals.user =currentUser;
        return next();
    }
    catch(err)
    {
        return next();
    }
}
next();
};