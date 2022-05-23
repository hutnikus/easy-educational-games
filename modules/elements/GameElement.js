import {Point} from "../Misc.js";
import {GameDrawable} from "../drawables/GameDrawable.js";
import {GameHitbox} from "../GameHitbox.js";
import {GameGif} from "../drawables/GameGif.js";
import {Game} from "../Game.js";
import {GameImage} from "../drawables/GameImage.js";
import {GameShape} from "../drawables/GameShape.js";
import {GameText} from "../drawables/GameText.js";

/**
 * GameElement class. Handles shared actions and properties of game elements
 *
 * @property {string} name Name of the element. Undefined or unique
 * @property {number} level Level of the element in relation to its siblings
 * @property {Point} center Center of the element. Absolute value
 * @property {Point} homePosition Home position of the element. Element moves here on home() call
 * @property {Array<GameDrawable>} children Array of drawables linked to the element
 * @property {boolean} keepOnTop Keeps the element on top of its siblings
 * @property {boolean} clickable Element will respond to click
 * @property {boolean} draggable Element will respond to holding
 * @property {boolean} pressable Element will respond to key press
 * @property {boolean} stationary Element will respond to holding, but won't change its position
 * @property {boolean} holdable Element will respond to holding
 * @property {Array<function>} onClick Array of callbacks called on click
 * @property {Array<function>} onDrag Array of callbacks called on dragging/holding
 * @property {Array<function>} onFinishDragging Array of callbacks called when finished dragging/holding
 * @property {Array<function>} onStartDragging Array of callbacks called when starting dragging/holding
 * @property {Array<function>} onFinishMouseHold Array of callbacks called when finished mouseHold
 * @property {Object} onKeyPress Map of (keyboard) keys mapped to an array of callbacks called on key press
 * @property {Object} onKeyHold Map of (keyboard) keys mapped to an array of callbacks called on key hold
 * @property {Array<function>} onKeyUp Array of callbacks called when all keys are lifted
 * @property {Array<function>} onMove Array of callbacks called on move
 * @property {Array<Object>} onMouseHold Array of callbacks called on mouse hold
 * @property {Object} shared Shared object passed from Game
 * @property {Game} game Reference to the game (passed on game.addElement)
 * @property {Array<GameHitbox>} hitboxes Array of hitboxes linked to the element
 * @property {boolean} hitboxVisible Hitboxes are drawn on true, else are hidden
 * @property {number} rotation Rotation of element in radians
 * @property {boolean} visible Element is visible
 * @property {GameGrid} grid Reference to grid (if it belongs)
 * @property {Array<Array<Point|number>>} animationQueue Animations in the future
 * @property {boolean} isAnimating Flag
 */
class GameElement {
    #name = undefined
    get name() {
        return this.#name
    }
    set name(value) {
        if (!this.game) {
            this.#name = value
            return
        }
        const gameHasName = this.game.elements.filter(el=>el.name===value).length > 0
        if (gameHasName) {
            throw new Error(`Name "${value}" is not unique!`)
        }
        this.#name = value
    }
    #centerValue
    set center(newCenter) {
        if (!(newCenter instanceof Point)) {
            throw new Error("Incorrect center instance!")
        }
        this.#centerValue = newCenter
    }
    get center() {
        return this.#centerValue
    }

    /**
     * @returns {number} X coordinate
     */
    get x() {
        return this.center.x
    }
    /**
     * Sets X position
     * @param {number} newX new X position
     */
    set x(newX) {
        if (isNaN(newX)) {
            throw new TypeError("Invalid type for x position!")
        }
        this.center.x = newX
    }
    /**
     * @returns {number} Y coordinate
     */
    get y() {
        return this.center.y
    }
    /**
     * Sets Y position
     * @param {number} newY new Y position
     */
    set y(newY) {
        if (isNaN(newY)) {
            throw new TypeError("Invalid type for y position!")
        }
        this.center.y = newY
    }

