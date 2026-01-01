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
    <p>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
      invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
      justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
      ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos
      et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet.
    </p>
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
    NeighborCard,
    FoodDeliveryServiceCard,
  },
};
