// const GameShape = require("./drawables/GameShape.js")
// const GameElement = require("./GameElement.js")
// const Misc = require("./Misc.js")
// const Point = Misc.Point

// import {GameShape} from "./drawables/GameShape.js";
// import {Point} from "./Misc.js";
// import {GameElement} from "./GameElement.js";

import {GameShape, GameElement, Point, GameComposite, GameButton, GameTextInput, GameCanvas} from "./index.js";

/**
 * Game class. It manages the game state and elements within it.
 * @property {Array<GameElement|GameComposite>} elements Array of GameElement objects
 * @property {GameElement|GameComposite} selectedElement Selected element when dragging
 * @property {Point} delta Distance from mouse to center of dragged element
 * @property {Array<string>} pressedKeys Array of currently pressed keys
 * @property {{mousePos:Point,tempContext:CanvasRenderingContext2D}} shared Last recorded mouse position and temporary context shared with elements
 * @property {HTMLCanvasElement} canvas HTML canvas on which the game is played
 * @property {CanvasRenderingContext2D} context Rendering context for the canvas
 * @property {HTMLCanvasElement} tempCanvas Canvas on which the isInside() methods are checked. It can be optionally passed on construction
 * @property {CanvasRenderingContext2D} tempContext Rendering context for the tempCanvas
 * @property {Array<function>} onClear What happens on clear() in addition to removing elements
 */
class Game {
    /**
     * Constructor of the Game class
     * @param canvas Canvas on which the game is played
     * @param tempCanvas (optional) Hidden canvas where isInside() is calculated
     */
    constructor(canvas,tempCanvas=undefined) {
        this.elements = []
        this.pressedKeys = []
        this.onClear = []
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.shared = {
            tempContext: undefined,
            mousePos: undefined
        }

        if (tempCanvas === undefined) {
            this.tempCanvas = document.createElement('canvas')
        } else {
            this.tempCanvas = tempCanvas
        }
        this.tempCanvas.width = this.canvas.width
        this.tempCanvas.height = this.canvas.height
        this.shared.tempContext = this.tempContext = this.tempCanvas.getContext('2d');

        // canvas.addEventListener('click',(event) => this.onClick(event))

        canvas.addEventListener('mousedown',(async ev => await this.onClick(ev)))
        canvas.addEventListener('touchstart',(async ev => await this.onClick(ev)),false)
        canvas.addEventListener('mousemove',(ev => this.onDrag(ev)))
        canvas.addEventListener('touchmove',(ev => this.onDrag(ev)),false)
        canvas.addEventListener('mouseup',(ev => this.onFinishDragging(ev)))
        canvas.addEventListener('touchend',(ev => this.onFinishDragging(ev)),false)
        document.addEventListener('keydown',(ev => this.onKeyDown(ev)))
        document.addEventListener('keyup',(ev => this.onKeyUp(ev)))

        setInterval(()=>this.keyHoldLoop(),20)

        this.animate()
    }

    createElement(attrs) {
        const el = new GameElement(new Point(0,0),[],attrs)
        this.addElement(el)
        return el
    }

    createButton(attrs) {
        const button = new GameButton(new Point(0,0),attrs)
        this.addElement(button)
        return button
    }

    createTextInput(attrs) {
        const input = new GameTextInput(new Point(0,0),attrs)
        this.addElement(input)
        return input
    }

    createCanvas(attrs) {
        const canvas = new GameCanvas(new Point(0,0),attrs)
        this.addElement(canvas)
        return canvas
    }

    createComposite(attrs) {
        const composite = new GameComposite([],attrs)
        this.addElement(composite)
        return composite
    }

    /**
     * Sorts array of elements by level
     */
    updateLevels() {
        this.elements = this.elements.sort(((a, b) => a.level - b.level))
    }

    /**
     * Returns the highest current level value
     * @returns {number} Currently highest level
     */
    highestLevel() {
        return Math.max(...this.elements.map(el => el.level))
    }

    /**
     * Changes the level of element and sorts elements by level
     * @param {GameElement|GameComposite} element Element with level to be changed
     * @param {number} newLevel New level value of the element
     */
    changeLevelOfElement(element,newLevel) {
        element.level = newLevel
        this.updateLevels()
    }

