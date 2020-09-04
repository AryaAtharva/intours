const catchAsync = require('../utils/catchAsync');
const AppError  = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc)
    {
        return next(new AppError('No document found with that id',404));
    }
    res.status(204).json({
        status : 'success',
          data : null
      });
      
});
exports.createOne = Model => catchAsync(async (req, res,next)=>{
   
    const doc = await Model.create(req.body);
    return res.status(201).json({
        status : "success",
        data : {
            data : doc
        }
    });

}); 

exports.updateOne = Model => catchAsync( async (req ,res,next) => {
    
    const doc= await Model.findByIdAndUpdate(req.params.id , req.body , {
        new : true ,
        runValidators :true
    });
    if(!doc)
        {
            return next(new AppError('No document found with that id',404));
        }
    res.status(200).json({
        status : 'success',
          data :{
              data:doc
          }
      });

});

exports.getOne = (Model , popOptions)=> catchAsync( async (req ,res,next) => {
    
   

    const y =req.params.id;

    let query = Model.findById(y);
    if(popOptions)
    {
        query.populate(popOptions);
    }

    const doc = await query;
    
    if(!doc)
    {
        return next(new AppError('No document found with that id',404));
    }
    //const tour =await  Tour.findOne({_id:ObjectId(req.params.id)});
    res.status(200).json({
        status : 'success',
          data :{
             data : doc 
          }
      });

});

exports.getAll = Model =>catchAsync( async (req ,res,next) => {
    //to allow for nested get in review
    let filter = {};
    if(req.params.tourId)
    {
        filter = {tour : req.params.tourId};
    }


        const features  = new APIFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
        

        const doc = await features.query;

        console.log('------------------------------------------------------------------------------');
        console.log(doc);
        res.status(200).json({
            status : 'success',
            results : doc.length,
            data :{
                data : doc 
            }
        });

    
   
});
