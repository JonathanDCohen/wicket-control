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

/**
 * Wraps the Firestorm API.
 */
export class Firestorm {
  public constructor(private hostname: string, private port: number) {}

  public async discover(): Promise<DiscoverResponseJSON> {
    const response = await fetch(
      `http://${this.hostname}:${this.port}/discover`
    );
    try {
      checkStatus(response);
    } catch (err: any) {
      return Promise.reject(err);
    }
    return (await response.json()) as DiscoverResponseJSON;
  }
}