    #level = undefined
    get level() {
        return this.#level
    }
    set level(newLevel) {
        if (isNaN(newLevel)) {
            throw new TypeError("Invalid type for level!")
        }
        this.#level = newLevel
        if (this.game) {
            this.game.updateLevels()
        }
    }


    /**
     * Constructor of the GameElement class
     * @param {Point} center Absolute position of the element
     * @param {Array<GameDrawable>} children Array of drawables
     * @param {Object} attrs Attribute object
     */
    constructor(center,children,attrs={}) {
        this.#name = attrs.name;
        this.center = center;
        if (attrs.x !== undefined) {
            this.center.x = attrs.x
        }
        if (attrs.y !== undefined) {
            this.center.y = attrs.y
        }
        this.homePosition = attrs.homePosition || center.copy()
        this.children = []
        this.keepOnTop = attrs.keepOnTop || false
        this.onClick = (attrs.onClick === undefined) ? [] : attrs.onClick
        this.onDrag = (attrs.onDrag === undefined) ? [] : attrs.onDrag
        this.onFinishDragging = (attrs.onFinishDragging === undefined) ? [] : attrs.onFinishDragging
        this.onStartDragging = (attrs.onStartDragging === undefined) ? [] : attrs.onStartDragging
        this.onKeyPress = (attrs.onKeyPress === undefined) ? {} : attrs.onKeyPress
        this.onKeyHold = (attrs.onKeyHold === undefined) ? {} : attrs.onKeyHold
        this.onKeyUp = attrs.onKeyUp || []
        this.onMouseHold = attrs.onMouseHold || []
        this.onFinishMouseHold = attrs.onFinishMouseHold || []
        this.onMove = (attrs.onMove === undefined) ? [] : attrs.onMove
        this.hitboxes = []

        for (const child of children) {
            this.addChild(child)
        }

        if (attrs.hitboxes !== undefined && !Array.isArray(attrs.hitboxes)) {
            throw "Hitboxes need to be in an array"
        }
        this.hitboxes = (Array.isArray(attrs.hitboxes)) ? attrs.hitboxes : []
        this.hitboxVisible = (attrs.hitboxVisible === undefined) ? false : attrs.hitboxVisible;

        this.clickable = (attrs.clickable === undefined) ? false : attrs.clickable;
        this.draggable = (attrs.draggable === undefined) ? false : attrs.draggable;
        this.stationary = (attrs.stationary === undefined) ? false : attrs.stationary;
        this.pressable = attrs.pressable || false;
        this.holdable = attrs.holdable || false;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);

        this.rotation = (attrs.rotation === undefined) ? 0 : Number(attrs.rotation);
        this.visible = (attrs.visible === undefined) ? true : attrs.visible
        this.grid = undefined

