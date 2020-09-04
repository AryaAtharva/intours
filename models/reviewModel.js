//text  , rating  , created at , referece to the tour  , user who wrote the review 
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema =new mongoose.Schema(
    {
        review : {
            type:String,
            required:[true, 'review cannot be empty']
        },
        rating  : {
            type:Number ,
            required :[true , 'rating must be given to the tour'],
            min : 1,
            max:5
        },
        createdAt:{
            type:Date,
            default : Date.now()
        },
        tour:{
            type : mongoose.Schema.ObjectId,
            ref : 'Tour',
            required:[true , 'Review must belong to a tour.']
        },
        user: {
            type : mongoose.Schema.ObjectId,
            ref : 'User',
            required:[true , 'Review must belong to user.']
        }
    },
    {
        toJSON : {virtuals :true},
        toObject  : {virtual : true}
    }
);
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'tour',
        select:'name duration imageCover'
    }).populate({
        path:'user',
        select:'name photo'
    })

    // this.populate({
    //     path:'user',
    //     select:'name photo'
    // })

    next();
});
reviewSchema.statics.calcAverageRatings = async function(tourId)
{
    const stats = await this.aggregate([
        {
            $match : {tour : tourId}
        },
        {
            $group :{
                _id : '$tour',
                nRating :{$sum :1},
                avgRating :{$avg :'$rating'}
            }
        }
    ]);
    console.log(stats);

    if(stats.length>0)
    {
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        });
    }
    else
    {
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
        });
    }
};

reviewSchema.post('save' , function(){

    this.constructor.calcAverageRatings(this.tour);
    
});

reviewSchema.index({tour:1 , user:1},{unique:true});


reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review= mongoose.model('Review' , reviewSchema);

module.exports = Review ;

//nested routes 
// get  tours/id/review
// post tours/id/review
// get tours/id/review/id