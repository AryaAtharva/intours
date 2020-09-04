import axios from 'axios';
import {showAlert} from './alert';

export const reset = async (password,confirmPassword,token)=>{
    try{
        const res = await axios({
            method:'PATCH',
            url : `http://127.0.0.1:3000/api/v1/users/resetPassword/${token}`,
            data:{
                password,
                confirmPassword
            }
        });
        if(res.data.status === 'success')
        {
            showAlert('success','Password Reset Successful .');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    }catch(err){
        showAlert('error',err.response.data.message);
    }
    
 };