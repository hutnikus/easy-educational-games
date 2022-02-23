// const GameShape = require("./drawables/GameShape.js")
// const GameElement = require("./GameElement.js")
// const Misc = require("./Misc.js")
// const Point = Misc.Point

// import {GameShape} from "./drawables/GameShape.js";
// import {Point} from "./Misc.js";
// import {GameElement} from "./GameElement.js";

import {GameShape, GameElement, Point} from "./index.js";

class Game {
    elements = [];

    //for dragging
    selectedElement = undefined
    deltaClick = undefined

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.tempCanvas = document.createElement('canvas')
        this.tempCanvas.width = this.canvas.width
        this.tempCanvas.height = this.canvas.height
        this.tempContext = this.tempCanvas.getContext('2d');

        // canvas.addEventListener('click',(event) => this.onClick(event))

        canvas.addEventListener('mousedown',(async ev => await this.onClick(ev)))
        canvas.addEventListener('mousemove',(ev => this.onDrag(ev)))
        canvas.addEventListener('mouseup',(ev => this.onFinishDragging(ev)))

        this.animate()
    }

    updateLevels() {
        this.elements = this.elements.sort(((a, b) => a.level - b.level))
    }

    async drawInside(event) {
        const mousePos = this.getMousePos(event)

        let wasInside = false
        for (const el of this.elements) {
            const insideElement = await el.isInside(mousePos,this.tempContext)
            // console.log('inside element', insideElement)
            if (insideElement) {
                wasInside = true
            }
        }

        this.addElement(
            new GameElement(
                mousePos.x,mousePos.y,
                [new GameShape('oval',{rX:2,rY:2,fill:(wasInside) ? 'green' : 'red',level:100})],
                {level:100,clickable:false}
            )
        )
    }

    async onClick(event) {
        const mousePos = this.getMousePos(event)

        //get topmost element
        const el = await this.getElementAtPos(mousePos)
        if (el === null) {
            return
        }

        console.log(`is inside "${el.name}"`)

        if (!el.clickable && !el.draggable) {
            console.error('clicked unresponsive element')
            return
        }
        if (el.clickable) {
            el.click()
        }
        if (el.draggable) {
            this.selectedElement = el
            this.delta = Point(
                mousePos.x - el.center.x,
                mousePos.y - el.center.y
            )
        }
    }

    onDrag(event) {
        if (this.selectedElement === undefined) {
            return
        }
        const mousePos = this.getMousePos(event)

        this.selectedElement.center = Point(
            mousePos.x - this.delta.x,
            mousePos.y - this.delta.y
        )

        // this.selectedElement.drag()
    }

    onFinishDragging(event) {
        if (this.selectedElement === undefined) {
            return
        }
        this.selectedElement.finishDragging()

        this.selectedElement = undefined
        this.delta = undefined
    }

    addElement(element,sort=true) {
        const nameIsUsed = this.elements.filter(c => c.name === element.name && element.name !== undefined).length > 0
        if (nameIsUsed) {
            throw `used name "${element.name}"`;
        }
        this.elements.push(element)
        if (sort) {
            this.updateLevels()
        }
    }

    async draw() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

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
    }

    // return element at pos or null
    async getElementAtPos(position) {
        for (const i in this.elements) {
            const el = this.elements.at(this.elements.length-1-i)
            if (await el.isInside(position, this.tempContext)) {
                return el
            }
        }
        return null
    }

    clear() {
        this.elements = []
    }
}

function animationLoop(game) {
    const animation = function () {
        game.draw()

        game.elements
            .forEach(obj => {
                obj.animate()
            })
    }

    window.requestAnimationFrame(animation)
}

// module.exports = Game

export { Game }