    /**
     * Debugging listener function for checking if mouse is within an element. Draws red or green circles depending on whether the mouse is inside or not.
     * @param {MouseEvent} event Mouse event passed
     * @returns {Promise<void>}
     */
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
                new Point(0,0),
                [],
                {level:100,clickable:false,name:"drawInside"}
            )
            this.addElement(drawElement)
        }
        drawElement.addChild(new GameShape('oval',{rX:2,rY:2,dx:mousePos.x,dy:mousePos.y,fill:(wasInside) ? 'green' : 'red',level:100}))
    }

    /**
     * Handler for mouse click. Passes the event to relevant elements.
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     * @returns {Promise<void>}
     */
    async onClick(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        const mousePos = this.getMousePos(event)
        // console.log("here")

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
            this.delta = new Point(
                mousePos.x - el.center.x,
                mousePos.y - el.center.y
            )
        }
    }

    /**
     * Handler for dragging. Triggers every time the mouse is dragged and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    onDrag(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        if (this.selectedElement === undefined) {
            return
        }
        const mousePos = this.getMousePos(event)

        this.selectedElement.drag(mousePos,this.delta)
    }

    /**
     * Handler for finishing dragging. Triggers on mouseup and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    onFinishDragging(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        if (this.selectedElement === undefined) {
            return
        }
        const mousePos = this.getMousePos(event)

        this.selectedElement.finishDragging()

        this.selectedElement = undefined
        this.delta = undefined
    }

    /**
     * Handler for key press. Allows for multiple keys to be pressed. Triggers keyHold() function in relevant elements
     */
    keyHoldLoop() {
        if (this.pressedKeys.length === 0) {
            return
        }
        // console.log("pressed:",this.pressedKeys)

        const listeners = this.elements.filter((el) => {
            const keys = Object.keys(el.onKeyHold)
            return keys.filter(value => this.pressedKeys.includes(value))
        })

        for (const el of listeners) {
            el.keyHold(this.pressedKeys)
        }
    }

    /**
     * Handler for key press. Adds key to the pressedKeys array and triggers keyPress() function in relevant elements
     * @param {KeyboardEvent} event Event with pressed key
     */
    onKeyDown(event) {
        const key = event.key
        if (!this.pressedKeys.includes(key)) {
            //if not yet pressed - add to array
            this.pressedKeys.push(key)

            //first press
            const listeners = this.elements.filter((el) => {
                const keys = Object.keys(el.onKeyPress)
                return keys.filter(value => this.pressedKeys.includes(value))
            })

            for (const el of listeners) {
                el.keyPress(this.pressedKeys)
            }
        }
    }

    /**
     * Handler for key press. Removes key from the pressedKeys array
     * @param {KeyboardEvent} event Event with pressed key
     */
    onKeyUp(event) {
        const key = event.key
        const indexInArray = this.pressedKeys.indexOf(key)
        if (indexInArray !== -1) {
            //if pressed
            this.pressedKeys.splice(indexInArray,1)
            // console.log(this.pressedKeys)
        }
    }

    /**
     * Adds element to the array of elements
     * @param {GameElement|GameComposite} element Added element
     * @param {boolean} sort Passing false improves the speed of adding elements, but requires later sorting (by level) for correct display
     */
    addElement(element,sort=true) {
        if (!(element instanceof GameElement) && !(element instanceof GameComposite)) {
            throw new Error("Incorrect element instance!")
        }

        const nameIsUsed = this.elements.filter(c => c.name === element.name && element.name !== undefined).length > 0
        if (nameIsUsed) {
            throw new Error(`used name "${element.name}"`);
        }
        element.shared = this.shared
        this.elements.push(element)
        if (sort) {
            this.updateLevels()
        }
    }

    /**
     * Returns element with matching name or throws an error
     * @param {string} name Name of searched element
     * @returns {GameElement|GameComposite} Found element
     */
    getElementByName(name) {
        let el = this.elements.filter(e => e.name === name)
        if (el.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (el.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        return el[0]
    }

    /**
     * Removes element from elements array and returns it, or throws an error
     * @param {string} name Name of element to be removed
     * @returns {GameElement|GameComposite} Removed element
     */
    popElementByName(name) {
        const el = this.getElementByName(name)
        this.elements = this.elements.filter(e => e.name !== name)
        return el[0]
    }

    /**
     * Removes element from elements array
     * @param {GameElement|GameComposite} element Element instance
     */
    removeElement(element) {
        this.elements = this.elements.filter(e => e !== element)
    }

    /**
     * Calls the draw function of all elements
     * @returns {Promise<void>}
     */
    async draw() {
        this.context.setTransform(1,0,0,1,0,0);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

        for (const obj of this.elements) {
            await obj.draw(this.context)
        }
    }

    /**
     * Starts the animation loop
     */
    animate() {
        setInterval(()=>this.#animationLoop(this),30)
    }

    /**
     * Calls this.draw() on next animation frame, also calls animate() on Gif drawables
     * @param {Game} game instance of the Game object
     */
    async #animationLoop(game) {
        const animation = async function () {
            await game.draw()

            game.elements
                .forEach(obj => {
                    obj.animate()
                })
        }

        window.requestAnimationFrame(await animation)
    }

    /**
     * Sets current mouse position in the shared object and returns it
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     * @returns {Point} Current mouse position
     */
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        let pos;
        if (event instanceof MouseEvent) {
            pos = new Point(event.clientX - rect.left, event.clientY - rect.top);
        } else if (event instanceof TouchEvent) {
            const touch = event.touches.item(0)
            if (touch === null) {
                return undefined
            }
            pos = new Point(touch.clientX - rect.left, touch.clientY - rect.top);
        }

        this.shared.mousePos = pos.copy()

        return pos
    }

    /**
     * Returns element on position or null
     * @param {Point} position Searched position
     * @returns {Promise<null|GameElement>} Element at position or null
     */
    async getElementAtPos(position) {
        for (const i in this.elements) {
            const el = this.elements[this.elements.length-1-i]
            if (!el.clickable && !el.draggable) {
                continue
            }
            if (await el.isInside(position, this.tempContext)) {
                return el
            }
        }
        return null
    }


    /**
     * Additional functions to call on clear
     * @param callback function to call on clear
     */
    addOnClearListener(callback) {
        this.onClear.push(callback)
    }

    /**
     * Resets game to initial state
     */
    clear() {
        this.elements = []
        for (const callback of this.onClear) {
            callback()
        }
    }

    /**
     * Returns an array of elements that collide with input element
     * @param {GameElement} element Element for which the collisions are checked
     * @returns {Array<GameElement>}
     */
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

// module.exports = Game

export { Game }