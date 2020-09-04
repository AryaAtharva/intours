const fs= require('fs');
const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
//const tours = JSON.parse(fs .readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]);

exports.resizeTourImages =catchAsync( async (req,res,next) => {
    console.log(req.files);

    if(!req.files.imageCover || !req.files.images)
    {
        return next();
    }

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality : 90})
    .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );


    next();
});


exports.aliasTopTours = (req,res,next)=>{
    req.query.limit= 5 ;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,duration,price,ratingsAverage,summary,difficulty';
    next();
};


exports.checkBody = (req,res,next)=>{
    if(!req.body.name || !req.body.price)
    {
        return res.status(400).json({
            status : 'fail',
            message : 'missing name or price'
        });
    }
    next();
};


exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours =catchAsync( async (req ,res,next) => {
    
//     //     const queryObj ={...req.query}  ;
//     //     const excludedFields = ['page' , 'sort' , 'limit' , 'fields'];
//     //     excludedFields.forEach(el => delete queryObj[el]);
       
//     //    let queryStr = JSON.stringify(queryObj);
//     //    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`);
       
//     //    //console.log(JSON.parse(queryStr));
       
//     //     let query =Tour.find(JSON.parse(queryStr));
        
//         // if(req.query.sort)
//         // {
//         //     const sortBy = req.query.sort.split(',').join(' ');
//         //     console.log(sortBy);

//         //     query = query.sort(sortBy);
//         // }else
//         // {
//         //     query = query.sort('-createdAt');
//         // }


//         // if(req.query.fields){
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     query = query.select(fields);
//         // }
//         // else{
//         //     query = query.select('-__v');
//         // }


//         // const page = req.query.page *1 ||1;
//         // const limit = req.query.limit *1 || 100;
//         // const skip = (page - 1 )*limit; 

//         // if(req.query.page)
//         // {
//         //     const numTours  = await Tour.countDocuments();
//         //     if(skip>=numTours)
//         //     {
//         //         throw new Error('The page does not exists.');
//         //     }
//         // }
//         // query = query.skip(skip).limit(limit);

//         // execute query
//         const features  = new APIFeatures(Tour.find(),req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .pagination();
        

//         const tours = await features.query;
//        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

//         res.status(200).json({
//             status : 'success',
//             results : tours.length,
//             data :{
//                 tours : tours 
//             }
//         });

    
//     //try{}
//     // catch(err)
//     // {
//     //     res.status(404).json({
//     //         status:'failed',
//     //         message : err
//     //     });
//     // }
    
// });

exports.gettour=factory.getOne(Tour,{path:'reviews' });

// exports.gettour=catchAsync( async (req ,res,next) => {
    
   

//         const y =req.params.id;
//         const tour = await Tour.findById(y).populate('reviews');
//         console.log(req.params.id);
//         if(!tour)
//         {
//             return next(new AppError('no tour found with that id',404));
//         }
//         //const tour =await  Tour.findOne({_id:ObjectId(req.params.id)});
//         res.status(200).json({
//             status : 'success',
//               data :{
//                  tours : tour 
//               }
//           });
    
//     //try{}
//     // catch (err)
//     // {
//     //     res.status(404).json({
//     //         status:'failed',
//     //         message : err
//     //     });
//     // }


//     // const tour = tours.find(el=> el.id===id);
    
// });

exports.createnewtour = factory.createOne(Tour);

// exports.createnewtour =catchAsync(async (req, res,next)=>{
   
//         const newTour = await Tour.create(req.body);
//         return res.status(201).json({
//             status : "success",
//             data : {
//                 tours : newTour
//             }
//         });
    
//     // try{
//     //
//     //    } 
//     //
//     //   catch(err)
//     // {
//     //     res.status(400).json({
//     //         status : 'Fail',
//     //         message : err
//     //     });
//     // }

// }); 

exports.updatetour =factory.updateOne(Tour);

// exports.updatetour =catchAsync( async (req ,res,next) => {
    
//     const tour= await Tour.findByIdAndUpdate(req.params.id , req.body , {
//         new : true ,
//         runValidators :true
//     });
//     if(!tour)
//         {
//             return next(new AppError('no tour found with that id',404));
//         }
//     res.status(200).json({
//         status : 'success',
//           data :{
//               tour
//           }
//       });

    
//       //try{}
//     // catch(err)
//     // {
//     //     res.status(400).json({
//     //         status : 'Fail',
//     //         message : 'Invalid data sent'
//     //     });
//     // }
    
// });


exports.deletetour = factory.deleteOne(Tour);
// exports.deletetour =catchAsync( async (req ,res,next) => {
    

//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour)
//         {
//             return next(new AppError('no tour found with that id',404));
//         }
//         res.status(204).json({
//             status : 'success',
//               data : null
//           });

//     //try{}
//     // catch(err)
//     // {
//     //     res.status(404).json({
//     //         status : 'Fail',
//     //         message : 'Invalid data sent'
//     //     });
//     // }
    
// });

exports.getTourStats = catchAsync(async(req,res,next) =>{
    
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage : {$gte : 4.5}} 
            },
            {
                $group : {
                    _id : {$toUpper:'$difficulty' },
                   num : { $sum : 1},
                    numRatings : { $sum : '$ratingsQuantity' },
                    avgRating : { $avg : '$ratingsAverage' },
                    avgPrice : { $avg : '$price' },
                    minPrice : { $min : '$price' },
                    maxPrice : { $max : '$price' }
                }
            },
            {
                $sort : { avgPrice :1  }
            }
            // ,
            // {
            //     $match : {_id:{$ne : 'EASY'}}
            // }

        ]);
        res.status(200).json({
            status : 'success',
              data :{
                  stats
              }
          });
    
    // catch(err)
    // {
    //     res.status(404).json({
    //         status : 'Fail',
    //         message : err
    //     });
    // }
});


exports.getMonthlyPlan =catchAsync( async (req,res,next) =>
{
      
        const year  = req.params.year *1;

        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match : {startDates:{
                    $gte : new Date(`${year}-01-01`),
                    $lte : new Date(`${year}-12-31`)
                }
                }
            },
            {
                $group:{
                    _id : {$month : '$startDates'},
                    numTourStarts : {$sum :1},
                    tours : {$push : '$name'}
                }
            },
            {
                $addFields : {month : '$_id'} 
            },
            {
                $project :{
                    _id:0
                }
            },
            {
                $sort : { _id : 1}
            },
            {
                $limit : 12
            }

        ]);
        res.status(200).json({
            status : 'success',
              data :{
                  plan
              }
          });

    
    //try{}
    // catch(err)
    // {
    //     res.status(404).json({
    //         status : 'Fail',
    //         message : err
    //     });
    // }
});

exports.getToursWithin =catchAsync( async (req,res,next)=>{
    const {distance , latlng , unit} = req.params;
    const [lat , lng] = latlng.split(',');

    const radius = unit==='mi' ? distance/3963.2 : distance/ 6378.1;

    if(!lat || !lng )
    {
        next(new AppError('Please provide latitude and longitude',400));

    }

    console.log(distance,lat,lng,unit);
    const tours = await Tour.find({
        startLocation :{$geoWithin :{$centerSphere :[[lng , lat ],radius]}}
    });

    res.status(200).json(
        {
            status: 'success',
            length : tours.length,
            data:
            {
                tour:tours
            }

        }
    );
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });