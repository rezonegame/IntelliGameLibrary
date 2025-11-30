import { Game } from '../../../core/models/game.model';
import { GAMES_A } from './games-a';
import { GAMES_B_F } from './games-b-f';
import { GAMES_C_W_Z } from './games-c-w-z';
import { GAMES_G_H } from './games-g-h';
import { GAMES_J_M } from './games-j-m';
import { GAMES_N_O } from './games-n-o';
import { GAMES_P_S } from './games-p-s';
import { GAMES_T_Z } from './games-t-z';

// Combine all game data arrays
const allGames: Game[] = [
  ...GAMES_A,
  ...GAMES_B_F,
  ...GAMES_C_W_Z,
  ...GAMES_G_H,
  ...GAMES_J_M,
  ...GAMES_N_O,
  ...GAMES_P_S,
  ...GAMES_T_Z
];

// Sort the combined array by Chinese name (Pinyin)
allGames.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN-u-co-pinyin'));

export const INITIAL_GAMES: Game[] = allGames;
