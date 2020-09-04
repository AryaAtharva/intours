const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { bool } = require('sharp');


exports.newPassword=(req,res,next)=>{
    const webToken = req.params.token;
    res.status(200).render('newPassword',{
        title:'New Password',
        webToken
    });
};

exports.getOverview =catchAsync( async (req,res,next)=>{
    //1) get tour data from collection
    const tours = await Tour.find();
    //2) build template 

    //3) Render that templation using 


    res.status(200).render('overview',{
        title:'All Tours',
        tours
    });
});

exports.getMyReviews = catchAsync(async (req,res,next)=>{
    const reviews = await Review.find({user:req.user.id});

    
    res.status(200).render('myReviews',{
        title:'My Reviews',
        reviews
    });

});

exports.getTour =catchAsync(async (req,res,next)=>{
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path:'reviews',
        fields : 'review rating user'
    });

    if(!tour)
    {
        return next(new AppError('There is no tour with that name.',404));
    }

    res.status(200).render('tour',{
        title : `${tour.name} Tour`,
        tour :tour
    });
});

exports.getLoginForm = (req,res)=>{
    res.status(200).render('login',{
        title:'log in to your account'
    });

}

exports.getSignupForm = (req,res)=>{
    res.status(200).render('signup',{
        title:'Create Your new Account'
    });

}
exports.resetForm= (req,res)=>{
    res.status(200).render('forgotPassword',{
        title:'Forgot Password'
    });
};
exports.getMyTours=catchAsync( async(req,res,next)=>{
    const booking = await Booking.find({user:req.user.id});

    const tourIds = booking.map(el=>el.tour);

    const tours = await Tour.find({_id : {$in : tourIds}});

    res.status(200).render('overview',{
        title:'My Tours',
        tours
    });

});


exports.getAccount = (req,res)=>{
    res.status(200).render('account',{
        title:'Your Account'
    });
};