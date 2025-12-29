import { rootMachine } from './actors';
import code from './actors?raw';
import { AlarmClockCard, CatCard, HumanCard, PoltergeistCard } from './cards';
import { context } from './context';
import { Details } from './details';

export const silentNight = {
  machine: rootMachine,
  context,
  code,
  details: Details,
  cards: { PoltergeistCard, AlarmClockCard, HumanCard, CatCard },
};
