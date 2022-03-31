// const GameShape = require("./drawables/GameShape.js")
// const GameElement = require("./GameElement.js")
// const Misc = require("./Misc.js")
// const Point = Misc.Point

// import {GameShape} from "./drawables/GameShape.js";
// import {Point} from "./Misc.js";
// import {GameElement} from "./GameElement.js";

import {
    GameShape,
    GameElement,
    Point,
    GameComposite,
    GameButton,
    GameTextInput,
    GameCanvas,
    GameGrid,
    GameRangeSlider
} from "./index.js";

/**
 * Game class. It manages the game state and elements within it.
 * @property {number} animationInterval Loop for drawing
 * @property {Array<GameElement>} elements Array of GameElement objects
 * @property {GameElement} selectedElement Selected element when dragging
 * @property {Point} delta Distance from mouse to center of dragged element
 * @property {Array<string>} pressedKeys Array of currently pressed keys
 * @property {{mousePos:Point,tempContext:CanvasRenderingContext2D}} shared Last recorded mouse position and temporary context shared with elements
 * @property {HTMLCanvasElement} canvas HTML canvas on which the game is played
 * @property {CanvasRenderingContext2D} context Rendering context for the canvas
 * @property {HTMLCanvasElement} tempCanvas Canvas on which the isInside() methods are checked. It can be optionally passed on construction
 * @property {CanvasRenderingContext2D} tempContext Rendering context for the tempCanvas
 * @property {Array<function>} onClear What happens on clear() in addition to removing elements
 * @property {Array<GameGrid>} grids Array of grids
 * @property {Array<function>} onClickCallbacks Array of functions triggered on click
 * @property {Array<function>} onDragCallbacks Array of functions triggered on drag
 * @property {Array<function>} onFinishDraggingCallbacks Array of functions triggered on finish dragging
 */
class Game {
    animationInterval
    /**
     * Constructor of the Game class
     * @param canvas Canvas on which the game is played
     * @param tempCanvas (optional) Hidden canvas where isInside() is calculated
     */
    constructor(canvas,tempCanvas=undefined) {
        canvas.addEventListener("contextmenu",e=>e.preventDefault()) //prevent context menu
        this.elements = []
        this.grids = []
        this.pressedKeys = []
        this.onClear = []
        this.onClickCallbacks = []
        this.onDragCallbacks = []
        this.onFinishDraggingCallbacks = []
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

        canvas.addEventListener('mousedown',(ev => this.onClick(ev)))
        canvas.addEventListener('touchstart',(ev => this.onClick(ev)),false)
        canvas.addEventListener('mousemove',(ev => this.onDrag(ev)))
        canvas.addEventListener('touchmove',(ev => this.onDrag(ev)),false)
        canvas.addEventListener('mouseup',(ev => this.onFinishDragging(ev)))
        canvas.addEventListener('touchend',(ev => this.onFinishDragging(ev)),false)
        document.addEventListener('keydown',(ev => this.onKeyDown(ev)))
        document.addEventListener('keyup',(ev => this.onKeyUp(ev)))

        setInterval(()=>this.keyHoldLoop(),30)

        this.animate()
    }

    getCenter() {
        return new Point(
            this.canvas.width/2,
            this.canvas.height/2
        )
    }

    /**
     * Creates, adds and returns a blank element
     * @param {Object} attrs Element attributes
     * @returns {GameElement} New instance
     */
    createElement(attrs) {
        const el = new GameElement(this.getCenter(),[],attrs)
        this.addElement(el)
        return el
    }

    /**
     * Creates, adds and returns a button element
     * @param {Object} attrs Element attributes
     * @returns {GameButton} New instance
     */
    createButton(attrs) {
        const button = new GameButton(this.getCenter(),attrs)
        this.addElement(button)
        return button
    }

    /**
     * Creates, adds and returns a text input element
     * @param {Object} attrs Element attributes
     * @returns {GameTextInput} New instance
     */
    createTextInput(attrs) {
        const input = new GameTextInput(this.getCenter(),attrs)
        this.addElement(input)
        return input
    }

    /**
     * Creates, adds and returns a canvas element
     * @param {Object} attrs Element attributes
     * @returns {GameCanvas} New instance
     */
    createCanvas(attrs) {
        const canvas = new GameCanvas(this.getCenter(),attrs)
        this.addElement(canvas)
        return canvas
    }

