# ecars-realtime

## Required Application

Please deploy the `ecars-mqtt-broker` application located under `ecars/apps/ecars-mqtt-broker`.

### Configuration

-   `MQTT_BROKER_URL`: MQTT Broker URL with ws protocol (eg: wss://ecars-mqtt-app.herokuapp.com)

## Required Add-on

Please install the following free add-on on your application before the first deploy.

```
heroku addons:create heroku-postgresql:mini
```

## MQTT Event Simulator

A MQTT simulator is provided with this demo, this will generate sensor events that will be captured by our consumer.

### Configuration

-   `SIMULATOR_CONCURRENCY` - (number / default: 2) - Number of agents per simulator worker
-   `SIMULATOR_INTERVAL` - (number / default: 2000) - Interval for submitting simulator data (in milliseconds)

### Run locally

```
npm install
node sensor-simulator.js
# or use this instead to see lots of debug info
# DEBUG='mqtt:*,agent' node sensor-simulator.js
```

## MQTT Event Connector

### Configuration

-   `DATABASE_URL` - Postgres connection string

For local dev, create a file called `.env` at the top level directory with the above values defined. See `.env.sample` for the expected format. You can use Postgres running locally, or you can create a "development" Heroku app, add Postgres add-ons to it, and fill in `.env` with the environment variable values Heroku gives you. The latter is faster but requires internet access.

```
npm install
node sensor-connector.js
# or use this instead to see lots of debug info
# DEBUG='mqtt:*,connector' node sensor-connector.js
```

## Troubleshooting

When installing the dependencies locally, on MacOS, make sure to enable the following environment variables:

```
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

## Server API

### POST `/agent/start`

Starts a new Car sensor agent, accepts the following parameters as `application/json`:

-   `name` (optional) - Car name (default: `Pulsar One - Black`)
-   `profile` (optional) - Driver profile (default: `medium`)
-   `latitude` (optional) - Car latitude location (default: Random)
-   `longitude` (optional) - Car longitude location (default: Random)
-   `malfunction` (optional) - Enable battery malfunction (default: `false`)
-   `interval` (optional) - Sensor reporting frequency in ms (default: 1500)

### POST `/agent/stop/:vin`

Stops a sensor Car sensor agent, accepts a `vin` as URL parameter

### GET `/agent/list`

Returns a list of running of Car sensor agents

### POST `/agent/malfunction/:vin/start`

Start a malfunction scenario on a running Car sensor agent by `vin`

### POST `/agent/malfunction/:vin/stop`

Stops a malfunction scenario on a running Car sensor agent by `vin`
