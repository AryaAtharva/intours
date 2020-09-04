const express = require('express');
const reviewController = require('./../controller/reviewController');
const router = express.Router({mergeParams :true});
const authController = require('./../controller/authController')

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createReview);


router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview);

module.exports = router;