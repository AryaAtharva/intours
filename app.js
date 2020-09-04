const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const bookingRouter=require('./routes/bookingRoutes');

const rateLimit = require('express-rate-limit');
const app = express();
const morgan = require('morgan');
const viewRouter = require('./routes/viewRoutes');
const Review = require('./models/reviewModel');
const cookieParser= require('cookie-parser');


app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
// 1) middleware
//serving static files
app.use(express.static(path.join(__dirname,'public')));
console.log(`from app.js ${process.env.NODE_ENV}`);
//set security http header 
app.use(helmet());

// development logging
if(process.env.NODE_ENV === 'development')
{
app.use(morgan('dev'));
}

const limiter = rateLimit({
    max : 100 ,
    windowMs : 60*60*1000,
    message:'to many requests in an hour.'
});

//limit request 
app.use('/api',limiter);

// body parser , reading data from body 
app.use(express.json({limit : '10kb'}));
app.use(cookieParser());

//data sanitization against nosql query injection 
app.use(mongoSanitize());

//data sanitiztion in xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist:['duration','maxGroupSize','ratingsAverage','ratingsQuantity','price']
}));
//testing middleware
app.use((req,res ,next)=>{
    console.log('hello from the middleware');
    next();
});

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});


// 2) route handler




//app.get('/api/v1/tours', getAllTours );
//app.post('/api/v1/tours', createnewtour);
//app.get('/api/v1/tours/:id', gettour);
//app.patch('/api/v1/tours/:id', updatetour);
//app.delete('/api/v1/tours/:id',deletetour);


// 3) routes

app.use('/',viewRouter);


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

app.all('*',(req,res,next)=>{
    // res.status(404).json(
    //     {
    //         status : 'fail',
    //         message : `cant find ${req.originalUrl} on this server.`
    //     }
    // );

    // const err = new Error(`cant find original ${req.originalUrl} on this server`);
    // err.status='fail';
    // err.statusCode=404;



    // next(err);

    next(new AppError(`cant find original ${req.originalUrl} on this server`,404));

});


// universal error handler 
app.use(globalErrorHandler);

module.exports = app;

