/**
 * Definitions of external data sources
 */
export interface DataSource {
  source: string;
  data?: {
    [k: string]: Object;
  };
};

// An example data source where the hue value for the strip is sent.
export interface ColorPickerDataSource extends DataSource {
  source: 'colorpicker',
  data: {
    hue: number
  }
}

export function colorPickerDataSource(hue: number): ColorPickerDataSource {
  return {
    source: 'colorpicker',
    data: {
      hue
    }
  };
}

// TODO this isn't right but it works for now
export interface ProgramNameDataSource extends DataSource {
  source: 'programname',
  data: {
    programName: string
  }
}

export function programNameDataSource(programName: string): ProgramNameDataSource {
  return {
    source: 'programname',
    data: {
      programName
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

export enum CroquetEvent {
  GameStarted = "gamestarted",
  HalfwayPointReached = "halfwaypointreached",
  EndWicketReached = "endwicketreached",
}

interface CroquetEventDataSource extends DataSource {
  source: "croquet"
  data: {
    event: CroquetEvent;
  };
}

export function makeCroquetEvent(event: CroquetEvent): CroquetEventDataSource {
  return {
    source: "croquet",
    data: {
      event
    }
  };
}

export function ReDiscoverPixelblazes() {
  return {
    source: "discover",
  }
}
