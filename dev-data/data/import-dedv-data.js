const dotenv = require('dotenv');
const fs =require('fs');
const mongoose = require('mongoose');
const result = dotenv.config({path : './config.env'});
const Tour  = require('./../../models/tourModel');
const User  = require('./../../models/userModel');
const Review  = require('./../../models/reviewModel');
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
//console.log(DB);
//console.log(`from server.js ${process.env.NODE_ENV}`);

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false 
}).then(() => {
    console.log('DB connection successful');
}).catch(err=>{
    console.log(err);
});

// read json fils

 const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
 const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
 const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

 const importData = async () =>
 {
    try{
        await User.create(users,{ validateBeforeSave : false});
            await Review.create(reviews);
            await Tour.create(tours);
            
            console.log('data successfully loaded');
    }catch(err)
    {
        console.log(err);
    }
    process.exit();
 };

 // delete all data from collection 

 const deleteData = async () =>{
     try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data successfully deleted');
        
     }catch(err)
     {
         console.log(err);
     }
     process.exit();
 };
console.log(process.argv);

if(process.argv[2] === '--import')
{
    importData();
}else if(process.argv[2] === '--delete')
{
    deleteData();
}