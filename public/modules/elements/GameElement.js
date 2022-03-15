import {Point} from "../Misc.js";
import {GameDrawable} from "../drawables/GameDrawable.js";
import {GameHitbox} from "../GameHitbox.js";
import {GameGif} from "../drawables/GameGif.js";
import {GameComposite} from "./GameComposite.js";
import {Game} from "../Game.js";

/**
 * GameElement class. Handles shared actions and properties of game elements
 *
 * @property {string} name Name of the element. Undefined or unique
 * @property {number} level Level of the element in relation to its siblings
 * @property {Point} center Center of the element. Absolute value
 * @property {Array<GameDrawable>} children Array of drawables linked to the element
 * @property {boolean} clickable Element will respond to click
 * @property {boolean} draggable Element will respond to holding
 * @property {boolean} stationary Element will respond to holding, but won't change its position
 * @property {Array<function>} onClick Array of callbacks called on click
 * @property {Array<function>} onDrag Array of callbacks called on dragging/holding
 * @property {Array<function>} onFinishDragging Array of callbacks called when finished dragging/holding
 * @property {Object} onKeyPress Map of (keyboard) keys mapped to an array of callbacks called on key press
 * @property {Object} onKeyHold Map of (keyboard) keys mapped to an array of callbacks called on key hold
 * @property {Array<function>} onMove Array of callbacks called on move
 * @property {Object} shared Shared object passed from Game
 * @property {Array<GameHitbox>} hitboxes Array of hitboxes linked to the element
 * @property {boolean} hitboxVisible Hitboxes are drawn on true, else are hidden
 * @property {number} rotation Rotation of element in radians
 */
class GameElement {
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
     * Constructor of the GameElement class
     * @param {Point} center Absolute position of the element
     * @param {Array<GameDrawable>} children Array of drawables
     * @param {Object} attrs Attribute object
     */
    constructor(center,children,attrs={}) {
        this.#name = attrs.name;
        this.center = center;
        this.children = []
        this.onClick = (attrs.onClick === undefined) ? [] : attrs.onClick
        this.onDrag = (attrs.onDrag === undefined) ? [] : attrs.onDrag
        this.onFinishDragging = (attrs.onFinishDragging === undefined) ? [] : attrs.onFinishDragging
        this.onKeyPress = (attrs.onKeyPress === undefined) ? {} : attrs.onKeyPress
        this.onKeyHold = (attrs.onKeyHold === undefined) ? {} : attrs.onKeyHold
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
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);

        this.rotation = (attrs.rotation === undefined) ? 0 : Number(attrs.rotation);
    }

    setPosition(x,y) {
        if (!Number.isNaN(x)) {
            this.center.x = x
        }
        if (!Number.isNaN(y)) {
            this.center.y = y
        }
    }

    addHitbox(radius,dx,dy) {
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
            this.children = this.children.sort(((a, b) => a.level - b.level))
        }
    }

    /**
     * Returns child drawable with input name or throws an error
     * @param {string} name Searched name
     * @returns {GameDrawable} Found child drawable
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
     * @returns {GameElement} Removed element
     */
    popChildByName(name) {
        const el = this.getChildByName(name)
        this.children = this.children.filter(e => e.name !== name)
        return el[0]
    }

    /**
     * Transforms the canvas context and calls draw function of every visible child
     * @param {CanvasRenderingContext2D} ctx Rendering context of the canvas
     * @returns {Promise<void>}
     */
    async draw(ctx) {
        //wait for loading all images
        for (const e of this.children) {
            e.img = await e.img
            e.imgData = await e.imgData
        }

        ctx.save()
        //set center and rotation
        ctx.setTransform(1,0,0,1,this.center.x,this.center.y);
        ctx.rotate(this.rotation)

        for (const drawable of this.children) {
            if (drawable.visible) {
                await drawable.draw(ctx, this.center);
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
     * @returns {Promise<void>}
     */
    async animate() {
        this.children
            .filter(obj => obj instanceof GameGif)
            .forEach(obj=>obj.updateAnimation())
    }

    /**
     * Checks if mouse is inside any of the instance's child
     * @param {Point} mouse Mouse position
     * @returns {Promise<boolean>} True when inside
     */
    async isInside(mouse) {
        this.shared.tempContext.setTransform(1,0,0,1,this.center.x,this.center.y);
        this.shared.tempContext.rotate(this.rotation)

        for (const child of this.children) {
            this.shared.tempContext.save()
            const insideChild = await child.isInside(mouse, this.shared.tempContext, this.center)
            this.shared.tempContext.restore()
            // console.log('inside child',insideChild, child)
            if (insideChild) {
                // console.error("was inside", child)
                return true;
            }
        }
        return false;
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
     * Returns true on collision with the other element
     * @param {GameElement|GameComposite} other Element with which the collision is checked
     * @returns {boolean} True on colision else false
     */
    collidesWith(other) {
        if (this.hitboxes.length === 0) {
            return false
        }
        if (other.hitboxes.length === 0) {
            return false
        }
        for (const hb1 of this.hitboxes) {
            const pos1 = this.center.add(hb1.delta).rotateAround(this.center,this.rotation)
            for (const hb2 of other.hitboxes) {
                const pos2 = other.center.add(hb2.delta).rotateAround(other.center,other.rotation)

                const distance = pos1.distanceTo(pos2)
                if (distance < hb1.r + hb2.r) {
                    return true
                }
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
            stationary: this.stationary,
            onClick: [...this.onClick],
            onDrag: [...this.onDrag],
            onFinishDragging: [...this.onFinishDragging],
            onKeyPress: copyKeyObject(this.onKeyPress),
            onKeyHold: copyKeyObject(this.onKeyHold),
            shared: this.shared,
            hitboxes: this.hitboxes.map((hb=>hb.copy())),
            hitboxVisible: this.hitboxVisible,
            rotation: this.rotation
        }
    }

    /**
     * Returns a new copy of this instance (with unlinked children)
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

function copyKeyObject(obj) {
    const retObj = {}
    for (const key of Object.keys(obj)) {
        retObj[key] = [...obj[key]]
    }
    return retObj
}

// module.exports = GameElement

export { GameElement }