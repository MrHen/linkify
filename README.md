# link shortener

The purpose of a link shortener is to reduce url length by converting a full url to smaller footprint. This smaller footprint is easier to share in social media and can also include third-party analytics.

There are two common ways to shorten links:

1. Hashing or encoding the full url using a algorithm like [base64](https://en.wikipedia.org/wiki/Base64) or [MD5](https://en.wikipedia.org/wiki/MD5)
2. Create a random, unique link id and saving the link id for use during link resolution

In both cases, a route will need to handle the translation from shortened link to full link.

## encoding

I chose to create a link id for a few reasons:

* The request had specific length and character requirements for the shortened url and I did not want to create a special hashing function
* Hashing has a small chance of two urls colliding (very unlikely but possible with shorter lengths)
* Creating a link id allows for very small urls -- the algorithm I chose can be modified to shrink links further than the requested 6 characters
* Storing the link information in a database allows us to extend the shortener to other useful features
  * Expiring old links
  * Tracking analytics data on link creation
  * Allowing short links with specific words or characters

## resolution

The easiest form of link resolution is to return a [HTTP 302](https://en.wikipedia.org/wiki/HTTP_302) response. An alternative would be using an [HTML redirect](https://stackoverflow.com/q/5411538/207247) for browsers that accept HTML and only use a 302 response for non-HTML browsers but there are few reasons to do so.

## setup

To run the project you will need access to a DynamoDB table and the appropriate `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. You can add them as envrionment variables or to a [Docker compose override file](https://docs.docker.com/compose/extends/#understanding-multiple-compose-files). Tests run against DynamoDB Local but still require AWS key/secret due to how the AWS SDK works.

To start the api:

* `docker-compose build api`
* `docker-compose up api`

To run tests:

* `docker-compose build test`
* `docker-compose up test`
