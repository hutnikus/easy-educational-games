import {GameElement} from "./GameElement.js";
import {Point, randomColor} from "../Misc.js";

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
        if (this.scale && this.handle) {
            percent = this.getValue()
            this.scale.setLine(new Point(-newWidth/2,0),new Point(newWidth/2,0))
        }
        this.#width = newWidth
        if (this.scale && this.handle) {
            this.setValue(percent,false)
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
        if (this.scale && this.handle) {
            this.scale.stroke = this.#color
            this.handle.fill = this.#color
        }
    }
    get color() {
        return this.#color
    }

    constructor(center,attrs={}) {
        super(center,[],attrs);
        this.width = attrs.width || 100
        this.onChange = attrs.onChange || []
        this.color = attrs.color || "red"

        this.scale = this.createShape("line", {coords:[-this.width/2,0,this.width/2,0],level:-2, stroke:this.color})
        this.handle = this.createShape("rectangle",{width:10,height:20,level:-1,fill:this.color})

        this.draggable = true
        this.stationary = true

        function dragHandle(event) {
            const delta = this.shared.mousePos
                .rotateAround(this.center,-this.rotation)
                .subtract(this.center)
            const dx = Math.min(Math.max(-this.width/2,delta.x),this.width/2)
            const percent = Number.parseFloat(((dx + (this.width/2)) / this.width).toFixed(2))

            this.setValue(percent)
        }

        this.addOnDragListener(dragHandle)
    }

    /**
     * Returns % value of slider state
     * @returns {number}
     */
    getValue() {
        return Number.parseFloat(((this.handle.dx + (this.width/2)) / this.width).toFixed(2))
    }

    setValue(value,change=true) {
        if (value < 0 || value > 1) {
            throw new RangeError("Value has to be between 0 and 1!")
        }

        this.handle.dx = (value * this.width) - this.width/2

        for (const callback of this.onChange) {
            callback.call(this,event)
        }
    }

    /**
     * Adds a listener to the array of listeners for OnChange
     * @param {function} callback function to be called
     */
    addOnChangeListener(callback) {
        this.onChange.push(callback)
    }

    /**
     * Removes listener for the OnChange event
     * @param {function} callback function you want to remove
     */
    removeOnChangeListener(callback) {
        this.onChange = this.onChange.filter(item=>item!==callback)
    }

    //todo copy
}

export {GameRangeSlider}