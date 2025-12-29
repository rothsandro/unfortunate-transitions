import { rootMachine } from './actors';
import code from './actors?raw';
import { AlarmClockCard, CatCard, HumanCard } from './cards';
import { context } from './context';

export const silentNight = {
  machine: rootMachine,
  context,
  code,
  cards: { AlarmClockCard, HumanCard, CatCard },
};
