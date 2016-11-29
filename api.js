var express = require('express')
require('es6-promise').polyfill()
require('isomorphic-fetch')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

mongoose.connect('mongodb://' + process.env.IP + '/pricing')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.on('disconnected', function () {
    console.log("MongoDB disconnected, attempting reconnection");
    db.connect()
    })
db.once('open', function() {
    console.log('sucessful connection to MongoDB')
})

var pricingSchema = mongoose.Schema({
    id: Number,
    value: Number,
    currency_code: {type: String, default: 'USD'}
})
var Pricing = mongoose.model('Pricing', pricingSchema);

var jsonParser = bodyParser.json()

var app = express()

app.get('/api-v1/products/:id', function (request, response) {
    var id = request.params['id']
    var config = {
        method: 'GET',
        headers: { 'Content-Type':'application/json' }
    };
    fetch('http://redsky.target.com/v1/pdp/tcin/13860428?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics', config)
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(data) {
            console.log(data.product.item.product_description.title)
            var title = data.product.item.product_description.title;
            
            Pricing.findOne({ id: id }, function (error, pricingData) {
                if (error) {
                    return response.sendStatus(500)
                }
                console.log('pricingData : ' + pricingData);
                if(pricingData != null) {
                    response.send(
                    {
                        "id": id,
                        "name": title,
                        "current_price": {
                            "id": pricingData.id,
                            "value": pricingData.value,
                            "currency_code": pricingData.currency_code
                        }
                    })
                } else {
                    response.sendStatus(404)
                }
            })
        })
})

app.put('/api-v1/products/:id', jsonParser, function (request, response) {
    console.log(request.body)
    var newData = { 
        id : request.body.id,
        value: request.body.current_price.value,
        currency_code: request.body.current_price.currency_code
    }
    Pricing.findOneAndUpdate({id: request.body.id}, newData, {upsert:true}, function(error, newDocument){
        if (error) {
            return response.send(500, { error: error })
        }
        response.send(newDocument) // could be changed to output content similar to GET endpoint
    })
})

app.listen(process.env.PORT, function () {
  console.log('REST API listening on port ' + process.env.PORT)
})