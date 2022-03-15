import {GameElement} from "./GameElement.js";
import {GameDrawable} from "../drawables/GameDrawable.js";
import {Game} from "../Game.js";
import {Point} from "../Misc.js";

/**
 * GameComposite class. Its children are elements.
 * Is used to manage multiple elements at once
 * @extends GameElement
 *
 * @property {Object} shared Shared object passed from Game
 * @property {Array<{
 *             element: GameElement,
 *             clickable: boolean,
 *             draggable: boolean,
 *             pressable: boolean
 *         }>} elements Elements instances + their original settings
 */
class GameComposite extends GameElement {

    elements = []

    set center(newCenter) {
        this.subtractPosition()
        super.center = newCenter
        this.addPosition()
    }
    get center() {
        return super.center
    }

    /**
     * GameComposite constructor
     * @param {Array<GameElement>} elements
     * @param {Object} attrs
     */
    constructor(elements,attrs) {
        super(new Point(0,0),[],attrs)

        for (const element of elements) {
            this.addElement(element)
        }

        //get rid of unnecessary things
        // delete this.children
        // delete this.rotation
        // delete this.addHitbox
        // delete this.addChild
        // delete this.getChildByName
        // delete this.popChildByName
    }

    addHitbox(radius,dx,dy) {
        throw new Error('Incorrect method call in GameComposite "addHitbox"!')
    }
    addChild(child, sort = true) {
        throw new Error('Incorrect method call in GameComposite "addChild"!')
    }
    getChildByName(name) {
        throw new Error('Incorrect method call in GameComposite "getChildByName"!')
    }
    popChildByName(name) {
        throw new Error('Incorrect method call in GameComposite "popChildByName"!')
    }


    /**
     * Adds element to composite, silences some of its functions
     * @param {GameElement} element
     */
    addElement(element) {
        if (!(element instanceof GameElement)) {
            throw new Error("Incorrect instance of element added to composite!")
        }
        this.elements.push({
            element: element,
            clickable: element.clickable,
            draggable: element.draggable,
            pressable: element.pressable
        })

        element.clickable = false
        element.draggable = false
        element.pressable = false
    }

    /**
     * Adds multiple elements to composite, some of its functions are turned off
     * @param {GameElement} elements
     */
    addElements(...elements) {
        for (const element of elements) {
            this.addElement(element)
        }
    }

    /**
     * Removes element from composite, returns its functions
     * @param {GameElement} element
     */
    removeElement(element) {
        const el = this.elements.filter(el=>el.element === element)[0]
        this.elements = this.elements.filter(el=>el.element !== element)

        element.clickable = el.clickable
        element.draggable = el.draggable
        element.pressable = el.pressable
    }

    /**
     * Subtracts position of composite from elements
     */
    subtractPosition() {
        if (this.elements === undefined) {
            return
        }
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.subtract(this.center)
        }
    }

    /**
     * Adds position of composite to elements
     */
    addPosition() {
        if (this.elements === undefined) {
            return
        }
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.add(this.center)
        }
    }

    /**
     * Sets position of composite.
     * @param x
     * @param y
     */
    setPosition(x, y) {
        this.subtractPosition()
        super.setPosition(x, y);
        this.addPosition()
    }

    /**
     * Does nothing, skips drawing
     */
    draw(ctx) {
        //skip drawing
    }

    /**
     * Does nothing, skips animation
     */
    animate() {
        //skip animating
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
     * @param {GameElement} other Element with which the collision is checked
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
     * Removes all subElements from composite and returns their functions
     */
    reset() {
        for (const el of this.elements) {
            const element = el.element

            element.clickable = el.clickable
            element.draggable = el.draggable
            element.pressable = el.pressable
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

    /**
     * Returns attribute object with copies of elements
     * @returns {{elements: *[]} & {shared: *, onClick, hitboxVisible: boolean, level: number|number, center: *, clickable: boolean, onKeyPress: {}, rotation: number|number, onDrag, onFinishDragging, draggable: boolean, children: *, stationary: boolean, hitboxes: *, pressable: *, name: *, onKeyHold: {}}}
     */
    getAttrs() {
        const attrs = Object.assign({
            elements: this.#copyOfIntactElements()
        },super.getAttrs())

        delete attrs["hitboxes"]
        delete attrs["hitboxVisible"]
        delete attrs["rotation"]
        delete attrs["children"]

        return attrs
    }

    /**
     * Creates a new copy of composite with all its elements. They aren't added to game.
     * Use game.copyElement() instead
     * @param {string} newName
     * @returns {GameComposite} New instance
     */
    copy(newName) {
        const attrs = this.getAttrs()
        const newInstance = new GameComposite([...attrs.elements],attrs)
        return newInstance
    }

    /**
     * Adds all elements to game
     * @param {Game} game
     */
    addToGame(game) {
        const elements = this.elements.map(el=>el.element)
        game.addElements(...elements)
    }

    /**
     * Returns array of copies of elements in composite
     * @returns {*[]} Array of copied elements (that work)
     */
    #copyOfIntactElements() {
        const arr = []
        for (const el of this.elements) {
            const element = el.element

            element.clickable = el.clickable
            element.draggable = el.draggable
            element.pressable = el.pressable

            arr.push(element.copy())

            element.clickable = false
            element.draggable = false
            element.pressable = false
        }
        return arr
    }

}

export {GameComposite}