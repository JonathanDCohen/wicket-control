/**
 * Definitions of external data sources
 */
export type DataSource = {
  source: string;
  data?: {
    [k: string]: Object;
  };
};

// type SoundDataSource = {
// 	source: 'sound'
//   data: {
//     frequencyData: number[]
//     //...
//   }
// }

// type DragonStaffDataSource = {
//   source: 'dragonstaff',
//   data: {
//     position: number[]
//     angularMomentum: number[]
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
