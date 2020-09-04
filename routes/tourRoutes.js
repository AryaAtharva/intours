const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const router = express.Router();
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

// router.param('id', tourController.checkId);
//checkBody middleware

//nested routes 
// get  tours/id/review
// post tours/id/review
// get tours/id/review/id

// router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview);
router.use('/:tourId/reviews',reviewRouter);



router.route('/monthly-plan/:year')
.get(authController.protect,
    authController.restrictTo('admin','lead-guide','guide'),
    tourController.getMonthlyPlan);


router.route('/tour-stats')
.get(tourController.getTourStats);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/top-5-tours')
.get(tourController.aliasTopTours,tourController.getAllTours);


router.route('/')
.get(tourController.getAllTours)
.post(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.checkBody ,
    tourController.createnewtour);



router.route('/:id')
.get(tourController.gettour)
.patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updatetour)
.delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deletetour);



module.exports = router ;