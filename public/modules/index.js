// const Game = require("./public/modules/Game.js")
// const GameElement = require("./public/modules/GameElement.js")
// const GameGif = require("./public/modules/drawables/GameGif.js")
// const GameImage = require("./public/modules/drawables/GameImage.js")
// const GameShape = require("./public/modules/drawables/GameShape.js")
// const GameText = require("./public/modules/drawables/GameText.js")

import {Game} from "./Game.js";
import {GameElement} from "./GameElement.js";
import {GameGif} from "./drawables/GameGif.js";
import {GameImage} from "./drawables/GameImage.js";
import {GameText} from "./drawables/GameText.js";
import {GameShape} from "./drawables/GameShape.js";
import {Point} from "./Misc.js";


// module.exports = {
//     Game,
//     GameElement,
//     GameGif,
//     GameImage,
//     GameShape,
//     GameText,
// }

export {Game, GameText, GameGif, GameShape, GameElement, GameImage, Point}