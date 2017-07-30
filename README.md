# Driving API

## Notes
For the sake of this test, all source code is in a single repo. While this is production ready, I would normally split it up into two different repos and use shared libraries.

Both the `api` and `worker` run in a Docker container with pm2, making it easy to scale. Especially for the worker it's pretty straight forward to add more processes within the same container. (As it's not very memory intensive)

While this solution works and will probably be able to handle high amounts of requests, a better architecture might be to use AWS SQS and AWS Lambda, which will take care of scaling automaticly.

The API is a simple hapi server, easy to scale, but might need nginx in front of it.

## Prerequisites
* Docker
* Node.js >= v6.9.1 (For local dev without docker only)

## Getting started
```
# Clone the repo
git clone git@github.com:woutrbe/driving-api.git

# Change working directories
cd driving-api

# Start Docker
docker-compose -f docker-compose.dev.yml up
```

After running `docker-compose -f docker-compose.dev.yml up`, you should have 3 docker images running:
* driving-api
* driving-worker
* mongodb
* rabbitmq

By default, the API will be exposed to port `2323`, you can change this in the `docker.compose.yml` file.

## Tests
After starting the Docker containers, run `npm test` in the work directory locally.

## Production build
To create a production ready build, run `docker-compose -f docker-compose.prod.yml up`.

The production build is slightly different because it will start the node services without the watch command enabled.

## API
The API will expose two endpoints:

`POST /route`

`GET /route/:id`

## Worker
The worker is responsible for talking to the Google Maps API and calculation driving distances. For the purpose of this test, it will only store the fast distance.
It might be better to store all results in the future.

It will process messages from the `routes` queue in RabbitMQ.