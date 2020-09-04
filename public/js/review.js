import axios from 'axios';
import {showAlert} from './alert';

export const reviewSys = async (tourId ,review,rating)=>{
    try{
    console.log(tourId);
    
    const res = await axios({
        method:'POST',
        url : `http://127.0.0.1:3000/api/v1/tours/${tourId}/reviews`,
        data:{
            review,
            rating
        }
    });
    if(res.data.status === 'success')
        {
            showAlert('success','Review submitted.');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }


    }
    catch(err)
    {
        showAlert('error',err.response.data.message);
    }
 };