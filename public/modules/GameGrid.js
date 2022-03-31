import {Point} from "./Misc.js";
import {loadImage} from "./drawables/GameDrawable.js";

class EmptyError extends Error {

}
class FullError extends Error {

}

/**
 * Class GameGrid.
 * Elements can snap to rows|columns
 *
 * @property {Array<Array<GameElement>>} elements 2D array[col][row] of elements which belong to the grid
 * @property {Point} position Position of grid
 * @property {number} width Width of grid in pixels
 * @property {number} height Height of grid in pixels
 * @property {number} columns Number of columns (X axis)
 * @property {number} rows Number of rows (Y axis)
 * @property {Image} img Grid image
 */
class GameGrid {
    EmptyError = EmptyError
    FullError = FullError


    elements = []
    img = undefined
    #position
    #width
    #height
    #columns
    #rows

    /**
     * Creates grid image
     * @param {CanvasRenderingContext2D} ctx Context
     */
    createImg(ctx) {
        const left = this.position.x
        const right = this.position.x + this.width
        const top = this.position.y
        const bottom = this.position.y + this.height
        const hStep = this.columnWidth()
        const vStep = this.rowHeight()

        ctx.beginPath()

        //top to bottom
        for (let x = left; x <= right; x+=hStep) {
            ctx.moveTo(x,top)
            ctx.lineTo(x,bottom)
        }
        //left to right
        for (let y = top; y <= bottom; y+=vStep) {
            ctx.moveTo(left,y)
            ctx.lineTo(right,y)
        }
        ctx.stroke()

        const dataURL = ctx.canvas.toDataURL()
        this.img = new Image()
        this.img.src = dataURL
    }

    set position(newPos) {
        if (!(newPos instanceof Point)) {
            throw new TypeError("Incorrect instance for position setter. Must be Point!")
        }
        this.#position = newPos
        this.img = undefined
    }
    get position() {
        return this.#position
    }
    set width(newWidth) {
        if (isNaN(newWidth)) {
            throw new TypeError("Entered width value is not a number!")
        }
        if (newWidth <= 0) {
            throw new RangeError(`Trying to set width to ${newWidth}`)
        }
        this.#width = newWidth
        this.img = undefined
    }
    get width() {
        return this.#width
    }
    set height(newHeight) {
        if (isNaN(newHeight)) {
            throw new TypeError("Entered height value is not a number!")
        }
        if (newHeight <= 0) {
            throw new RangeError(`Trying to set height to ${newHeight}`)
        }
        this.#height = newHeight
        this.img = undefined
    }
    get height() {
        return this.#height
    }
    set columns(newCols) {
        if (isNaN(newCols)) {
            throw new TypeError("Entered columns value is not a number!")
        }
        if (newCols <= 0) {
            throw new RangeError(`Trying to set number of columns to ${newCols}`)
        }
        this.#columns = newCols
        this.img = undefined
    }
    get columns() {
        return this.#columns
    }
    set rows(newRows) {
        if (isNaN(newRows)) {
            throw new TypeError("Entered rows value is not a number!")
        }
        if (newRows <= 0) {
            throw new RangeError(`Trying to set number of rows to ${newRows}`)
        }
        this.#rows = newRows
        this.img = undefined
    }
    get rows() {
        return this.#rows
    }

