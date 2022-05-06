import {GameElement} from "./GameElement.js";
import {GameDrawable} from "../drawables/GameDrawable.js";
import {Game} from "../Game.js";
import {Point} from "../Misc.js";

/**
 * GameComposite class. Its children are elements.
 * Is used to manage multiple elements at once
 * @extends GameElement
 *
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
        this._subtractPosition()
        super.center = newCenter
        this._addPosition()
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
    createText(text, attrs) {
        throw new Error('Incorrect method call in GameComposite "createText"!')
    }
    createShape(type, attrs) {
        throw new Error('Incorrect method call in GameComposite "createShape"!')
    }
    createImage(imageName, attrs) {
        throw new Error('Incorrect method call in GameComposite "createImage"!')
    }
    createGif(gifName, attrs) {
        throw new Error('Incorrect method call in GameComposite "createGif"!')
    }

    /**
     * Sorts elements by level
     */
    sortElements() {
        this.elements = this.elements.sort(((a, b) => a.element.level - b.element.level))
    }

    /**
     * Adds element to composite, silences some of its functions
     * @param {GameElement} element
     */
    addElement(element) {
        if (!(element instanceof GameElement)) {
            throw new Error("Incorrect instance of element added to composite!")
        }
        this.game.removeElement(element)

        this.elements.push({
            element: element,
            clickable: element.clickable,
            draggable: element.draggable,
            pressable: element.pressable
        })

        element.clickable = false
        element.draggable = false
        element.pressable = false

        this.sortElements()
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
        if (!this.elements.map(obj=>obj.element).includes(element)) {
            this.elements
                .map(e => e.element)
                .filter(e => e instanceof GameComposite)
                .forEach(e => e.removeElement(element))
            return
        }

        const el = this.elements.filter(el=>el.element === element)[0]
        this.elements = this.elements.filter(el=>el.element !== element)

        element.clickable = el.clickable
        element.draggable = el.draggable
        element.pressable = el.pressable

        this.game.addElement(element)
    }

    /**
     * @protected
     * Subtracts position of composite from elements
     */
    _subtractPosition() {
        if (this.elements === undefined) {
            return
        }
        for (const element of this.elements.map(e=>e.element)) {
            element.center = element.center.subtract(this.center)
        }
    }

    /**
     * @protected
     * Adds position of composite to elements
     */
    _addPosition() {
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
        this._subtractPosition()
        super.setPosition(x, y);
        this._addPosition()
    }

    /**
     * Draws elements
     */
    draw(ctx) {
        for (const obj of this.elements) {
            const el = obj.element
            el.draw(ctx)
        }
    }

    /**
     * Animates elements
     */
    animate() {
        for (const obj of this.elements) {
            const el = obj.element
            el.animate()
        }
    }

    /**
     * Checks if mouse is inside any of the instance's child
     * @param {Point} mouse Mouse position
     * @returns {boolean} True when inside
     */
    isInside(mouse) {
        for (const element of this.elements.map(e=>e.element)) {
            const inside = element.isInside(mouse)
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

            this.removeElement(element)
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
            if (element instanceof GameComposite) {
                element.rotateElements(origin,angle,keepOrientation)
                continue
            }
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
     * @returns {Object} Attribute object
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
        return new GameComposite([...attrs.elements],attrs)
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
     * @returns {Array<GameElement>} Array of copied elements (that work)
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