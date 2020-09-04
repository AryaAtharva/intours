import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login , logout} from './login';
import {updateSettings} from './updateSettings';
import { bookTour } from './stripe';
import {forgPass} from './forgotPasswor';
import {signup} from './signup';
import { reset } from './resetPassword';
import { reviewSys } from './review';

//dom elements
const mapBox =document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const resetForm = document.querySelector('.form--resetPassword');
const logOutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');
const userDataForm = document.querySelector('.form-user-data');
const forgotDataForm = document.querySelector('.form--forgotPassword');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewBtn = document.getElementById('review-tour');

if (reviewBtn)
  reviewBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;

    reviewSys(tourId,review,rating);
    e.target.textContent = 'Review Tour';
  });

if(mapBox)
{
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

}

if(loginForm)
{
    loginForm.addEventListener('submit' , e=>{
        e.preventDefault();
        const password = document.getElementById('password').value;
const email = document.getElementById('email').value;
        login(email,password);
    });
}

if(logOutBtn)
{
    console.log('mofos');
    logOutBtn.addEventListener('click',logout);
}

if(userDataForm)
{
    userDataForm.addEventListener('submit', e=>{
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo' , document.getElementById('photo').files[0]);
       

        updateSettings(form,'data');

    });
}

if(userPasswordForm)
{
    userPasswordForm.addEventListener('submit',async e=>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        
        const passwordCurrent = document.getElementById('password-current').value;

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
       await updateSettings({passwordCurrent,password,confirmPassword },'password');
       document.getElementById('password-current').value='';
       document.getElementById('password').value='';
       document.getElementById('password-confirm').value='';
       document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';

    });
}

if(signupForm)
{
    signupForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const name = document.getElementById('name').value;
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        //console.log(name,email,password,confirmPassword);
        await signup(name, email,password,confirmPassword);

        
    });
}

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

  if(forgotDataForm)
  {
    forgotDataForm.addEventListener('submit' ,async e=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        await forgPass(email);
    });
  }

  if(resetForm)
  {
      resetForm.addEventListener('submit' ,async e=>{
        e.preventDefault();
        document.querySelector('.btn--reset-pass').textContent = 'Resetting ....';
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        const token = document.getElementById('token').value;
        await reset(password,confirmPassword,token);
        document.querySelector('.btn--reset-pass').textContent = 'Reset Password';
    });
  }