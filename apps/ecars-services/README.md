# ecars-services

## PDF Service

Heroku app to generate a PDF

This app exposes a `POST /pdf` endpoint which accepts a request body like

```json
{
    "data": {
        "price": 50000,
        "range": "Short Range",
        "exteriorColor": "VIP Black",
        "interiorColor": "Just Black",
        "wheels": "Standard",
        "leadRecordId": "00Q56000004wiT1EAI"
    }
}
```

Required properties in the `data` object are `range`, `exteriorColor`, `interiorColor`, and `leadRecordId`. See `schemas/requestBody.json` for more details.

## Development

Create a `.env` file with the following

```env
SF_LOGIN_URL=https://test.salesforce.com
SF_USERNAME=test-abc@example.com
SF_PASSWORD=s3cr3t
SF_TOKEN=abc123
```

Then

```term
$ npm run dev
```

## Server

```term
$ npm run build
$ npm start
```
