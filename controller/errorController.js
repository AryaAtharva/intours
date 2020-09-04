const AppError = require('./../utils/appError');

const handleCastErrorDB = err=>{
    const message = `Invalid ${err.path} : ${err.value}`; 
    return new AppError(message,400);
};
const handleDuplicateFieldsDB = err =>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value : ${value} , Please use another name.`;
    return new AppError(message,400);
};
const handleJWTError = err =>new AppError('Invalid token. Please login again',401);

const handleJWTTokenExpired = err =>new  AppError('Token has expired . Login Again',401);

const handleValidationErrorDB = err=>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `invalid data input ${errors.join('. ')}`;
    return new AppError(message , 400);
};


const sendErrDev=(err,req,res)=>{
    if(req.originalUrl.startsWith('/api'))
    {
      return  res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
            error:err,
            stack : err.stack
        });
    }
    console.log(err);
       return res.status(err.statusCode).render('error',{
            title:'Something WENT wrong.',
            msg : err.message
        });
    
    
    
};
const sendErrProd=(err,req,res)=>{
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational)
        {
            return res.status(err.statusCode).json({
                status : err.status,
                message : err.message,
            });
        }
        
            console.error('ERROR',err);
           return  res.status(500).json({
                status :'error',
                message : "Oops! Something went wrong.",
            });
        

    }
    
        if(err.isOperational)
        {
          return  res.status(err.statusCode).render('error',{
                title:'Something WENT wrong.',
                msg : err.message
            });
        }
        
            console.error('ERROR',err);
           return res.status(err.statusCode).render('error',{
                title:'Something WENT wrong.',
                msg : 'Please try again.'
            });
        

    

    

};


module.exports = (err,req,res,next)=>{
    console.log(err);
    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV==='development')
    {
        sendErrDev(err,req,res);
    }else if(process.env.NODE_ENV==='production')
    {
        let error = {...err};
        error.message = err.message;
        if(error.name === 'CastError')
        {
           error=  handleCastErrorDB(error)
        }
        if(error.code === 11000)
        {
            error = handleDuplicateFieldsDB(error);
        }
        if(error.name === 'ValidationError')
        {
            error = handleValidationErrorDB(error);
        }
        if(error.name==='JsonWebTokenError')
        {
            error= handleJWTError(error);
        }
        if(error.name === 'TokenExpiredError')
        {
            error = handleJWTTokenExpired(error);
    }
        sendErrProd(error,req,res);
    }

    
};