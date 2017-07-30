# Driving API

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

## Production build
To create a production ready build, run `docker-compose -f docker-compose.prod.yml up`.

## API
The API will expose two endpoints:

`POST /route`

`GET /route/:id`

## Worker
The worker is responsible for talking to the Google Maps API and calculation driving distances. For the purpose of this test, it will only store the fast distance.
It might be better to store all results in the future.

It will process messages from the `routes` queue in RabbitMQ.