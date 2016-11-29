var express = require('express')
require('es6-promise').polyfill()
require('isomorphic-fetch')

var app = express()

app.get('/api-v1/products/:id', function (request, response) {
    var id = request.params['id']
    var title = "unknown"
    var price = "unknown"
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
            title = data.product.item.product_description.title;
            
            response.send(
                {
                    "id":id,
                    "name":title,
                    "current_price":
                        {
                            "value": price,
                            "currency_code":"USD"
                        }
                })
        })
    
    
})

app.listen(process.env.PORT, function () {
  console.log('REST API listening on port ' + process.env.PORT)
})