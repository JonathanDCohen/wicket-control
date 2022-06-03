/**
 * Accepts incoming data messages, translates to Pixelblaze, and sends out to wickets.
 * Handles wicket discovery.
 */

import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";

import { Firestorm } from "./firestorm.js";
import * as dataSources from "./data-source.js";

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
  private wickets: WebSocket[] = [];

  async init(): Promise<void> {
    this.wss = new WebSocketServer({
      port: parseInt(process.env.BROKER_PORT),
    });
    this.firestorm = new Firestorm(
      process.env.FIRESTORM_HOSTNAME,
      parseInt(process.env.FIRESTORM_PORT)
    );

    // Check that Firestorm is up and running.  This may want to be a poll eventually
    await this.handleDiscover();

    this.createServerListeners();
  }

  private createServerListeners(): void {
    this.wss.on("connection", (ws: WebSocket) => {
        ws.on("message", async (data) => {
          const message = JSON.parse(data.toString());
          if (!message.source) {
            console.error(`message ${JSON.stringify(message)} is not a valid data source`)
          }
          switch (message.source) {
            // TODO the game specific ones should come from "game" source and the events should be data fields
            case "gamestarted":
                return this.handleStartGame();
            case "halfwaypointreached":
              return this.handleHalfwayPointReached();
            case "endwicketreached":
              return this.handleEndWicketReached();
            case "colorpicker":
              return this.handleColorPickerDataSource(message);
            // TODO this should be a field, not a data source.  
            case "programname":
              return this.handleProgramNameDataSource(message);
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

  private async handleDiscover(): Promise<void> {
    const discoveries = await (async () => await this.firestorm.discover())();
    console.log("discovered pixelblazes:");
    console.log("-----------------------------");
    for (const pixelblaze of discoveries) {
      console.log(`${pixelblaze.name} : ${pixelblaze.address}`);
    }
    console.log("-----------------------------");
  }

  private async handleStartGame(): Promise<void> {
    this.gameActive = true;
    console.dir('Game started!');
    await this.firestorm.setVars({'colorHue': 0});
  }

  private async handleHalfwayPointReached(): Promise<void> {
    console.dir('Halfway point reached!');
    await this.firestorm.setVars({'colorHue': 1/3});
  }

  private async handleEndWicketReached(): Promise<void> {
    if (this.gameActive) {
      console.dir('You win!');
      this.gameActive = false;
      await this.firestorm.setVars({'colorHue': 2/3});
    } else {
      console.dir('Booped the end wicket.');
      await this.firestorm.setVars({'colorHue': 1});
    }
  }

  private async handleColorPickerDataSource(message: dataSources.ColorPickerDataSource): Promise<void> {
    console.dir(`test data source: ${message.data.hue}`);
    await this.firestorm.setVars({'colorHue': message.data.hue});
  }

  private async handleProgramNameDataSource(message: dataSources.ProgramNameDataSource): Promise<void> {
    console.dir(`program name data source: ${message.data.programName}`);
    await this.firestorm.setProgramName(message.data.programName);
  }
}

new CroquetiaMessageBroker().init();
