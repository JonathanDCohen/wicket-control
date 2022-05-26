import "dotenv/config";
import { WebSocket } from 'ws';
import * as dataSource from "./data-source.js";
const ws = new WebSocket(`ws://localhost:${process.env.BROKER_PORT}`);
ws.on('open', function open() {
  ws.send('{}');
  ws.send(JSON.stringify(dataSource.GameStarted()));
  ws.send(JSON.stringify(dataSource.HalfwayPointReached()));
  ws.send(JSON.stringify(dataSource.EndWicketReached()));
  ws.send(JSON.stringify(dataSource.EndWicketReached()));
  ws.send(JSON.stringify(dataSource.newTestDataSource(Math.random())));
  ws.send(JSON.stringify(dataSource.newTestDataSource(Math.random())));
  ws.send(JSON.stringify(dataSource.newTestDataSource(Math.random())));
  ws.close();
});
