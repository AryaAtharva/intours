const express = require('express');
const bookingController = require('./../controller/bookingController');

const authController = require('./../controller/authController')
const router = express.Router();
router.use(authController.protect);

router.get('/checkout-session/:tourId',bookingController.checkoutSession);

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

  router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;