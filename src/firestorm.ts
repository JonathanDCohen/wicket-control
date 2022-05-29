/**
 * Typescript wrapper for the Firestorm API
 */

import fetch, { Response as FetchResponse } from "node-fetch";

class HTTPResponseError extends Error {
  constructor(public response: FetchResponse) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
  }
}

function checkStatus(response: FetchResponse) {
  if (response.ok) {
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
}

/**
 * Represents a Pixelblaze known to Firestorm.  See https://github.com/simap/Firestorm#discover-get
 */
type DiscoveryJSON = {
  lastSeen: number;
  address: string;
  id: number;
  programList: {
    id: string;
    name: string;
  }[];
  ver: string;
  exp: number;
  pixelCount: number;
  ledType: number;
  dataSpeed: number;
  colorOrder: string;
  sequenceTimer: number;
  sequencerEnable: boolean;
  brightness: number;
  name: string;
};
/**
 * The API response to GET /discover
 */
type DiscoverResponseJSON = DiscoveryJSON[];

type CommandJSON = {
  [k: string]: any;
}

type CommandRequestJSON = {
  "command": CommandJSON,
  "ids": number[]
};

/**
 * Wraps the Firestorm API.
 */
export class Firestorm {
  private discoveredPixelblazeIds: number[] = [];
  public constructor(private hostname: string, private port: number) {}

  public async init() {
    await this.discover();
  }

  private firestormUrl(): string {
    return `http://${this.hostname}:${this.port}`;
  }

  /**
   * Prompts Pixelblaze discovery and saves discovered pixelblaze IDs.
   * @returns A list of discovered Pixelblazes and their properites
   */
  public async discover(): Promise<DiscoverResponseJSON> {
    console.log('discover')
    const response = await fetch(
      `${this.firestormUrl()}/discover`
    );
    try {
      checkStatus(response);
    } catch (err: any) {
      return Promise.reject(err);
    }
    
    const discoveries = (await response.json()) as DiscoverResponseJSON;
    this.discoveredPixelblazeIds = discoveries.map(v => v.id);
    return discoveries;
  }

  public async setVars(vars: {[k: string]: any}): Promise<void> {
    return this.sendCommand({
      "setVars": {
        ...vars
      }
    });
  }

  private async sendCommand(command: CommandJSON): Promise<void> {
    return this.command({
      command,
      ids: this.discoveredPixelblazeIds
    });
  }

  /**
   * Low level interface which passes through JSON
   * @param command The request body passed through to each PixelBlaze and the list of Pixelblazes to pass to
   */
  public async command(command: CommandRequestJSON): Promise<void> {
    console.log('command', JSON.stringify(command))
    const response = await fetch(
      `${this.firestormUrl()}/command`,
      {
        method: 'post',
        body: JSON.stringify(command),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    checkStatus(response);
  }


}
