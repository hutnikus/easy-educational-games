/**
 * Point class. Represents a point defined by its X and Y coordinates.
 * @property {number} x X coordinate
 * @property {number} y Y coordinate
 */
class Point {
    #xValue = undefined
    set x(newX) {
        if (isNaN(newX)) {
            throw new Error("X value in Point is not a number!")
        }
        this.#xValue = newX
    }
    get x() {
        return this.#xValue
    }
    #yValue = undefined
    set y(newY) {
        if (isNaN(newY)) {
            throw new Error("Y value in Point is not a number!")
        }
        this.#yValue = newY
    }
    get y() {
        return this.#yValue
    }

    constructor(x,y) {
        this.x = x
        this.y = y
    }

    /**
     * Returns distance between the two points
     * @param {Point} other 2nd Point
     * @returns {number} Distance between the points
     */
    distanceTo(other) {
        return Math.sqrt((Math.pow(this.x-other.x,2))+(Math.pow(this.y-other.y,2)))
    }

    /**
     * Returns new point resulting from addition of this and other point.
     * @param {Point} other Other point
     * @returns {Point} Resulting Point from addition
     */
    add(other) {
        return new Point(
            this.x + other.x,
            this.y + other.y
        )
    }
    /**
     * Returns new point resulting from subtraction of this and other point.
     * @param {Point} other Other point
     * @returns {Point} Resulting Point from subtraction
     */
    subtract(other) {
        return new Point(
            this.x - other.x,
            this.y - other.y
        )
    }

    /**
     * Returns a copy of this instance
     * @returns {Point} New instance of Point
     */
    copy() {
        return new Point(this.x,this.y)
    }

    /**
     * Returns coordinates in string format
     * @returns {string} Coordinates of the point
     */
    asString() {
        return 'X: ' + this.x + ', Y: ' + this.y
    }

    /**
     * Returns coordinates in array format
     * @returns {Array<number>} Array in format [x,y]
     */
    asArray() {
        return [this.x,this.y]
    }

    /**
     * Returns new Point resulting from rotating this point around a point of origin by angle
     * @param {Point} origin Origin point (around which is this one rotated)
     * @param {number} angle Angle in radians
     * @returns {Point} New instance of Point resulting from the rotation
     */
    rotateAround(origin,angle) {
        const rx = origin.x + Math.cos(angle) * (this.x - origin.x) - Math.sin(angle) * (this.y - origin.y)
        const ry = origin.y + Math.sin(angle) * (this.x - origin.x) + Math.cos(angle) * (this.y - origin.y)

        return new Point(rx,ry)
    }
}

/**
 * Returns string of random HEX color
 * @returns {string} Random color value
 */
function randomColor() {
    return "#"+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
}

export { Point, randomColor }