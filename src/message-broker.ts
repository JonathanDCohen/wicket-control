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
    const discoveries = await (async () => await this.firestorm.discover())();
    console.log("discovered pixelblazes:");
    console.log("-----------------------------");
    for (const pixelblaze of discoveries) {
      console.log(`${pixelblaze.name} : ${pixelblaze.address}`);
    }
    console.log("-----------------------------");

    this.createServerListeners();
  }

  private createServerListeners(): void {
    this.wss.on("connection", (ws: WebSocket) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (!message.source) {
            console.error(`message ${JSON.stringify(message)} is not a valid data source`)
          }
          switch (message.source) {
            case "gamestarted":
                return this.handleStartGame();
            case "halfwaypointreached":
              return this.handleHalfwayPointReached();
            case "endwicketreached":
              return this.handleEndWicketReached();
          }
        });
      });
  
      this.wss.on("close", () => {
        console.log("closing server");
      });
  }

  private async handleStartGame(): Promise<void> {
    this.gameActive = true;
    console.dir('Game started!');
    // this.firestorm.command(blahblahblah)
  }

  private async handleHalfwayPointReached(): Promise<void> {
    console.dir('Halfway point reached!');
    // this.firestorm.command(blahblahblah)
  }

  private async handleEndWicketReached(): Promise<void> {
    if (this.gameActive) {
      console.dir('You win!');
      this.gameActive = false;
    } else {
      console.dir('Booped the end wicket.');
    }
    // this.firestorm.command(blahblahblah)
  }
}

new CroquetiaMessageBroker().init();