    #checkColRowRange(col,row) {
        if (col < 0 || col >= this.columns) {
            throw new RangeError(`Column value (${col}) out of range!`)
        }
        if (row < 0 || row >= this.rows) {
            throw new RangeError(`Row value (${row}) out of range!`)
        }
    }


    constructor(position,width,height,cols,rows) {
        this.position = position || new Point(0,0)
        this.width = width || 200
        this.height = height || 200
        this.columns = cols || 10
        this.rows = rows || 10

        this.elements = new Array(this.columns)
        for (let i = 0; i < this.columns; i++) {
            this.elements[i] = new Array(this.rows).fill(undefined)
        }
    }

    /**
     * Sets absolute position of top left corner in pixels
     * @param {number} x Position
     * @param {number} y Position
     */
    setPosition(x,y) {
        this.position.x = x
        this.position.y = y

        this.img = undefined
    }

    /**
     * Adds element to grid
     * @param {number} col Starts at 0
     * @param {number} row Starts at 0
     * @param {GameElement} element Element to add to grid
     */
    addElement(col,row,element) {
        this.#checkColRowRange(col,row)
        try {
            const pos = this.getElementPosition(element)
            throw new FullError(`Element already in grid at position ${pos.asString()}!`)
        } catch (e) {
            if (e instanceof RangeError) {
                //all g
            } else {
                throw e
            }
        }
        if (this.getElementAtPos(col,row)) {
            throw new FullError(`Position [${col},${row}] is occupied by ${this.getElementAtPos(col,row)}!`)
        }
        this.elements[col][row] = element
        element.center = this.getBoxCenter(col,row)
        element.grid = this
    }

    /**
     * Removes element at position from grid and returns it
     * @param {number} col
     * @param {number} row
     * @returns {GameElement}
     */
    removeElementAtPosition(col, row) {
        this.#checkColRowRange(col,row)
        if (!this.getElementAtPos(col,row)) {
            throw new EmptyError(`Position [${col},${row}] is empty!`)
        }
        const element = this.elements[col][row]
        this.elements[col][row] = undefined
        element.grid = undefined
        return element
    }

    /**
     * Removes an element and returns it
     * @param {GameElement} element
     * @returns {GameElement}
     */
    removeElement(element) {
        const pos = this.getElementPosition(element)
        return this.removeElementAtPosition(pos.x,pos.y)
    }

    /**
     * Removes multiple elements
     * @param {GameElement} elements
     */
    removeElements(...elements) {
        for (let col = 0; col < this.columns; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (elements.includes(this.elements[col][row])) {
                    this.removeElementAtPosition(col,row)
                }
            }
        }
    }

    /**
     * Moves element from current position to target position
     * @param {number} targetCol Position
     * @param {number} targetRow Position
     * @param {GameElement} element
     */
    moveElement(targetCol,targetRow,element) {
        this.#checkColRowRange(targetCol,targetRow)
        if (this.elements[targetCol][targetRow]) {
            throw new FullError(`Position (${targetRow},${targetCol}) is occupied!`)
        }
        const currentPos = this.getElementPosition(element)
        this.elements[currentPos.x][currentPos.y] = undefined
        this.elements[targetCol][targetRow] = element
        element.center = this.getBoxCenter(targetCol,targetRow)
    }

    /**
     * Returns element at grid position
     * @param {number} col Starts at 0
     * @param {number} row Starts at 0
     * @returns {GameElement} Element at position
     */
    getElementAtPos(col,row) {
        this.#checkColRowRange(col,row)
        return this.elements[col][row]
    }

    /**
     * Returns absolute position of box center
     * @param col Starts at 0
     * @param row Starts at 0
     * @returns {Point} Center of box at (col,row)
     */
    getBoxCenter(col,row) {
        this.#checkColRowRange(col,row)
        return new Point(
            this.position.x + col * this.columnWidth() + this.columnWidth()/2,
            this.position.y + row * this.rowHeight() + this.rowHeight()/2,
        )
    }

    /**
     * Returns column and row value as Point
     * @param {number} x In pixels
     * @param {number} y In pixels
     * @returns {Point} (Col,Row)
     */
    getPosFromPixels(x,y) {
        if (!this.isInside(new Point(x,y))) {
            throw new RangeError("Not inside grid!")
        }
        const col = Math.floor((x - this.position.x) / this.columnWidth())
        const row = Math.floor((y - this.position.y) / this.rowHeight())
        return new Point(col,row)
    }

    /**
     * Returns the element at (absolute pixel) position
     * @param {number} x In pixels
     * @param {number} y In pixels
     * @returns {GameElement} Element
     */
    getElementAtPixels(x,y) {
        const pos = this.getPosFromPixels(x,y)
        return this.getElementAtPos(pos.x,pos.y)
    }

    /**
     * Returns (col,row) value of element or throws an error
     * @param {GameElement} element Element to find position of
     * @returns {Point} (Col,Row)
     */
    getElementPosition(element) {
        for (let col = 0; col < this.columns; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (this.elements[col][row] === element) {
                    return new Point(col,row)
                }
            }
        }
        throw new RangeError("Element not in grid!")
    }

    /**
     * Snaps element to its position
     * @param element
     */
    snapElement(element) {
        const pos = this.getElementPosition(element)
        element.center = this.getBoxCenter(pos.x,pos.y)
    }

    /**
     * Width of grid column
     * @returns {number} Width
     */
    columnWidth() {
        return this.width/this.columns
    }
    /**
     * Height of grid row
     * @returns {number} Height
     */
    rowHeight() {
        return this.height/this.rows
    }

    /**
     * Draws generated image or generates a new one and draws
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.img === undefined) {
            this.createImg(ctx)
        }

        ctx.drawImage(this.img,0,0)
    }

    isInside(position) {
        return (this.position.x <= position.x && position.x <= this.position.x + this.width ) &&
            (this.position.y <= position.y && position.y <= this.position.y + this.height)
    }

    /**
     * Randomly finds a free position on grid
     * @returns {Point}
     */
    randomFreePosition() {
        const col = Math.floor(Math.random() * this.columns)
        const row = Math.floor(Math.random() * this.rows)
        if (!this.getElementAtPos(col,row)) {
            return new Point(col,row)
        }
        for (const column of this.elements) {
            if (column.includes(undefined)) {
                return this.randomFreePosition()
            }
        }
        throw new FullError("Grid appears to be full!")
    }

    /**
     * Moves or adds element to a position on this grid
     * @param {number} col
     * @param {number} row
     * @param {GameElement} element
     */
    placeElement(col,row,element) {
        if (element.grid === this) {
            this.moveElement(col,row,element)
            return
        }
        if (element.grid) {
            element.grid.removeElement(element)
        }
        this.addElement(col,row,element)
    }


}

export {GameGrid}