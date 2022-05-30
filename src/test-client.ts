import "dotenv/config";
import { WebSocket } from 'ws';
import * as dataSource from "./data-source.js";
const ws = new WebSocket(`ws://localhost:${process.env.BROKER_PORT}`);
ws.on('open', function open() {
  const command = process.argv[2];
  console.log(process.argv);
  if (command === 'start') {
    ws.send(JSON.stringify(dataSource.GameStarted()));
  } else if (command === 'halfway') {
    ws.send(JSON.stringify(dataSource.HalfwayPointReached()));
  } else if (command === 'end') {
    ws.send(JSON.stringify(dataSource.EndWicketReached()));
  } else if (command === 'discover') {
    ws.send(JSON.stringify(dataSource.ReDiscoverPixelblazes()));
  } else if (Number.parseFloat(command)) { // boooooo you can't assign in an if conditional
    ws.send(JSON.stringify(dataSource.colorPickerDataSource(Number.parseFloat(command))));
  } else if (command === 'pickhue') {
    ws.send(JSON.stringify(dataSource.programNameDataSource('ColorFromVar')));
  } else {
    ws.send(JSON.stringify(dataSource.colorPickerDataSource(Math.random())));
  }
  ws.close();
});
