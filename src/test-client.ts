import "dotenv/config";
import { WebSocket } from 'ws';
import * as ds from "./data-source.js";
const ws = new WebSocket(`ws://localhost:${process.env.BROKER_PORT}`);
ws.on('open', function open() {
  const command = process.argv[2];
  console.log(process.argv);
  if (command === 'start') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.GameStarted)));
  } else if (command === 'halfway') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.HalfwayPointReached)));
  } else if (command === 'end') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.EndWicketReached)));
  } else if (command === 'discover') {
    ws.send(JSON.stringify(ds.ReDiscoverPixelblazes()));
  } else if (Number.parseFloat(command)) { // boooooo you can't assign in an if conditional
    ws.send(JSON.stringify(ds.colorPickerDataSource(Number.parseFloat(command))));
  } else if (command === 'pickhue') {
    ws.send(JSON.stringify(ds.programNameDataSource('ColorFromVar')));
  } else {
    ws.send(JSON.stringify(ds.colorPickerDataSource(Math.random())));
  }
  ws.close();
});
