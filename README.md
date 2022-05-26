# Croquetia Wicket Control Server

This repo implements a WebSocket server which brokers data from external sources into messages to Pixelblaze-powered wickets.

## Set-Up

Make sure that Node, NPM, and Yarn are installed on your device.

```
# Install dependencies
npm install

# Start a Firestorm server.  This doesn't require any Pixelblazes on the wifi network
npm run firestorm:build
npm run firestorm:run
```

Then in a different terminal:
```
# Build and start the broker server
npm run dev
```

To run a test client, open a third terminal and run `npm run testclient`

## Data Format

The message broker expects a simple JSON data source, defined in [src/data-source.ts](src/data-source.ts).
Data sources all have a `source` field describing the source of the data.  This doubles as an event tag name.
Data sources optionally have a `data` field containing arbitrary structured JSON data.  So as an example:

```
{
  source: 'datasourceexample',
  data: {
    someField: 123
  }
}
```
