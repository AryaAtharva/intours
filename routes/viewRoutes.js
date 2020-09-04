const express = require('express');
const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();
router.get('/resetForm',viewsController.resetForm);
router.get('/newPassword/:token',viewsController.newPassword);
router.get('/', bookingController.createBookingCheckout,authController.isLoggedIn, viewsController.getOverview);
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/my-tours',authController.protect, viewsController.getMyTours);

router.get('/my-reviews',authController.protect, viewsController.getMyReviews);
router.get('/me', authController.protect, viewsController.getAccount);



module.exports = router;
