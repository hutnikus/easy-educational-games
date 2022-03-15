import {GameElement} from "./GameElement.js";
import {GameDrawable} from "../drawables/GameDrawable.js";
import {Game} from "../Game.js";
import {Point} from "../Misc.js";

/**
 * GameComposite class. Its children are elements.
 * Is used to manage multiple elements at once
 *
 * @property {Object} shared Shared object passed from Game
 * todo events
 */
class GameComposite {
    #centerValue = new Point(0,0)
    set center(newCenter) {
        this.subtractPosition()
        this.#centerValue = newCenter
        this.addPosition()
    }
    get center() {
        return this.#centerValue
    }
    elements = []
    #name = undefined
    get name() {
        return this.#name
    }
    set name(newName) {
        throw new Error("Use function setName() when setting names for elements!")
    }

    /**
     * Checks if name is unique within the context and sets it
     * @param {Game} game Game instance
     * @param {string} newName New name
     */
    setName(game,newName) {
        if (!(game instanceof Game)) {
            throw new Error("Incorrect instance of Game!")
        }
        const gameHasName = game.elements.filter(el=>el.name===newName).length > 0
        if (gameHasName) {
            throw new Error(`Name "${newName}" is not unique!`)
        }
        this.#name = newName
    }

    /**
     * @link GameElement constructor
     * @param {Array<GameElement|GameComposite>} elements
     * @param {Object} attrs
     */
    constructor(elements,attrs) {
        for (const element of elements) {
            this.addElement(element)
        }

        this.#name = attrs.name;

        this.onClick = (attrs.onClick === undefined) ? [] : attrs.onClick
        this.onDrag = (attrs.onDrag === undefined) ? [] : attrs.onDrag
        this.onFinishDragging = (attrs.onFinishDragging === undefined) ? [] : attrs.onFinishDragging
        this.onKeyPress = (attrs.onKeyPress === undefined) ? {} : attrs.onKeyPress
        this.onKeyHold = (attrs.onKeyHold === undefined) ? {} : attrs.onKeyHold
        this.onMove = (attrs.onMove === undefined) ? [] : attrs.onMove

        this.clickable = (attrs.clickable === undefined) ? false : attrs.clickable;
        this.draggable = (attrs.draggable === undefined) ? false : attrs.draggable;
        this.stationary = (attrs.stationary === undefined) ? false : attrs.stationary;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
    }

    /**
     * Adds element to composite, silences some of its functions
     * @param {GameElement|GameComposite} element
     */
    addElement(element) {
        this.elements.push({
            element: element,
            click:element.click,
            drag:element.drag,
            finishDragging:element.finishDragging,
            keyPress:element.keyPress,
            keyHold:element.keyHold,
        })

        element.click = ()=>{}
        element.drag = ()=>{}
        element.finishDragging = ()=>{}
        element.keyPress = ()=>{}
        element.keyHold = ()=>{}
    }

    /**
     * Removes element from composite, returns its functions
     * @param {GameElement|GameComposite} element
     */
    removeElement(element) {
        const el = this.elements.filter(el=>el.element === element)[0]
        this.elements = this.elements.filter(el=>el.element !== element)

        element.click = el.click
        element.drag = el.drag
        element.finishDragging = el.finishDragging
        element.keyPress = el.keyPress
        element.keyHold = el.keyHold
    }

