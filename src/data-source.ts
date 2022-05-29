/**
 * Definitions of external data sources
 */
export type DataSource = {
  source: string;
  data?: {
    [k: string]: Object;
  };
};

// An example data source where the hue value for the strip is sent.
export type ColorPickerDataSource = {
  source: 'colorpicker',
  data: {
    hue: number
  }
}

export function colorPickerDataSource(field: number): ColorPickerDataSource {
  return {
    source: 'colorpicker',
    data: {
      hue: field
    }
  };
}

type SoundDataSource = {
	source: 'sound'
  data: {
    /**
     * A 32-element array of average frequency magnitudes.  
     * Middle C is around frequencyData[7].  See bhence.com/pixelblaze-sensor-expansion for specific bin center frrequencies.
     */
    frequencyData: number[],
    /**
     * Total audio volume.  See documentation for mapping from dbA measurements to energyAverage values
     */
    energyAverage: number,
    /**
     * The strongest frequency, in Hz, with a resolution of ~39 Hz.
     */
    maxFrequency: number,
    /**
     * The magnitude of the strongest frequency.  Scaled the same as energyAverage?
     */
    maxFrequencyMagnitude
  }
}

// type DragonStaffDataSource = {
//   source: 'dragonstaff',
//   data: {
//     position: number[]
//     angularMomentum: number[]
//     ...
//   }
// }

// other game events may not need associated data

// This could be sent from the modified Firestorm server's UI?
export function GameStarted() {
  return {
    source: "gamestarted",
  };
}

export function HalfwayPointReached() {
  return {
    source: "halfwaypointreached",
  };
}

// note this isn't 'GameEndedDataSource'.  The server can determine that itself
export function EndWicketReached() {
  return {
    source: "endwicketreached",
  };
}

export function ReDiscoverPixelblazes() {
  return {
    source: "discover",
  }
}
