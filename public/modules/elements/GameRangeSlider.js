import {GameElement} from "./GameElement.js";
import {Point, randomColor} from "../Misc.js";

/**
 * Range slider class
 * @extends GameElement
 *
 * @property {number} width Width of slider in pixels
 * @property {string} color Color of the whole slider
 * @property {Array<function>} onChange Events to be trigerred on change of slider value
 * @property {GameShape} scaleElement Line that represents slider scale
 * @property {GameShape} handleElement Rectangle that represents slider handle
 * @property {{min:number, max:number}} bounds Maximum value of slider
 */
class GameRangeSlider extends GameElement{
    #width = undefined
    set width(newWidth) {
        if (isNaN(newWidth)) {
            throw new TypeError("Width value has to be a number!")
        }
        if (newWidth <= 0) {
            throw new Error("Width has to be larger than 0!")
        }
        let percent = 50
        if (this.scaleElement && this.handleElement) {
            percent = this.getPercentValue()
            this.scaleElement.setLine(new Point(-newWidth/2,0),new Point(newWidth/2,0))
        }
        this.#width = newWidth
        if (this.scaleElement && this.handleElement) {
            const value = (percent * (this.max - this.min)) + this.min
            this.setValue(value,false)
        }
    }
    get width() {
        return this.#width
    }
    #color = undefined
    set color(newColor){
        if (newColor === "random") {
            this.#color = randomColor()
        } else {
            this.#color = newColor
        }
        if (this.scaleElement && this.handleElement) {
            this.scaleElement.stroke = this.#color
            this.handleElement.fill = this.#color
        }
    }
    get color() {
        return this.#color
    }
    #onChange = []
    get onChange() {return [...this.#onChange]}

    #bounds = {
        min: 0,
        max: 10
    }
    get max() {return this.bounds.max}
    get min() {return this.bounds.min}
    get bounds() {
        return {
            min: this.#bounds.min,
            max: this.#bounds.max
        }
    }


    constructor(center,attrs={}) {
        super(center,[],attrs);
        this.width = attrs.width || 100
        this.#onChange = attrs.onChange || []
        this.color = attrs.color || "red"

        this.floating = (attrs.floating === undefined) ? false : attrs.floating
        this.setBounds(
            attrs.min || 0,
            attrs.max || 10
        )

        this.scaleElement = this.createShape("line", {coords:[-this.width/2,0,this.width/2,0],level:-2, stroke:this.color})
        this.handleElement = this.createShape("rectangle",{width:10,height:20,level:-1,fill:this.color})

        this.draggable = true
        this.stationary = true

        function dragHandle(event) {
            const delta = this.shared.mousePos
                .rotateAround(this.center,-this.rotation)
                .subtract(this.center)
            const dx = Math.min(Math.max(-this.width/2,delta.x),this.width/2)
            const percent = Number.parseFloat(((dx + (this.width/2)) / this.width).toFixed(3))

            const value = (percent * (this.max - this.min)) + this.min

            this.setValue(value)
        }

        this.addOnDragListener(dragHandle)
    }

    /**
     * Returns percent value of the slider based on handle position
     * @returns {number}
     */
    getPercentValue() {
        return (this.handleElement.dx + (this.width/2)) / this.width
    }

    /**
     * Sets minimum and maximum bounds for slider
     * @param {number} min
     * @param {number} max
     */
    setBounds(min=0, max=10) {
        if (Number.isNaN(min) || Number.isNaN(max)) {
            throw new TypeError("Incorrect type for method setBounds()!")
        }
        if (min >= max) {
            throw new RangeError("Min value has to be larger than max value!")
        }
        this.#bounds.min = min
        this.#bounds.max = max
    }

    /**
     * Returns value of slider
     * @returns {number}
     */
    getValue() {
        const percent = this.getPercentValue()
        const value = (percent * (this.max - this.min)) + this.min

        if (this.floating) {
            return Number.parseFloat((value).toFixed(3))
        }
        return Math.round(value)
    }

    /**
     * Sets value of slider and updates position of the handle
     * @param {number} value Value to be set
     * @param {boolean} change False prevents triggering onChange events
     */
    setValue(value,change=true) {
        if (value < this.min || value > this.max) {
            throw new RangeError(`Value has to be between ${this.min} and ${this.max}!`)
        }

        if (!this.floating) {
            value = Math.round(value)
        }

        const percent = (value - this.min) / (this.max - this.min)

        this.handleElement.dx = (percent * this.width) - this.width/2

        if (change) {
            for (const callback of this.#onChange) {
                callback.call(this)
            }
        }
    }

    /**
     * Adds a listener to the array of listeners for OnChange
     * @param {function} callback function to be called
     */
    addOnChangeListener(callback) {
        this.#onChange.push(callback)
    }

    /**
     * Removes listener for the OnChange event
     * @param {function} callback function you want to remove
     */
    removeOnChangeListener(callback) {
        this.#onChange = this.#onChange.filter(item=>item!==callback)
    }

    getAttrs() {
        return Object.assign({
            width: this.width,
            color: this.color,
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameRangeSlider} New instance with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameRangeSlider(attrs.center,attrs)
    }
}

export {GameRangeSlider}