    /**
     * Subtracts position of composite from elements
     */
    subtractPosition() {
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.subtract(this.center)
        }
    }

    /**
     * Adds position of composite to elements
     */
    addPosition() {
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.add(this.center)
        }
    }

    /**
     * Does nothing, skips drawing
     */
    draw() {
        //skip drawing
    }

    /**
     * Does nothing, skips animation
     */
    animate() {
        //skip animating
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
        }
    }


    /**
     * Adds a listener to the array of listeners for onKeyHold
     * @param {string} key Key the callback will be called for
     * @param {function} callback function to be called
     */
    addOnKeyHoldListener(key,callback) {
        if (!Array.isArray(this.onKeyHold[key])) {
            this.onKeyHold[key] = []
        }
        this.onKeyHold[key].push(callback)
    }

    /**
     * Removes listener for the onKeyHold event
     * @param {string} key Key from which the listener is removed from
     * @param {function} callback function you want to remove
     */
    removeOnKeyHoldListener(key,callback) {
        if (this.onKeyHold[key] !== undefined) {
            this.onKeyHold[key] = this.onKeyHold[key].filter(item=>item!==callback)
        }
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
     * Calls the functions in the onClick array
     * @param {Object} event Event passed from listener
     */
    click(event) {
        for (const callback of this.onClick) {
            // callback(event)
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
            this.center = new Point(
                mousePos.x - delta.x,
                mousePos.y - delta.y
            )
            for (const callback of this.onMove) {
                callback.call(this,event)
                // callback(event)
            }
        }
        for (const callback of this.onDrag) {
            callback.call(this,event)
            // callback(event)
        }
    }

    /**
     * Calls the functions in the onFinishDragging array
     */
    finishDragging(event) {
        for (const callback of this.onFinishDragging) {
            callback.call(this,event)
            // callback(event)
        }
    }

    /**
     * Calls the functions in the onKeyPress object that are assigned to the passed keys
     * @param {Array<string>} keyArray Array of currently pressed keys
     * @param {Event} event
     */
    keyPress(keyArray,event) {
        for (const key of keyArray) {
            const events = this.onKeyPress[key]
            if (events !== undefined && events.length !== 0) {
                for (const callback of events) {
                    callback.call(this,event)
                    // callback(event)
                }
            }
        }
    }

    /**
     * Calls the functions in the onKeyHold object that are assigned to the passed keys
     * @param {Array<string>} keyArray Array of currently pressed keys
     */
    keyHold(keyArray) {
        for (const key of keyArray) {
            const events = this.onKeyHold[key]
            if (events !== undefined && events.length !== 0) {
                for (const callback of events) {
                    // callback()
                    callback.call(this)
                }
            }
        }
    }

    /**
     * Checks if mouse is inside any of the instance's child
     * @param {Point} mouse Mouse position
     * @returns {Promise<boolean>} True when inside
     */
    async isInside(mouse) {
        for (const element of this.elements.map(e=>e.element)) {
            const inside = await element.isInside(mouse)
            // console.log(inside)
            if (inside) {
                return true
            }
        }
        return false
    }

    /**
     * Returns true on collision with the other element
     * @param {GameElement|GameComposite} other Element with which the collision is checked
     * @returns {boolean} True on colision else false
     */
    collidesWith(other) {
        for (const element of this.elements.map(e=>e.element)) {
            if (element.collidesWith(other)) {
                return true
            }
        }
        return false
    }

    /**
     * Moves the element by vector delta and calls onMove callbacks
     * @param {Point} delta Vector by which the element is moved
     */
    move(delta) {
        this.center = this.center.add(delta)

        for (const callback of this.onMove) {
            callback.call(this)
            // callback()
        }
    }

    /**
     * Removes all subElements from composite and returns their functions
     */
    reset() {
        for (const el of this.elements) {
            const element = el.element

            element.click = el.click
            element.drag = el.drag
            element.finishDragging = el.finishDragging
            element.keyPress = el.keyPress
            element.keyHold = el.keyHold
        }
        this.elements = []
        this.onClick = []
        this.onDrag = []
        this.onFinishDragging = []
        this.onKeyPress = []
        this.onKeyHold = []
    }

    /**
     * Rotates elements around a point
     * @param {Point} origin Point around which elements are rotated
     * @param {number} angle Angle in radians
     * @param {boolean} keepOrientation Elements don't change their rotation value on true
     */
    rotateElements(origin,angle,keepOrientation=false) {
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.rotateAround(origin,angle)
            if (!keepOrientation) {
                element.rotation += angle
            }
        }
    }

    /**
     * Returns true when it has elements
     * @returns {boolean} value
     */
    hasElements() {
        return this.elements.length > 0
    }

}

export {GameComposite}