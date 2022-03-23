// const Game = require("./public/modules/Game.js")
// const GameElement = require("./public/modules/GameElement.js")
// const GameGif = require("./public/modules/drawables/GameGif.js")
// const GameImage = require("./public/modules/drawables/GameImage.js")
// const GameShape = require("./public/modules/drawables/GameShape.js")
// const GameText = require("./public/modules/drawables/GameText.js")

import {Game} from "./Game.js";
import {GameElement} from "./elements/GameElement.js";
import {GameGif} from "./drawables/GameGif.js";
import {GameImage} from "./drawables/GameImage.js";
import {GameText} from "./drawables/GameText.js";
import {GameShape} from "./drawables/GameShape.js";
import {Point} from "./Misc.js";
import {GameCanvas} from "./elements/GameCanvas.js";
import {GameButton} from "./elements/GameButton.js";
import {GameHitbox} from "./GameHitbox.js";
import {GameTextInput} from "./elements/GameTextInput.js";
import {GameComposite} from "./elements/GameComposite.js";
import {GameGrid} from "./GameGrid.js";
import {GameRangeSlider} from "./elements/GameRangeSlider.js";

export {
    Game,
    GameText,
    GameGif,
    GameShape,
    GameElement,
    GameImage,
    Point,
    GameCanvas,
    GameButton,
    GameHitbox,
    GameTextInput,
    GameComposite,
    GameGrid,
    GameRangeSlider
}