/**
 * Accepts incoming data messages, translates to Pixelblaze, and sends out to wickets.
 * Handles wicket discovery.
 */

import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";

import { Firestorm } from "./firestorm.js";
import * as ds from "./data-source.js";

type Wicket = {
  ws: WebSocket;
  address: string;
  id: number;
  name: string;
}

class DataSourceError extends Error {
  constructor(public reason: string) {
    super(reason);
  }
}

class CroquetiaMessageBroker {
  // This logic may eventually want to be in a game controller which uses the message broker
  private gameActive = false;
  private wss: WebSocketServer = null;
  private firestorm: Firestorm = null;
  private wickets: Wicket[] = [];

  async init(): Promise<void> {
    this.wss = new WebSocketServer({
      port: parseInt(process.env.BROKER_PORT),
    });
    this.firestorm = new Firestorm(
      process.env.FIRESTORM_HOSTNAME,
      parseInt(process.env.FIRESTORM_PORT)
    );

    // Check that Firestorm is up and running.  This may want to be a poll eventually
    this.wickets = await this.handleDiscover();

    this.createServerListeners();
  }

  private createServerListeners(): void {
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
            default:
              console.dir(JSON.stringify(message));
          }
        });
      });
  
      this.wss.on("close", () => {
        console.log("closing server");
      });
  }

  private async handleDiscover(): Promise<Wicket[]> {
    const discoveries = await (async () => await this.firestorm.discover())();
    const wickets = discoveries.map(d => { return {
      ws: new WebSocket(d.address),
      address: d.address,
      id: d.id,
      name: d.name,
    }});
    console.log("discovered pixelblazes:");
    console.log("-----------------------------");
    for (const pixelblaze of wickets) {
      console.log(`${pixelblaze.name} : ${pixelblaze.address}`);
    }
    console.log("-----------------------------");
    return wickets;
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

  private async handleProgramNameDataSource(message: ds.ProgramNameDataSource): Promise<void> {
    console.dir(`program name data source: ${message.data.programName}`);
    await this.firestorm.setProgramName(message.data.programName);
  }
}

new CroquetiaMessageBroker().init();
