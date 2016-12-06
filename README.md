# target-rest
Target Case Study Web Service

The service uses isomorphic-fetch to make GET requests to the Target web service. It connects to a MongoDB insance where a collection of pricing information is managed. The PUT endpoint is implemented as an upsert, so pricing data can be easily added to the system.

### GET  https://target-rest-beacom.c9users.io:8080/api-v1/products/[id]

GET /api-v1/products/13860428 HTTP/1.1
Host: target-rest-beacom.c9users.io:8080
Cache-Control: no-cache
Postman-Token: 004db7c5-1437-aa10-db1a-9aeb7a7d2a7d


### PUT  https://target-rest-beacom.c9users.io:8080/api-v1/products/[id]

PUT /api-v1/products/16696652 HTTP/1.1
Host: target-rest-beacom.c9users.io:8080
content: application/json
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: ec11c1f2-a9da-542a-a082-b36754e14db3

{
	"id": 16696652,
	"name": "The Big Lebowski (Blu-ray) (Widescreen)",
	"current_price": {
		"value": 13.49,
		"currency_code": "USD"
	}
}

## Code

The code can be found at the GitHub repository: https://github.com/beacom/target-rest