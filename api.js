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
    fetch('http://redsky.target.com/v1/pdp/tcin/' + id + '?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics', config)
        .then(function(response) {
            if (response.status >= 400) {
                console.log("Unable to obtain item data from RedSky")
                return { product: { item: { product_description: { title: "unknown" }}}}
            } else {
                return response.json()
            }
        })
        .then(function(data) {
            console.log(data.product.item.product_description.title)
            var title = data.product.item.product_description.title;
            
            Pricing.findOne({ id: id }, function (error, pricingData) {
                if (error) {
                    return response.sendStatus(500)
                }
                currentPrice = {
                            "value": "unknown",
                            "currency_code": "unknown"
                }
                if(pricingData != null) {
                    var currentPrice = {
                            "value": pricingData.value,
                            "currency_code": pricingData.currency_code
                        }
                }
                
                response.send(
                    {
                        "id": id,
                        "name": title,
                        "current_price": currentPrice
                    })
                
            })
        })
})

app.put('/api-v1/products/:id', jsonParser, function (request, response) {
    console.log(request.body)
    if(request.params['id'] != request.body.id) {
        console.error("mismatched JSON body and parameter id values")
        return response.sendStatus(500)
    }
    var newData = { 
        id : request.body.id,
        value: request.body.current_price.value,
        currency_code: request.body.current_price.currency_code
    }
    Pricing.findOneAndUpdate({id: request.body.id}, newData, {upsert:true}, function(error, newDocument){
        if (error) {
            console.error("failure updating pricing info : " + request.body.id)
            return response.send(500, { error: error })
        }
        response.send(newData) // return just the subset of data this endpoint can alter
    })
})

app.listen(process.env.PORT, function () {
  console.log('REST API listening on port ' + process.env.PORT)
})