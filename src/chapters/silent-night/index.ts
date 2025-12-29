import { rootMachine } from './actors';
import code from './actors?raw';
import { AlarmClockCard, CatCard, HumanCard, PoltergeistCard } from './cards';
import { context } from './context';

export const silentNight = {
  machine: rootMachine,
  context,
  code,
  cards: { PoltergeistCard, AlarmClockCard, HumanCard, CatCard },
};
