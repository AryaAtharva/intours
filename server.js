const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException',err=>{
    console.log(err.name , err.message);
    console.log('uncaught exception ! Shutting Down..... ');
    process.exit(1);
});

const result = dotenv.config({path : './config.env'});

const app = require('./app');

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

console.log(`from server.js ${process.env.NODE_ENV}`);

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false 
}).then(() => {
    console.log('DB connection successful');
});
// .catch(err=>{
//     console.log(err);
// });




const port = process.env.PORT   || 3000;
const server = app.listen(port,()=>{
    console.log(`App running on port ${port}`);

});


process.on('unhandledRejection',err=>{
    console.log(err.name , err.message);
    console.log('unhandled rejections ! Shutting Down... ');
    server.close(()=>{
        process.exit(1);
    });
    
});

