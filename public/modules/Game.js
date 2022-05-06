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
 * @property {Array<GameElement>} elements Array of GameElement objects
 * @property {Array<GameGrid>} grids Array of grids
 * @property {GameElement} selectedElement Element that is being dragged or held
 * @property {Point} selectedDelta Distance from mouse to center of dragged element
 * @property {Array<string>} pressedKeys Array of currently pressed keys
 * @property {{mousePos:Point,tempContext:CanvasRenderingContext2D}} shared Last recorded mouse position and temporary context shared with elements
 * @property {HTMLCanvasElement} canvas HTML canvas on which the game is played
 * @property {CanvasRenderingContext2D} context Rendering context for the canvas
 * @property {Array<function>} onClear What happens on clear() in addition to removing elements
 * @property {Array<function>} onClick Array of functions triggered on click
 * @property {Array<function>} onMove Array of functions triggered on drag
 * @property {Array<function>} onMouseUp Array of functions triggered on finish dragging
 */
class Game {
    #animationInterval = undefined
    #elements = []
    get elements() {
        return [...this.#elements]
    }
    #selectedElement = undefined
    get selectedElement() {
        return this.#selectedElement
    }
    #selectedDelta = undefined
    get selectedDelta() {
        return this.#selectedDelta.copy()
    }
    #pressedKeys = []
    get pressedKeys() {
        return [...this.#pressedKeys]
    }
    #shared = {
        tempContext: undefined,
        mousePos: undefined
    }
    get shared() {
        return this.#shared
    }
    #grids = []
    get grids() {
        return [...this.#grids]
    }
    #onClear = []
    get onClear() {
        return [...this.#onClear]
    }
    #onClick = []
    get onClick() {
        return [...this.#onClick]
    }
    #onMove = []
    get onMove() {
        return [...this.#onMove]
    }
    #onMouseUp = []
    get onMouseUp() {
        return [...this.#onMouseUp]
    }



    /**
     * Constructor of the Game class
     * @param {HTMLCanvasElement} canvas Canvas on which the game is played
     * @param {HTMLCanvasElement} tempCanvas (optional) Canvas used for click detection of elements
     */
    constructor(canvas,tempCanvas=undefined) {
        canvas.addEventListener("contextmenu",e=>e.preventDefault()) //prevent context menu
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        tempCanvas = tempCanvas || document.createElement('canvas')
        tempCanvas.width = this.canvas.width
        tempCanvas.height = this.canvas.height
        this.#shared.tempContext = tempCanvas.getContext('2d');

        canvas.addEventListener('mousedown',(ev => this.#mouseDown(ev)))
        canvas.addEventListener('touchstart',(ev => this.#mouseDown(ev)),false)
        canvas.addEventListener('mousemove',(ev => this.#mouseMove(ev)))
        canvas.addEventListener('touchmove',(ev => this.#mouseMove(ev)),false)
        canvas.addEventListener('mouseup',(ev => this.#mouseUp(ev)))
        canvas.addEventListener('touchend',(ev => this.#mouseUp(ev)),false)
        document.addEventListener('keydown',(ev => this.#keyDown(ev)))
        document.addEventListener('keyup',(ev => this.#keyUp(ev)))

        setInterval(()=>this.#keyHoldLoop(),30)

        this.animate()
    }

    /**
     * Returns center of the game canvas
     * @returns {Point} center of canvas
     */
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
    createElement(attrs={}) {
        const el = new GameElement(this.getCenter(),[],attrs)
        this.addElement(el)
        return el
    }

    /**
     * Creates, adds and returns a button element
     * @param {Object} attrs Element attributes
     * @returns {GameButton} New instance
     */
    createButton(attrs={}) {
        const button = new GameButton(this.getCenter(),attrs)
        this.addElement(button)
        return button
    }

    /**
     * Creates, adds and returns a text input element
     * @param {Object} attrs Element attributes
     * @returns {GameTextInput} New instance
     */
    createTextInput(attrs={}) {
        const input = new GameTextInput(this.getCenter(),attrs)
        this.addElement(input)
        return input
    }

    /**
     * Creates, adds and returns a canvas element
     * @param {Object} attrs Element attributes
     * @returns {GameCanvas} New instance
     */
    createCanvas(attrs={}) {
        const canvas = new GameCanvas(this.getCenter(),attrs)
        this.addElement(canvas)
        return canvas
    }

    /**
     * Creates, adds and returns a range slider element
     * @param {Object} attrs Element attributes
     * @returns {GameRangeSlider} New instance
     */
    createRangeSlider(attrs={}) {
        const slider = new GameRangeSlider(this.getCenter(),attrs)
        this.addElement(slider)
        return slider
    }

    /**
     * Creates, adds and returns a blank composite object at (0,0)
     * @param {Object} attrs Element attributes
     * @returns {GameComposite} New instance
     */
    createComposite(attrs={}) {
        const composite = new GameComposite([],attrs)
        this.addElement(composite)
        return composite
    }

    /**
     * Calls the copy function of element and adds it to game
     * @param {GameElement|GameCanvas|GameButton|GameComposite|GameTextInput} element Element to copy
     * @param {string} newName Name of the newly created copy
     * @returns {GameElement|GameCanvas|GameButton|GameComposite|GameTextInput} New instance
     */
    copyElement(element,newName=undefined) {
        const copy = element.copy(newName)
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
    createGrid(dx=0,dy=0,width=undefined,height=undefined,cols=undefined,rows=undefined) {
        const grid = new GameGrid(new Point(dx,dy),width,height,cols,rows)
        this.#grids.push(grid)
        return grid
    }

    /**
     * Sorts array of elements by level
     */
    updateLevels() {
        this.#elements = this.#elements.sort(((a, b) => a.level - b.level))
    }

    /**
     * Returns the highest current level value
     * @returns {number} Currently highest level
     */
    highestLevel() {
        return Math.max(...this.#elements.map(el => el.level))
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
     * Adds a listener to the array onClickCallbacks
     * @param {function} callback function to be called
     */
    addOnMouseDownListener(callback) {
        this.#onClick.push(callback)
    }

    /**
     * Removes listener for the onClick event
     * @param {function} callback function you want to remove
     */
    removeOnMouseDownListener(callback) {
        this.#onClick = this.#onClick.filter(item=>item!==callback)
    }

    /**
     * @private
     * Handler for mouse click. Passes the event to relevant elements.
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    #mouseDown(event) {
        // one click at a time
        if (this.#selectedElement) {return}
        // prevent scrolling on touch
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        //get correct mouse position
        const mousePos = this.getMousePos(event)
        if (!this.mouseInBounds(mousePos)) {return}
        //call generic onClick functions for game
        for (const callback of this.#onClick) {
            callback.call(this,event)
        }
        // get clicked element
        const el = this.getElementAtPos(mousePos)
        if (el === null) {return}

        if (el.clickable) {
            el.click(event)
        }
        if (el.draggable || el.holdable) {
            this.#selectedElement = el
            if (el.draggable) {
                el.startDragging(event)
                this.#selectedDelta = mousePos.subtract(el.center)
            }
            if (el.holdable) {
                el.startMouseHold(event)
            }
        }
    }

    /**
     * Keeps dragged element on top of group
     * Adds or replaces the listener for starting dragging
     * @param {GameElement[]} elementArray Array of elements in a group
     */
    moveToTopWhenDragging(elementArray) {
        const game = this
        function moveToTop() {
            const maxLevel = Math.max(...elementArray.map(el=>el.level))
            const topLevelElements = elementArray.filter(el=>el.level === maxLevel)
            if (!topLevelElements.includes(this) || topLevelElements.length > 1) {
                game.changeLevelOfElement(this, maxLevel+1)
            }
        }

        for (const element of elementArray) {
            element.removeOnStartDraggingListener(moveToTop)
            element.addOnStartDraggingListener(moveToTop)
        }
    }

    /**
     * Adds a listener to the array of listeners for onDrag
     * @param {function} callback function to be called
     */
    addOnMouseMoveListener(callback) {
        this.#onMove.push(callback)
    }

    /**
     * Removes listener for the onDrag event
     * @param {function} callback function you want to remove
     */
    removeOnMouseMoveListener(callback) {
        this.#onMove = this.#onMove.filter(item=>item!==callback)
    }

    /**
     * @private
     * Handler for dragging. Triggers every time the mouse is dragged and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    #mouseMove(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        for (const callback of this.#onMove) {
            callback.call(this,event)
        }
        this.#shared.mousePos = this.getMousePos(event)
        if (this.#selectedElement === undefined || !this.#selectedElement.draggable) {
            return
        }
        this.#selectedElement.drag(this.#shared.mousePos,this.#selectedDelta,event)
    }

    /**
     * Adds a listener to the array of listeners for onFinishDragging
     * @param {function} callback function to be called
     */
    addOnMouseUpListener(callback) {
        this.#onMouseUp.push(callback)
    }

    /**
     * Removes listener for the onFinishDragging event
     * @param {function} callback function you want to remove
     */
    removeOnMouseUpListener(callback) {
        this.#onMouseUp = this.#onMouseUp.filter(item=>item!==callback)
    }

    /**
     * @private
     * Handler for finishing dragging. Triggers on mouseup and will pass the event to the selected element (if one exists)
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     */
    #mouseUp(event) {
        if (!(event instanceof MouseEvent)) {
            event.preventDefault()
        }
        for (const callback of this.#onMouseUp) {
            callback.call(this,event)
        }
        if (this.#selectedElement === undefined) {
            return
        }
        if (this.#selectedElement.draggable) {
            this.#selectedElement.finishDragging(event)
        }
        if (this.#selectedElement.holdable) {
            this.#selectedElement.finishMouseHold(event)
        }
        this.#selectedElement = undefined
        this.#selectedDelta = undefined
    }

    /**
     * @private
     * Handler for key press. Allows for multiple keys to be pressed. Triggers keyHold() function in relevant elements
     */
    #keyHoldLoop() {
        if (this.#pressedKeys.length === 0) {
            return
        }
        for (const key of this.#pressedKeys) {
            const objects = this.#elements.filter((el) => Object.keys(el.onKeyHold).includes(key))
            for (const element of objects) {
                element.keyHold(key)
            }
        }
    }

    /**
     * @private
     * Handler for key press. Adds key to the pressedKeys array and triggers keyPress() function in relevant elements
     * @param {KeyboardEvent} event Event with pressed key
     */
    #keyDown(event) {
        const key = event.key

        if (this.#pressedKeys.includes(key)) {
            return
        }

        this.#pressedKeys.push(key)

        //first press
        const listeners = this.#elements.filter((el) => {
            const keys = Object.keys(el.onKeyPress)
            return keys.filter(value => key === value)
        })

        for (const el of listeners) {
            el.keyPress(key,event)
        }
    }

    /**
     * @private
     * Handler for key press. Removes key from the pressedKeys array
     * @param {KeyboardEvent} event Event with pressed key
     */
    #keyUp(event) {
        const key = event.key
        const indexInArray = this.#pressedKeys.indexOf(key)
        if (indexInArray !== -1) {
            //if pressed remove from array of pressed keys
            this.#pressedKeys.splice(indexInArray,1)
        }
        for (const element of this.#elements.filter(el=>el.pressable)) {
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
            throw new TypeError("Incorrect element instance!")
        }
        if (this.#elements.some(el=>el===element)) {
            throw new Error("Trying to add already added object!")
        }

        const nameIsUsed = this.#elements.filter(c => c.name === element.name && element.name !== undefined).length > 0
        if (nameIsUsed) {
            throw new Error(`Used name "${element.name}"`);
        }
        element.shared = this.shared
        this.#elements.push(element)
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
        let el = this.#elements.filter(e => e.name === name)
        if (el.length === 0) {
            throw new Error(`No element has name "${name}"`)
        } else if (el.length > 1) {
            throw new Error(`There are multiple elements with name:"${name}".`)
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
        this.#elements = this.#elements.filter(e => e.name !== name)
        return el
    }

    /**
     * Removes element from elements array
     * @param {GameElement} element Element instance
     */
    removeElement(element) {
        this.#elements = this.#elements.filter(e => e !== element)
    }

    /**
     * Removes multiple elements from elements array
     * @param {GameElement} elements Element instances
     */
    removeElements(...elements) {
        this.#elements = this.#elements.filter(e => !elements.includes(e))
    }

    /**
     * @private
     * Calls the draw function of all elements
     */
    #draw() {
        this.context.setTransform(1,0,0,1,0,0);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width)

        for (const grid of this.#grids) {
            grid.draw(this.context)
        }

        for (const obj of this.#elements) {
            obj.draw(this.context)
        }
    }

    /**
     * Starts the animation loop
     */
    animate() {
        if (this.#animationInterval) {
            this.stopAnimation()
        }
        this.#animationInterval = setInterval(this.#animationLoop.bind(this),30)
    }

    /**
     * Stops the animation loop
     */
    stopAnimation() {
        clearInterval(this.#animationInterval)
    }

    /**
     * @private
     * Calls this.draw() on next animation frame, also calls animate() on Gif drawables
     */
    #animationLoop() {
        const animation = function () {
            this.#draw()

            this.#elements
                .forEach(obj => {
                    obj.animate()
                })
        }

        window.requestAnimationFrame(animation.bind(this))
    }

    /**
     * Sets current mouse position in the shared object and returns it
     * @param {MouseEvent|TouchEvent} event Mouse event passed
     * @returns {Point} Current mouse position
     */
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        let e = event
        if (!(event instanceof MouseEvent)) {
            // TouchEvent not defined in desktop browser
            e = event.touches.item(0)
            if (e === null) {
                return undefined
            }
        }
        this.#shared.mousePos = new Point(
            e.clientX - rect.left,
            e.clientY - rect.top
        )
        return this.#shared.mousePos
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
        for (const i in this.#elements) {
            const el = this.#elements[this.#elements.length-1-i]
            if (!el.clickable && !el.draggable && !el.holdable) {
                continue
            }
            if (el.isInside(position)) {
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
        this.#onClear.push(callback)
    }

    /**
     * Resets game to initial state
     */
    clear() {
        this.#grids = []
        this.#elements = []
        this.#pressedKeys = []
        for (const callback of this.#onClear) {
            callback.call(this)
        }
        this.#onClear = []
    }

    /**
     * Returns an array of elements that collide with input element
     * @param {GameElement} element Element for which the collisions are checked
     * @returns {Array<GameElement>} Array of elements that collide with input element
     */
    checkCollisions(element) {
        const collisions = []
        for (const other of this.#elements) {
            if (element === other) {
                continue
            }
            if (element.collidesWith(other)) {
                collisions.push(other)
            }
        }
        return collisions
    }

    /**
     * Downloads a screenshot of the game area
     */
    screenShot() {
        const tctx = this.shared.tempContext
        tctx.setTransform(1,0,0,1,0,0)

        tctx.fillStyle = "white"
        tctx.fillRect(0,0,this.canvas.width,this.canvas.height)

        const blankImg = new Image()
        blankImg.src = this.canvas.toDataURL('image/png')

        blankImg.addEventListener("load",()=>{
            tctx.drawImage(blankImg,0,0)
            const image = tctx.canvas.toDataURL('image/png')

            tctx.clearRect(0,0,this.canvas.width,this.canvas.height)

            const element = document.createElement("a")
            element.setAttribute("href",image)
            element.setAttribute("download","screenshot"+Date.now()+".png")
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
        })
    }
}

export { Game }