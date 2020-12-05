const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const transactionSchema = new Schema({
    
    username: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
       type:Number,
       required: true,
       default: 100000,
       min: 0
    },
    transactions:[
        {   
            tid: {
                type: Number,
                unique: true
            },
            company: {
                 type: String,
                 required:true
            },
            rate: {
                type: Number,
                min:0,
                required:true
            },
            quantity: {
                type: Number,
                min:1,
                required:true
            },
            amount: {
                type: Number,
                min:1,
                required:true
            },
            buyorsell: {
                type: Number,
                required:true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }, {
            timestamps:{ currentTime: () => Math.floor(Date.now() / 1000) }
        }
    ],
    companies:[
        {
            company: {
                type: String,
                required: true,
                unique: true
            },
            quantity: {
               type:Number,
               required: true,
               min: 0
            },
            value: {
               type:Number,
               required: true,
               default: 0
            }
        }
    ]

});

module.exports = mongoose.model('Transaction', transactionSchema);