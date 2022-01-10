// const GameShape = require("./drawables/GameShape.js")
// const GameElement = require("./GameElement.js")
// const Misc = require("./Misc.js")
// const Point = Misc.Point

// import {GameShape} from "./drawables/GameShape.js";
// import {Point} from "./Misc.js";
// import {GameElement} from "./GameElement.js";

import {GameShape, GameElement, Point} from "./index.js";

const TYPES = []

class Game {
    elements = [];

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.tempCanvas = document.createElement('canvas')
        this.tempCanvas.width = this.canvas.width
        this.tempCanvas.height = this.canvas.height
        this.tempContext = this.tempCanvas.getContext('2d');

        canvas.addEventListener('click',(event) => this.onClick(event))
        canvas.addEventListener('mousemove',(event) => this.drawInside(event))
    }

    drawInside(event) {
        const mousePos = this.getMousePos(event)

        let wasInside = false
        for (const el of this.elements) {
            if (el.isInside(mousePos,this.tempContext)) {
                wasInside = true
            }
        }

        this.addElement(
            new GameElement(
                mousePos.x,mousePos.y,
                [new GameShape('oval',{rX:2,rY:2,fill:(wasInside) ? 'green' : 'red',level:100})],
                {level:100}
            )
        )
    }

    onClick(event) {
        const mousePos = this.getMousePos(event)
        console.log('mouse',mousePos)

        for (const el of this.elements) {
            if (el.isInside(mousePos, this.tempContext)) {
                console.log('is inside',el)
            }
        }
    }

    addElement(element) {
        this.elements.push(element)
        this.elements = this.elements.sort(((a, b) => a.level - b.level))
    }

    async draw() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

        this.elements = this.elements.sort(((a, b) => a.level - b.level))


        for (const obj of this.elements) {
            await obj.draw(this.context)
        }
    }

    animate() {
        setInterval(()=>animationLoop(this),50)
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return new Point(event.clientX - rect.left, event.clientY - rect.top);
    };
}

function animationLoop(game) {
    game.draw()

    game.elements
        .forEach(obj => {
            obj.animate()
        })
}

// module.exports = Game

export { Game }