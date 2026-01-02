import { scene } from './actors';
import code from './actors?raw';
import {
  CatCard,
  ChristmasTreeCard,
  FoodDeliveryServiceCard,
  HumanCard,
  NeighborCard,
  PlantCard,
  PoltergeistCard,
  RobotMopCard,
  TelevisionCard,
  WindowCard,
} from './cards';
import { context } from './context';
import { Logs, Time } from './details';

export const silentNight = {
  chapter: 'Chapter I',
  title: 'Silent Night',
  intro: (
    <>
      <p>
        It's December 24th, and you're a poltergeist with a problem. That problem is Mallory, the
        insufferably cheerful human who lives in your house - yes, YOUR house - along with his cat
        Snowball. He's decorated everything with gaudy lights, put up a tree, and is probably about
        to sing carols. Unacceptable.
      </p>
      <p>
        Your mission: eliminate Mallory before midnight strikes. The catch? You're a poltergeist,
        not some overpowered deity. Your powers are limited to the subtle and indirect - you'll need
        to be creative. Direct confrontation is off the table. Where's the fun in that anyway?
      </p>
      <p>
        A word of caution: you're rather attached to having a roof over your... well, spectral form.
        Some solutions may have unintended consequences. Choose your chaos wisely.
      </p>
    </>
  ),
  machine: scene,
  context,
  code,
  Time,
  Logs,
  actors: {
    PoltergeistCard,
    HumanCard,
    CatCard,
    ChristmasTreeCard,
    WindowCard,
    PlantCard,
    TelevisionCard,
    RobotMopCard,
    FoodDeliveryServiceCard,
    NeighborCard,
  },
};
