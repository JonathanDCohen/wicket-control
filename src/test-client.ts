import "dotenv/config";
import { WebSocket } from 'ws';

import * as ds from "./data-source.js";
import { DiscoverResponseJSON, Firestorm } from "./firestorm.js";

class FakeDragonStaffClient {
  private updateInterval: NodeJS.Timer = null;
  private sendInterval: NodeJS.Timer = null;
  // TODO support for more than one output strip
  private pixels: number[][] = [];
  private blazes: DiscoverResponseJSON = [];
  private firestorm: Firestorm = null;
  
  constructor(private ws: WebSocket) {
    this.firestorm = new Firestorm(
      process.env.FIRESTORM_HOSTNAME,
      parseInt(process.env.FIRESTORM_PORT)
    );
  }
  
  async start() {
    // TODO rediscover every second to make it easier to start everything up
    this.blazes = await this.firestorm.discover();
    // Just for testing
    const count = this.blazes[0]?.pixelCount || 10;
    this.pixels = Array(count);
    for (let pixelInBlaze = 0; pixelInBlaze < this.pixels.length; ++pixelInBlaze) {
      this.pixels[pixelInBlaze] = [pixelInBlaze / this.pixels.length, 1, 1];
    }

    const huePeriodSecs = 10;
    this.updateInterval = setInterval(
      () => {
        this.updatePixels(huePeriodSecs);
      }, huePeriodSecs * 256 / 1000);
    const sendDataPeriodSecs = 0.01;
    this.sendInterval = setInterval(
      () => {
        this.ws.send(JSON.stringify(ds.dragonStaffDataSource(this.pixels)));
      }, sendDataPeriodSecs * 1000);
    // this.updatePixels(huePeriodSecs);
    this.ws.send(JSON.stringify(ds.dragonStaffDataSource(this.pixels)));
  }
  
  stop() {
    console.log("STOP");
    clearInterval(this.updateInterval);
    clearInterval(this.sendInterval);
  }

  private updatePixels(huePeriodSecs: number): void {
    for (const hsv of this.pixels) {
      hsv[0] = (hsv[0] + 1 / (huePeriodSecs * 256)) % 1;
    }
  }
}

const ws = new WebSocket(`ws://localhost:${process.env.BROKER_PORT}`);
let dragonStaff: FakeDragonStaffClient = new FakeDragonStaffClient(ws);

ws.on('open', function open() {
  const command = process.argv[2];
  console.log(process.argv);
  if (command === 'startcroquet') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.GameStarted)));
  } else if (command === 'halfway') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.HalfwayPointReached)));
  } else if (command === 'endcroquet') {
    ws.send(JSON.stringify(ds.makeCroquetEvent(ds.CroquetEvent.EndWicketReached)));
  } else if (command === 'discover') {
    ws.send(JSON.stringify(ds.ReDiscoverPixelblazes()));
  } else if (Number.parseFloat(command)) { // boooooo you can't assign in an if conditional
    ws.send(JSON.stringify(ds.colorPickerDataSource(Number.parseFloat(command))));
  } else if (command === 'pickhue') {
    ws.send(JSON.stringify(ds.programNameDataSource('ColorFromVar')));
  } else if (command === 'start') {
    dragonStaff.start();
    ws.send(JSON.stringify(ds.programNameDataSource('HsvFromOutside')));
    ws.send(JSON.stringify({source: 'start'}));
  } else if (command === 'stop') {
    dragonStaff.stop();
    ws.send(JSON.stringify({source: 'stop'}));
  } else {
    ws.send(JSON.stringify(ds.colorPickerDataSource(Math.random())));
  }
  // ws.close();
});