    /**
     * Creates, adds and returns a range slider element
     * @param {Object} attrs Element attributes
     * @returns {GameRangeSlider} New instance
     */
    createRangeSlider(attrs) {
        const slider = new GameRangeSlider(this.getCenter(),attrs)
        this.addElement(slider)
        return slider
    }

    /**
     * Creates, adds and returns a blank composite object at (0,0)
     * @param {Object} attrs Element attributes
     * @returns {GameComposite} New instance
     */
    createComposite(attrs) {
        const composite = new GameComposite([],attrs)
        this.addElement(composite)
        return composite
    }

    /**
     * Calls the copy function of element and adds it to game
     * @param {GameElement|GameCanvas|GameButton|GameComposite|GameTextInput} element Element to copy
     * @returns {GameElement|GameCanvas|GameButton|GameComposite|GameTextInput} New instance
     */
    copyElement(element) {
        const copy = element.copy()
        this.addElement(copy)

        if (copy instanceof GameComposite) {
            //also add its children elements
            copy.addToGame(this)
        }

        return copy
    }

    /**
     * Creates,adds and returns a new grid instance
     * @param {number} dx Deviation from right
     * @param {number} dy Deviation from top
     * @param {number} width Width of the grid
     * @param {number} height Height of the grid
     * @param {number} cols Number of columns
     * @param {number} rows Number of rows
     * @returns {GameGrid} New instance
     */
    createGrid(dx=0,dy=0,width,height,cols,rows) {
        const grid = new GameGrid(new Point(dx,dy),width,height,cols,rows)
        this.grids.push(grid)
        return grid
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
     * @param {GameElement} element Element with level to be changed
     * @param {number} newLevel New level value of the element
     */
    changeLevelOfElement(element,newLevel) {
        element.level = newLevel
        this.updateLevels()
    }

    /**
     * Debugging listener function for checking if mouse is within an element. Draws red or green circles depending on whether the mouse is inside or not.
     * @param {MouseEvent} event Mouse event passed
     */
    drawInside(event) {
        const mousePos = this.getMousePos(event)

        let wasInside = false
        for (const el of this.elements.filter((e)=>e.name!=="drawInside")) {
            const insideElement = el.isInside(mousePos,this.tempContext)
            if (insideElement) {
                wasInside = true
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
     * Adds a listener to the array onClickCallbacks
     * @param {function} callback function to be called
     */
    addOnMouseDownListener(callback) {
        this.onClickCallbacks.push(callback)
    }

    /**
     * Removes listener for the onClick event
     * @param {function} callback function you want to remove
     */
    removeOnMouseDownListener(callback) {
        this.onClickCallbacks = this.onClickCallbacks.filter(item=>item!==callback)
    }

    /**
     * Handler for mouse click. Passes the event to relevant elements.
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    onClick(event) {
        // one click at a time
        if (this.selectedElement) {
            return
        }
        // prevent scrolling on touch
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        //get topmost element
        const mousePos = this.getMousePos(event)
        if (!this.mouseInBounds(mousePos)) {
            return
        }
        //call functions in onClickCallbacks
        for (const callback of this.onClickCallbacks) {
            callback.call(this,event)
        }

        const el = this.getElementAtPos(mousePos)
        if (el === null) {
            return
        }
        if (el.clickable) {
            el.click(event)
        }
        if (el.draggable || el.holdable) {
            this.selectedElement = el
            if (el.draggable) {
                this.delta = new Point(
                    mousePos.x - el.center.x,
                    mousePos.y - el.center.y
                )
            }
            if (el.holdable) {
                el.startMouseHold(event)
            }
        }
    }

    /**
     * Adds a listener to the array of listeners for onDrag
     * @param {function} callback function to be called
     */
    addOnMouseMoveListener(callback) {
        this.onDragCallbacks.push(callback)
    }

    /**
     * Removes listener for the onDrag event
     * @param {function} callback function you want to remove
     */
    removeOnMouseMoveListener(callback) {
        this.onDragCallbacks = this.onDragCallbacks.filter(item=>item!==callback)
    }

    /**
     * Handler for dragging. Triggers every time the mouse is dragged and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    onDrag(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        for (const callback of this.onDragCallbacks) {
            callback.call(this,event)
        }

        if (this.selectedElement === undefined || !this.selectedElement.draggable) {
            return
        }
        const mousePos = this.getMousePos(event)

        this.selectedElement.drag(mousePos,this.delta,event)
    }

    /**
     * Adds a listener to the array of listeners for onFinishDragging
     * @param {function} callback function to be called
     */
    addOnMouseUpListener(callback) {
        this.onFinishDraggingCallbacks.push(callback)
    }

    /**
     * Removes listener for the onFinishDragging event
     * @param {function} callback function you want to remove
     */
    removeOnMouseUpListener(callback) {
        this.onFinishDraggingCallbacks = this.onFinishDraggingCallbacks.filter(item=>item!==callback)
    }

    /**
     * Handler for finishing dragging. Triggers on mouseup and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    onFinishDragging(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }

        for (const callback of this.onFinishDraggingCallbacks) {
            callback.call(this,event)
        }

        if (this.selectedElement === undefined) {
            return
        }

        this.selectedElement.finishDragging(event)
        this.selectedElement.finishMouseHold(event)

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
        for (const key of this.pressedKeys) {
            const objects = this.elements.filter((el) => Object.keys(el.onKeyHold).includes(key))
            for (const element of objects) {
                element.keyHold(key)
            }
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
                return keys.filter(value => key === value)
            })

            for (const el of listeners) {
                el.keyPress(key,event)
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
        }
        for (const element of this.elements.filter(el=>el.pressable)) {
            element.keyUp(event)
        }
    }

    /**
     * Adds element to the array of elements
     * @param {GameElement} element Added element
     * @param {boolean} sort Passing false improves the speed of adding elements, but requires later sorting (by level) for correct display
     */
    addElement(element,sort=true) {
        if (!(element instanceof GameElement)) {
            console.log(element)
            throw new Error("Incorrect element instance!")
        }
        if (this.elements.some(el=>el===element)) {
            throw new Error("Trying to add already added object!")
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
     * Adds multiple elements to game
     * @param {GameElement} elements
     */
    addElements(...elements) {
        for (const element of elements) {
            this.addElement(element,false)
        }
        this.updateLevels()
    }

    /**
     * Returns element with matching name or throws an error
     * @param {string} name Name of searched element
     * @returns {GameElement} Found element
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
     * @returns {GameElement} Removed element
     */
    popElementByName(name) {
        const el = this.getElementByName(name)
        this.elements = this.elements.filter(e => e.name !== name)
        return el[0]
    }

    /**
     * Removes element from elements array
     * @param {GameElement} element Element instance
     */
    removeElement(element) {
        this.elements = this.elements.filter(e => e !== element)
    }

    /**
     * Calls the draw function of all elements
     */
    draw() {
        this.context.setTransform(1,0,0,1,0,0);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

        for (const grid of this.grids) {
            grid.draw(this.context)
        }

        for (const obj of this.elements) {
            obj.draw(this.context)
        }
    }

    /**
     * Starts the animation loop
     */
    animate() {
        this.animationInterval = setInterval(()=>this.#animationLoop(this),30)
    }

    /**
     * Calls this.draw() on next animation frame, also calls animate() on Gif drawables
     * @param {Game} game instance of the Game object
     */
    #animationLoop(game) {
        const animation = function () {
            game.draw()

            game.elements
                .forEach(obj => {
                    obj.animate()
                })
        }

        window.requestAnimationFrame(animation)
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

    mouseInBounds(mousePos) {
        return mousePos.xWithin(0,this.canvas.width) && mousePos.yWithin(0,this.canvas.height)
    }

    /**
     * Returns element on position or null
     * @param {Point} position Searched position
     * @returns {null|GameElement} Element at position or null
     */
    getElementAtPos(position) {
        for (const i in this.elements) {
            const el = this.elements[this.elements.length-1-i]
            if (!el.clickable && !el.draggable && !el.holdable) {
                continue
            }
            if (el.isInside(position, this.tempContext)) {
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
        this.grids = []
        this.elements = []
        this.pressedKeys = []
        for (const callback of this.onClear) {
            callback.call(this)
            // callback()
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