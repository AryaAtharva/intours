const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sharp = require('sharp');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');



// const multerStorage = multer.diskStorage({
//     destination : (req , file , cb)=>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image'))
    {
        cb(null,true);
    }
    else{
        cb(new AppError('not An Image ! please Upload only images',400),false);
    }

};
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync( async (req,res ,next) => {
    if(!req.file)
    {
        return next();
    }
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    console.log(req.file.filename);
   await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality : 90})
    .toFile(`public/img/users/${req.file.filename}`);

    next();


});

const filterObj = (obj , ...allowedfields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el))
        {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers =catchAsync(  async(req , res, next) => {
//     const users = await User.find();
//        // const users = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

//         res.status(200).json({
//             status : 'success',
//             results : users.length,
//             data :{
//                 users
//             }
//         });
// });

exports.createUser = (req , res) => {
    res.status(500).json({
        status : 'Error',
        message : 'This route is not defined!!!!  Please use signup'
    });
};


exports.updateMe = catchAsync (async(req,res,next)=>{
    // create error if user Posts password data
    if(req.body.password || req.body.confirmPassword)
    {
        return next(new AppError('This Route is not for password updation.',400));
    }
    // filter certain fields 
    const filteredBody = filterObj(req.body , 'name' , 'email' );
    if(req.file)
    {
        filteredBody.photo = req.file.filename;
    }
    //update user document 
    const updatedUser = await User.findByIdAndUpdate(req.user.id ,filteredBody,{new : true ,runValidators:true});

    res.status(200).json({
        status : 'success',
        data:{
            user:updatedUser
        }
    });

});

exports.deleteMe =catchAsync( async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id , {active : false});

    res.status(204).json({
        status :'success',
        data : null
    });
});


exports.getUser = factory.getOne(User);
// exports.getUser = (req , res) => {
//     res.status(500).json({
//         status : 'Error',
//         message : 'This route is not yet defined'
//     });
// };

exports.updateUser = factory.updateOne(User);

// exports.updateUser = (req , res) => {
//     res.status(500).json({
//         status : 'Error',
//         message : 'This route is not yet defined'
//     });
// };


exports.deleteUser =factory.deleteOne(User);

// exports.deleteUser = (req , res) => {
//     res.status(500).json({
//         status : 'Error',
//         message : 'This route is not yet defined'
//     });
// };