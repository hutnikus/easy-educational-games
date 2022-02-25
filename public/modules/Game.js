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
    delta = undefined

    //shared with elements
    shared = {
        mousePos: undefined,
        tempContext: undefined
    }

    //for counting frames
    debug = undefined
    lt = 0
    tpf = 0

    constructor(canvas,tempCanvas=undefined, debug = false) {
        this.debug = debug
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        if (tempCanvas === undefined) {
            this.tempCanvas = document.createElement('canvas')
        } else {
            this.tempCanvas = tempCanvas
        }
        this.tempCanvas.width = this.canvas.width
        this.tempCanvas.height = this.canvas.height
        this.tempContext = this.tempCanvas.getContext('2d');

        this.shared.tempContext = this.tempContext

        // canvas.addEventListener('click',(event) => this.onClick(event))

        canvas.addEventListener('mousedown',(async ev => await this.onClick(ev)))
        canvas.addEventListener('mousemove',(ev => this.onDrag(ev)))
        canvas.addEventListener('mouseup',(ev => this.onFinishDragging(ev)))

        this.animate()

        if (debug) {
            function performanceLoop(game) {
                console.log('current time per frame:',game.tpf)

            }
            setInterval(()=>performanceLoop(this),2000)
        }
    }

    updateLevels() {
        this.elements = this.elements.sort(((a, b) => a.level - b.level))
    }

    changeLevel(element,newLevel) {
        element.level = newLevel
        this.updateLevels()
    }

    async drawInside(event) {
        const mousePos = this.getMousePos(event)

        let wasInside = false
        for (const el of this.elements.filter((e)=>e.name!=="drawInside")) {
            const insideElement = await el.isInside(mousePos,this.tempContext)
            if (insideElement) {
                wasInside = true
                // console.log(el)
            }
        }

        let drawElement;
        try {
            drawElement = this.getElementByName("drawInside")
        } catch (e) {
            drawElement = new GameElement(
                Point(0,0),
                [],
                {level:100,clickable:false,name:"drawInside"}
            )
            this.addElement(drawElement)
        }
        drawElement.addChild(new GameShape('oval',{rX:2,rY:2,dx:mousePos.x,dy:mousePos.y,fill:(wasInside) ? 'green' : 'red',level:100}))
    }

    async onClick(event) {
        const mousePos = this.getMousePos(event)

        //get topmost element
        const el = await this.getElementAtPos(mousePos)
        if (el === null) {
            return
        }

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

        this.selectedElement.drag(mousePos,this.delta)
    }

    onFinishDragging(event) {
        if (this.selectedElement === undefined) {
            return
        }
        const mousePos = this.getMousePos(event)

        this.selectedElement.finishDragging()

        this.selectedElement = undefined
        this.delta = undefined
    }

    addElement(element,sort=true) {
        const nameIsUsed = this.elements.filter(c => c.name === element.name && element.name !== undefined).length > 0
        if (nameIsUsed) {
            throw `used name "${element.name}"`;
        }
        element.shared = this.shared
        this.elements.push(element)
        if (sort) {
            this.updateLevels()
        }
    }

    getElementByName(name) {
        let el = this.elements.filter(e => e.name === name)
        if (el.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (el.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        return el[0]
    }

    popElementByName(name) {
        let el = this.elements.filter(e => e.name === name)
        if (el.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (el.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        this.elements = this.elements.filter(e => e.name !== name)
        return el[0]
    }

    async draw() {
        this.context.setTransform(1,0,0,1,0,0);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

        for (const obj of this.elements) {
            await obj.draw(this.context)
        }
    }

    animate() {
        setInterval(()=>this.animationLoop(this),30)
    }

    animationLoop(game) {
        const animation = function () {
            game.draw()

            game.elements
                .forEach(obj => {
                    obj.animate()
                })

            if (game.debug) {
                const timeDelta = performance.now() - game.lt
                game.lt = performance.now()
                game.tpf = (game.tpf + timeDelta) / 2
            }
        }

        window.requestAnimationFrame(animation)
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        const pos = new Point(event.clientX - rect.left, event.clientY - rect.top);

        this.shared.mousePos = pos.copy()

        return pos
    }

    // return element at pos or null
    async getElementAtPos(position) {
        for (const i in this.elements) {
            const el = this.elements.at(this.elements.length-1-i)
            if (!el.clickable && !el.draggable) {
                // console.log("clicked unresponsive element")
                continue
            }
            if (await el.isInside(position, this.tempContext)) {
                // console.log(el)
                return el
            }
        }
        return null
    }

    clear() {
        this.elements = []
    }

    checkCollisions(element) {
        const collisions = []
        for (const other of this.elements) {
            if (element === other) {
                continue
            }
            if (element.collidesWith(other)) {
                collisions.push(other)
            }
        }
        return collisions
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