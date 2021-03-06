/**
 * Accepts incoming data messages, translates to Pixelblaze, and sends out to wickets.
 * Handles wicket discovery.
 */
 import { createServer, Server } from 'http';

import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";

import { Firestorm } from "./firestorm.js";
import * as ds from "./data-source.js";

// TODO hold vars to be set by external data sources and sent as often as possible over HTTP to Firestorm
class CroquetiaMessageBroker {
  // This logic may eventually want to be in a game controller which uses the message broker
  private gameActive = false;
  private http: Server = null;
  private wss: WebSocketServer = null;
  private firestorm: Firestorm = null;
  private dragonstaffPixels: number[][] = [];
  /** Maps each array in dragonstaffPixels to an id */
  private pixelMapping: {[idx: number]: number};
  private sendInterval: NodeJS.Timer = null;
  private sendPeriodSecs = 0.1;

  async start(): Promise<void> {
    this.http = createServer();
    this.wss = new WebSocketServer({
      server: this.http,
    });
    this.firestorm = new Firestorm(
      process.env.FIRESTORM_HOSTNAME,
      parseInt(process.env.FIRESTORM_PORT)
    );

    // Check that Firestorm is up and running.  This may want to be a poll eventually.
    // TODO poll and error handling / real orchestration.
    await this.handleDiscover();

    this.createWebsocketListeners();
    this.http.listen(process.env.BROKER_PORT);
  }

  private createWebsocketListeners(): void {
    this.wss.on("connection", (ws: WebSocket) => {
        ws.on("message", async (data) => {
          const message = JSON.parse(data.toString()) as ds.DataSource;
          if (!message.source) {
            console.error(`message ${JSON.stringify(message)} is not a valid data source`)
          }
          switch (message.source) {
            case "croquet":
              return this.handleCroquetEvent((message as ds.CroquetEventDataSource));
            case "colorpicker":
              return this.handleColorPickerDataSource(message as ds.ColorPickerDataSource);
            // TODO this should be a field, not a data source.  
            case "programname":
              return this.handleProgramNameDataSource(message as ds.ProgramNameDataSource);
            case "discover":
              return (await this.handleDiscover());
            case "dragonstaff":
              this.dragonstaffPixels = (message as ds.DragonStaffDataSource).data.pixels;
              return;
            case "start":
              this.sendInterval = setInterval(() => {
                this.sendPixels();
              }, this.sendPeriodSecs);
              return;
            case "stop":
              clearInterval(this.sendInterval);
            default:
              console.dir(JSON.stringify(message));
          }
        });
      });
  
    this.wss.on("close", () => {
      console.log("closing server");
    });
  }

  private async handleDiscover(): Promise<void> {
    const discoveries = await (async () => await this.firestorm.discover())();
    console.log("discovered pixelblazes:");
    console.log("-----------------------------");
    for (const pixelblaze of discoveries) {
      console.log(`${pixelblaze.name} : ${pixelblaze.address}`);
    }
    console.log("-----------------------------");
  }

  private async handleCroquetEvent(message: ds.CroquetEventDataSource) {
    const event = message.data.event;
    const Events = ds.CroquetEvent;
    switch(event) {
      case Events.GameStarted:
        this.gameActive = true;
        console.dir('Game started!');
        await this.firestorm.setVars({'colorHue': 0});
        return;
      case Events.HalfwayPointReached:
        console.dir('Halfway point reached!');
        await this.firestorm.setVars({'colorHue': 1/3});
        return;
      case Events.EndWicketReached:
        if (this.gameActive) {
          console.dir('You win!');
          this.gameActive = false;
          await this.firestorm.setVars({'colorHue': 2/3});
        } else {
          console.dir('Booped the end wicket.');
          await this.firestorm.setVars({'colorHue': 1});
        }
        return;
    }
  }

  private async handleColorPickerDataSource(message: ds.ColorPickerDataSource): Promise<void> {
    console.dir(`test data source: ${message.data.hue}`);
    await this.firestorm.setVars({'colorHue': message.data.hue});
  }

  private async sendPixels() {
    // TODO make this work for multiple pixelblazes -- we will have to separate by id
    console.log(ds.hsvToPixelblaze(this.dragonstaffPixels))
    await this.firestorm.setVars(ds.hsvToPixelblaze(this.dragonstaffPixels));
  }

  private async handleProgramNameDataSource(message: ds.ProgramNameDataSource): Promise<void> {
    console.dir(`program name data source: ${message.data.programName}`);
    await this.firestorm.setProgramName(message.data.programName);
  }
}

new CroquetiaMessageBroker().start();