        this.isAnimating = false
        this.animationQueue = []
    }

    moveToTop() {
        if (this.game) {
            this.game.moveElementToTop(this)
        }
    }

    moveToBottom() {
        if (this.game) {
            this.game.moveElementToBottom(this)
        }
    }

    /**
     * Sets home position
     * @param {number} x
     * @param {number} y
     */
    setHome(x,y) {
        this.homePosition.x = x
        this.homePosition.y = y
    }

    /**
     * Returns element to home position
     */
    home() {
        this.center = this.homePosition.copy()
    }

    /**
     * Creates, adds and returns a new instance of GameGif
     * @param {string} gifName Name of gif without extension
     * @param {Object} attrs Attributes
     * @returns {GameGif} Newly created instance
     */
    createGif(gifName,attrs={}) {
        const gif = new GameGif(gifName,attrs)
        this.addChild(gif)
        return gif
    }

    /**
     * Creates, adds and returns a new instance of GameImage
     * @param {string} imageName Name of image WITH extension
     * @param {Object} attrs Attributes
     * @returns {GameImage} Newly created instance
     */
    createImage(imageName,attrs={}) {
        const img = new GameImage(imageName,attrs)
        this.addChild(img)
        return img
    }

    /**
     * Creates, adds and returns a new instance of GameShape
     * @param {TYPE} type Type of shape (rectangle,oval,line,polygon)
     * @param {Object} attrs Attributes, line and polygon require coords attribute
     * @returns {GameShape} Newly created instance
     */
    createShape(type,attrs={}) {
        const shape = new GameShape(type,attrs)
        this.addChild(shape)
        return shape
    }

    /**
     * Creates, adds and returns a new instance of GameText
     * @param {string} text Text to be displayed
     * @param {Object} attrs Attributes
     * @returns {GameText} Newly created instance
     */
    createText(text,attrs={}) {
        const textElement = new GameText(text,attrs)
        this.addChild(textElement)
        return textElement
    }

    /**
     * Changes the position of element to values
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     */
    setPosition(x,y) {
        if (!Number.isNaN(x)) {
            this.center.x = x
        }
        if (!Number.isNaN(y)) {
            this.center.y = y
        }
    }

    /**
     * Creates and adds a new hitbox
     * @param {number} radius Radius of hitbox
     * @param {number} dx Deviation on X axis
     * @param {number} dy Deviation on Y axis
     */
    addHitbox(radius,dx=0,dy=0) {
        this.hitboxes.push(new GameHitbox(radius,dx,dy))
    }

    /**
     * Adds drawable to the children array
     * @param {GameDrawable} child Added drawable
     * @param {boolean} sort Sorts children array on true. False speeds addition but requires sorting later for correct display
     */
    addChild(child,sort=true) {
        if (!(child instanceof GameDrawable)) {
            throw new Error("Incorrect instance of child! Should be GameDrawable")
        }

        const nameIsUsed = this.children.filter(c => c.name === child.name && child.name !== undefined).length > 0
        if (nameIsUsed) {
            throw `used name "${child.name}"`;
        }
        this.children.push(child)
        if (sort) {
            this.sortChildren()
        }
    }

    /**
     * Sorts children array by level
     */
    sortChildren() {
        this.children = this.children.sort(((a, b) => a.level - b.level))
    }

    /**
     * Returns child drawable with input name or throws an error
     * @param {string} name Searched name
     * @returns {GameDrawable|GameGif|GameShape|GameText|GameImage} Found child drawable
     */
    getChildByName(name) {
        let child = this.children.filter(child => child.name === name)
        if (child.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (child.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        return child[0]
    }

    /**
     * Removes element from elements array and returns it, or throws an error
     * @param {string} name Name of element to be removed
     * @returns {GameDrawable} Removed element
     */
    popChildByName(name) {
        const el = this.getChildByName(name)
        this.children = this.children.filter(e => e.name !== name)
        return el
    }

    /**
     * Transforms the canvas context and calls draw function of every visible child
     * @param {CanvasRenderingContext2D} ctx Rendering context of the canvas
     */
    draw(ctx) {
        if (!this.visible) {
            return
        }

        ctx.save()
        //set center and rotation
        ctx.setTransform(1,0,0,1,this.center.x,this.center.y);
        ctx.rotate(this.rotation)

        for (const drawable of this.children) {
            if (drawable.visible) {
                drawable.draw(ctx);
            }
        }
        if (this.hitboxVisible) {
            for (const hb of this.hitboxes) {
                hb.draw(ctx, this.center);
            }
        }

        ctx.restore()
    }

    /**
     * Updates the animation on every child of type GameGif
     */
    animate() {
        this.children
            .filter(obj => obj instanceof GameGif)
            .forEach(obj=>obj.updateAnimation())
    }

    /**
     * Checks if mouse is inside any of the instance's child
     * @param {Point} mouse Mouse position
     * @returns {boolean} True when inside
     */
    isInside(mouse) {
        if (!this.visible) {
            return false
        }
        const ctx = this.shared.tempContext
        //clear the temp context
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0,ctx.canvas.width,ctx.canvas.height);
        //set center and rotation
        ctx.setTransform(1,0,0,1,this.center.x,this.center.y);
        ctx.rotate(this.rotation)
        ctx.save()
        for (const drawable of this.children) {
            if (drawable.visible) {
                drawable.draw(ctx);
            }
        }
        // create pixel array
        const imageData = ctx.getImageData(0, 0,ctx.canvas.width,ctx.canvas.height);
        ctx.restore()
        // get the index of clicked pixel in pixel array
        const pixelIndex = Math.floor(mouse.x) * 4 + Math.floor(mouse.y) * 4 * Math.floor(ctx.canvas.width);
        // get alpha at clicked pixel
        const alpha=imageData.data[pixelIndex+3];
        // clicked pixel is not empty
        return alpha !== 0
    }

    /**
     * Adds a listener to the array of listeners for onClick
     * @param {function} callback function to be called
     */
    addOnClickListener(callback) {
        this.onClick.push(callback)
    }

    /**
     * Removes listener for the onClick event
     * @param {function} callback function you want to remove
     */
    removeOnClickListener(callback) {
        this.onClick = this.onClick.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for onDrag
     * @param {function} callback function to be called
     */
    addOnDragListener(callback) {
        this.onDrag.push(callback)
    }

    /**
     * Removes listener for the onDrag event
     * @param {function} callback function you want to remove
     */
    removeOnDragListener(callback) {
        this.onDrag = this.onDrag.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for onStartDragging
     * @param {function} callback function to be called
     */
    addOnStartDraggingListener(callback) {
        this.onStartDragging.push(callback)
    }

    /**
     * Removes listener for the onStartDragging event
     * @param {function} callback function you want to remove
     */
    removeOnStartDraggingListener(callback) {
        this.onStartDragging = this.onStartDragging.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for onFinishDragging
     * @param {function} callback function to be called
     */
    addOnFinishDraggingListener(callback) {
        this.onFinishDragging.push(callback)
    }

    /**
     * Removes listener for the onFinishDragging event
     * @param {function} callback function you want to remove
     */
    removeOnFinishDraggingListener(callback) {
        this.onFinishDragging = this.onFinishDragging.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for onFinishMouseHold
     * @param {function} callback function to be called
     */
    addOnFinishMouseHoldListener(callback) {
        this.onFinishMouseHold.push(callback)
    }

    /**
     * Removes listener for the onFinishDragging event
     * @param {function} callback function you want to remove
     */
    removeOnFinishMouseHoldListener(callback) {
        this.onFinishMouseHold = this.onFinishMouseHold.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for onKeyPress
     * @param {string} key Key the callback will be called for
     * @param {function} callback function to be called
     */
    addOnKeyPressListener(key,callback) {
        if (!Array.isArray(this.onKeyPress[key])) {
            this.onKeyPress[key] = []
        }
        this.onKeyPress[key].push(callback)
    }

    /**
     * Removes listener for the onKeyPress event
     * @param {string} key Key from which the listener is removed from
     * @param {function} callback function you want to remove
     */
    removeOnKeyPressListener(key,callback) {
        if (this.onKeyPress[key] !== undefined) {
            this.onKeyPress[key] = this.onKeyPress[key].filter(item=>item!==callback)
            if (this.onKeyPress[key].length === 0) {
                delete this.onKeyPress[key]
            }
        }
    }

    /**
     * Adds a listener to the array of listeners for onKeyHold
     * @param {string} key Key the callback will be called for
     * @param {function} callback function to be called
     * @param {number} stagger Skips this many calls
     */
    addOnKeyHoldListener(key,callback,stagger=0) {
        if (!Array.isArray(this.onKeyHold[key])) {
            this.onKeyHold[key] = []
        }
        this.onKeyHold[key].push({callback,stagger,stg:0})
    }

    /**
     * Removes listener for the onKeyHold event
     * @param {string} key Key from which the listener is removed from
     * @param {function} callback function you want to remove
     */
    removeOnKeyHoldListener(key,callback) {
        if (this.onKeyHold[key] !== undefined) {
            this.onKeyHold[key] = this.onKeyHold[key].filter(item=>item.callback!==callback)
            if (this.onKeyHold[key].length === 0) {
                delete this.onKeyHold[key]
            }
        }
    }

    /**
     * Adds a listener to the array of listeners for onKeyUp
     * @param {function} callback function to be called
     */
    addOnKeyUpListener(callback) {
        this.onKeyUp.push(callback)
    }

    /**
     * Removes listener for the onKeyUp event
     * @param {function} callback function you want to remove
     */
    removeOnKeyUpListener(callback) {
        this.onKeyUp = this.onKeyUp.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for move
     * @param {function} callback function to be called
     */
    addOnMoveListener(callback) {
        this.onMove.push(callback)
    }

    /**
     * Removes listener for the onClick event
     * @param {function} callback function you want to remove
     */
    removeOnMoveListener(callback) {
        this.onMove = this.onMove.filter(item=>item!==callback)
    }

    /**
     * Adds a listener to the array of listeners for mouse hold
     * @param {function} callback function to be called
     * @param {number} stagger how many calls are skipped (higher = slower execution)
     */
    addOnMouseHoldListener(callback,stagger=0) {
        this.onMouseHold.push({callback,stagger,stg:0})
    }

    /**
     * Removes listener for mouse hold
     * @param {function} callback function you want to remove
     */
    removeOnMouseHoldListener(callback) {
        this.onMouseHold = this.onMouseHold.filter(item=>item.callback!==callback)
    }

    /**
     * Calls the functions in the onClick array
     * @param {Object} event Event passed from listener
     */
    click(event) {
        for (const callback of this.onClick) {
            callback.call(this,event)
        }
    }

    /**
     * Calls the functions in the onDrag array
     * @param {Point} mousePos Mouse position
     * @param {Point} delta Deviation of the mouse position (when clicked) from the center
     * @param {Event} event
     */
    drag(mousePos,delta,event) {
        if (!this.stationary) {
            this.center = mousePos.subtract(delta)
            for (const callback of this.onMove) {
                callback.call(this,event)
            }
        }
        for (const callback of this.onDrag) {
            callback.call(this,event)
        }
    }

    /**
     * Calls the functions in the onStartDragging array
     */
    startDragging(event) {
        if (this.keepOnTop) {
            this.moveToTop()
        }
        for (const callback of this.onStartDragging) {
            callback.call(this,event)
        }
    }

    /**
     * Calls the functions in the onFinishDragging array
     */
    finishDragging(event) {
        for (const callback of this.onFinishDragging) {
            callback.call(this,event)
        }
    }

    /**
     * Calls the functions in the onKeyPress object that are assigned to the passed keys
     * @param {string} key Array of currently pressed keys
     * @param {Event} event
     */
    keyPress(key,event) {
        if (!this.pressable) {
            return
        }
        const events = this.onKeyPress[key]
        if (events !== undefined && events.length !== 0) {
            for (const callback of events) {
                callback.call(this,event)
            }
        }
    }

    /**
     * Calls the functions in the onKeyHold object that are assigned to the passed keys
     * @param {string} key Array of currently pressed keys
     */
    keyHold(key) {
        if (!this.pressable) {
            return
        }
        const events = this.onKeyHold[key]
        if (events !== undefined && events.length !== 0) {
            for (const obj of events) {
                if (obj.stg === 0) {
                    obj.callback.call(this)
                    obj.stg = obj.stagger
                } else {
                    obj.stg--
                }
            }
        }
    }

    /**
     * Calls the functions in the onKeyUp array and resets stagger values for onKeyHold
     * @param event
     */
    keyUp(event) {
        for (const callback of this.onKeyUp) {
            callback.call(this,event)
        }

        const events = this.onKeyHold[event.key]
        if (events !== undefined && events.length !== 0) {
            for (const obj of events) {
                obj.stg = 0
            }
        }
    }

    /**
     * Creates mouse hold interval
     * @param event
     */
    startMouseHold(event) {
        if (this.holdInterval) {
            return
        }
        function holdFunction() {
            for (const obj of this.onMouseHold) {
                if (obj.stg === 0) {
                    obj.callback.call(this, event)
                    obj.stg = obj.stagger
                } else {
                    obj.stg--
                }
            }
        }

        holdFunction.call(this)
        this.holdInterval = setInterval(holdFunction.bind(this),30)
    }

    /**
     * Stops and resets mouse hold interval
     * @param event
     */
    finishMouseHold(event) {
        clearInterval(this.holdInterval)
        this.holdInterval = undefined

        for (const obj of this.onMouseHold) {
            obj.stg = 0
        }

        for (const callback of this.onFinishMouseHold) {
            callback.call(this,event)
        }
    }

    /**
     * Returns true on collision with the other element
     * @param {GameElement} other Element with which the collision is checked
     * @returns {boolean} True on colision else false
     */
    collidesWith(other) {
        if (this.hitboxes.length === 0) {return false}
        if (other.hitboxes.length === 0) {return false}
        for (const hb1 of this.hitboxes) {
            const pos1 = this.center
                             .add(hb1.delta)
                             .rotateAround(this.center,this.rotation)
            for (const hb2 of other.hitboxes) {
                const pos2 = other.center
                                  .add(hb2.delta)
                                  .rotateAround(other.center,other.rotation)
                const distance = pos1.distanceTo(pos2)

                if (distance < hb1.r + hb2.r) {return true}
            }
        }
        return false
    }

    /**
     * Moves the element by vector delta and calls onMove callbacks
     * @param {Point} delta Vector by which the element is moved
     * @param {boolean} triggerOnMove Calls the onMove callbacks on true
     */
    move(delta,triggerOnMove=true) {
        if (!this.grid) {
            this.center = this.center.add(delta)
        }
        else {
            //move on grid
            const pos = this.grid.getElementPosition(this)
            if (delta.x) { //not zero
                pos.x += (delta.x > 0) ? 1 : -1
            }
            if (delta.y) { //not zero
                pos.y += (delta.y > 0) ? 1 : -1
            }
            try {
                this.grid.moveElement(pos.x,pos.y,this)
            } catch (e) {
                //don't move outside range but throw otherwise
                if (!(e instanceof RangeError)) {
                    throw e
                }
            }
        }
        if (triggerOnMove) {
            for (const callback of this.onMove) {
                callback.call(this)
            }
        }
    }

    /**
     * Animates movement of the element to the point
     * @param {Point} point Point to animate to
     * @param {number} steps How many steps in animation. Lower = faster
     */
    animateTo(point, steps=10) {
        if (steps < 1) {
            throw new RangeError("Minimum number of steps is 1!")
        }
        this.animationQueue.push([point,steps])
        if (!this.isAnimating) {
            this.#animateMovement()
        }
    }

    #animateMovement() {
        this.isAnimating = true

        const animation = this.animationQueue.shift()
        const point = animation[0]
        const steps = animation[1]

        const path = point.subtract(this.center)
        const delta = new Point(
            path.x/steps,
            path.y/steps
        )
        const animate = () => {
            this.move(delta)
            if (this.center.distanceTo(point) > 1) {
                window.requestAnimationFrame(animate)
            } else {
                if (this.animationQueue.length > 0) {
                    this.#animateMovement()
                } else {
                    this.isAnimating = false
                }
            }
        }
        animate()
    }

    /**
     * Returns an object of attributes (used for copying)
     * @returns {Object} Attribute object
     */
    getAttrs() {
        return {
            name: this.name,
            level: this.level,
            center: this.center.copy(),
            children: this.children.map((child=>child.copy())),
            clickable: this.clickable,
            draggable: this.draggable,
            pressable: this.pressable,
            stationary: this.stationary,
            shared: this.shared,
            hitboxes: this.hitboxes.map((hb=>hb.copy())),
            hitboxVisible: this.hitboxVisible,
            rotation: this.rotation,
            visible: this.visible
        }
    }

    /**
     * Returns a new copy of this instance without methods
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameElement} Copy of this instance
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameElement(
            attrs.center,
            attrs.children,
            attrs
        )
    }
}

export { GameElement }