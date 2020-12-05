var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var Transaction = require('../models/transactions');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
router.get('/:username', cors.corsWithOptions, authenticate.verifyUser,  function(req, res, next) {
    console.log("hello");
    Transaction.findOne({username: req.params.username})
    .then((user) => {
        if(user===null) {
            res.statusCode=404;
            res.setHeader('Content-Type','application/json');
            res.json({"success": true, "mes": "You don't have any transaction"});
        }

        else {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json({"success": true, "res": user.transactions});
        }
      
    })
});

router.get('/company/:username', cors.corsWithOptions, authenticate.verifyUser,  function(req, res, next) {
    Transaction.findOne({username: req.params.username})
    .then((user) => {
        if(user.companies===null) {
            res.statusCode=404;
            res.setHeader('Content-Type','application/json');
            res.json({"success": false, "mes": "You don't have any stocks."});
        }

        else {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json({"success": true, "res": user.companies});
        }
      
    }, (err) => next(err))
    .catch((err) => next(err)); 
});


router.post('/:username',cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Transaction.findOne({username: req.params.username})
    .then((user) => {
        
        if(user === null) {
            var transactions={
                tid: 1,
                company: req.body.company,
                rate: req.body.rate,
                quantity: req.body.quantity,
                amount: req.body.rate * req.body.quantity,
                buyorsell: req.body.buyorsell
            };

            var companies={
                company:req.body.company,
                quantity: req.body.quantity,
                value: req.body.rate * req.body.quantity * -1
            }

            var data= {
                username: req.params.username,
                balance: 100000 - req.body.rate * req.body.quantity,
                transactions: transactions,
                companies: companies
            };

        Transaction.create(data)
        .then((transaction) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"success":true,"msg":"Transaction Successful!","res":transaction});
        
        })
        .catch((err) => {
            console.log("errr",err)
            next(err)
         })   
        
        
    }
        else if(user!==null) {
            
          
            var transactions={
                tid: user.transactions.length + 1,
                company: req.body.company,
                rate: req.body.rate,
                quantity: req.body.quantity,
                amount: req.body.rate * req.body.quantity,
                buyorsell: req.body.buyorsell
            };

            

            
                 for(var i=0;i<user.companies.length;i++) {
                     if(user.companies[i].company===req.body.company) {

                        var transactions={
                            tid: user.transactions.length + 1,
                            company: req.body.company,
                            rate: req.body.rate,
                            quantity: req.body.quantity,
                            amount: req.body.rate * req.body.quantity,
                            buyorsell: req.body.buyorsell
                        };

                        user.balance = user.balance + req.body.buyorsell * req.body.rate * req.body.quantity
                        user.save()
                        .then((user) => {
                            user.companies[i].value = user.companies[i].value + req.body.buyorsell*req.body.quantity*req.body.rate
                            user.companies[i].quantity= user.companies[i].quantity + req.body.buyorsell*-1*req.body.quantity
                            user.transactions.push(transactions)
                            user.save((user) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({"success":true,"msg":"Transaction Successful!","res":user});
                            })
                         })
                        break;
                     }

                        if(i===user.companies.length-1) {
                            console.log("comp")
                        var companies={
                            company:req.body.company,
                            quantity: req.body.quantity,
                            value: req.body.rate * req.body.quantity * -1
                        }

                        user.balance = user.balance + req.body.buyorsell * req.body.rate * req.body.quantity
                        user.transactions.push(transactions)
                        user.companies.push(companies)
                        user.save()
                        .then((user) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({"success":true,"msg":"Transaction Successful!","res":user});
                        
                        })
                        .catch((err) => {next(err)
                        }) 
                        }

             }
            

        }

            
   }).catch((err) => next(err));
})


module.exports = router;
