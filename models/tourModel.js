const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel.js');
const validator = require('validator');
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        unique : true,
        required :[true , 'a tour must have a name'],
        maxlength:[40 ,'a tour name cannot exceed 40 characters. '],
        minlength:[10, 'a tour name must have more than 10 characters .'],
        trim :true,
       // validate: [validator.isAlpha,'tour name must contain characters.']
    },
    duration :{
        type : Number,
        required : [true , 'a tour must have a duration']
    },
    maxGroupSize:{
        type : Number ,
        required : [true , 'A tour must have a group size.']
    },
    ratingsAverage:{
        type : Number,
        maxlength:[5 ,'maxrating is 5.'],
        minlength:[1, 'minrating is 1.'],
        default : 4.5,
        set: val=>Math.round(val*10)/10
    },
    ratingsQuantity : {
        type : Number ,
        default : 0 
    },
    slug : String ,
    price:{
        type:Number,
        required : [true , 'a tour must have a price ']
    },
    priceDiscount :{ 
        type:Number,
        validate:{
            // only works while creating document
            validator:function(val)
            {
                return val < this.price;
            },
            message : 'Discount price({VALUE}) should be less than regular price.'
        }
    },
    summary:{
        type :String,
        trim : true ,
        required :[true , 'a tour must have a cover']
    },
    description :{
        type : String ,
        trim :true
    },
    secretTour : {
        type : Boolean ,
        default : false
    },
    startLocation:{
        //geoJson
            type:
            {
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates :[Number],
            address:String,
            description:String,
       },
       locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates :[Number],
            description:String,
            day:Number
        }
    ],
    imageCover:{
        type : String,
        required : [true , 'a tour must have an imagecover']
    },
    images : [String],
    difficulty: {
        type :String,
        required :[true , 'difficulty is required .'],
        enum:{
            values :['easy','medium','difficult'],
            message :'difficulty is either easy , medium , hard'
        }
    },
    createdAt:{
        type : Date,
        default : Date.now(),
        select : false
    },
    // reviews : [
    //     {
    //         type:mongoose.schema.ObjectId,
    //         ref:'Review'
    //     }
    // ],
    guides:[
        {
        type:mongoose.Schema.ObjectId,
        ref : 'User'
        }
    ],
    startDates : [Date],
    },
    {
        toJSON : {virtuals :true},
        toObject  : {virtual : true}
    }
);

tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({startLocation:'2dsphere'});
tourSchema.virtual('duraitoninWeeks').get(function()
{
    return this.duration/7;
});
//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});
// Document middleware runs before .save() .create
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name , {lower : true });
    next();
} );

//embedding code
// tourSchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.pre('save' , function(next){
//     console.log ('Will save document .');
// });


// tourSchema.post('save' ,  function(doc, next) {
//     console.log(doc) ; 
//     next();
// });


// QUERY MIDDLEWARE 
tourSchema.pre(/^find/ , function(next){
// tourSchema.pre('find' , function(next){
    this.find({secretTour : {$ne : true}});
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select : '-__v -passwordChangedAt'
    });

    next();
});

//document middleware

tourSchema.post(/^find/ , function(docs , next){
    console.log(`Query took ${Date.now() - this.start} milliseconds.`);
    //console.log(docs);
    next();
});


// aggregation middleware
// tourSchema.pre('aggregate' , function(next){
//     this.pipeline().unshift({$match : {secretTour:{$ne : true} } });
//     console.log(this.pipeline());

//     next();
// });


// tourSchema.pre('findOne' , function(next){
//     this.find({secretTour : {$ne : true}});
//     next();
// });

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour ;