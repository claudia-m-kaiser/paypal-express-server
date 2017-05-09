var express = require('express');
var braintree = require('braintree');
var router = express.Router();
var gateway = require('../lib/gateway');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Get a client token from the braintree gateway
router.get('/braintree/token', function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    if(err){
      console.log("Error while generating the client token. Error message: " + err);
    }else{
      res.json(200,{clientToken: response.clientToken});
    }
  });
});

//Use nonce received from web or mobile app to create a transaction
router.post('/braintree/transaction', function (req, res) {
  var transactionErrors;
  var amount = req.body.amount; // In production you should not take amounts directly from clients
  var nonce = req.body.payment_method_nonce;

  gateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: nonce,
    options: {
      submitForSettlement: true
    }
  }, function (err, result) {
    if (result.success || result.transaction) {
      res.json({transactionid: result.transaction.id});
    } else {
      transactionErrors = result.errors.deepErrors();
      req.flash('error', {msg: formatErrors(transactionErrors)});
      res.json({message:'Transaction error'});
      ;
    }
  });
});


module.exports = router;
