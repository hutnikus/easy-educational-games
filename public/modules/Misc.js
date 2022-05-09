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

    /**
     * Checks if point is between 2 values on X axis
     * @param {number} left Lower value
     * @param {number} right Higher value
     * @returns {boolean} Is within values
     */
    xWithin(left,right) {
        if (left > right) {
            throw new Error("Left value has to be lower than right value")
        }
        return left <= this.x && this.x <= right
    }

    /**
     * Checks if point is between 2 values on Y axis
     * @param {number} top Lower value
     * @param {number} bottom Higher value
     * @returns {boolean} Is within values
     */
    yWithin(top,bottom) {
        if (top > bottom) {
            throw new Error("Top value has to be lower than bottom value")
        }
        return top <= this.y && this.y <= bottom
    }

    /**
     * Calculates average position of multiple points
     * @param {Point} points Points to average
     * @returns {Point} Average point
     */
    static average(...points) {
        if (points.length === 0) {
            throw new Error("No points provided")
        }
        let sumX = 0, sumY = 0
        for (const point of points) {
            sumX += point.x
            sumY += point.y
        }
        return new Point(sumX/points.length,sumY/points.length)
    }
}

/**
 * Returns string of random HEX color
 * @returns {string} Random color value
 */
function randomColor() {
    return "#"+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
}

/**
 * Returns string of random light HEX color
 * @returns {string} Random color value
 */
function randomLightColor() {
    const red = Math.floor(Math.random() * 50) + 200
    const green = Math.floor(Math.random() * 50) + 200
    const blue = Math.floor(Math.random() * 50) + 200

    return "#" + red.toString(16) + green.toString(16) + blue.toString(16)
}

/**
 * Returns new instance of array shuffled randomly
 * @param {Array} array
 * @returns {Array} New instance of array
 */
function shuffleArray(array) {
    const a = [...array]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Returns a selection of random elements in array of set length
 * @param {Array} arr
 * @param {number} length
 * @returns {Array}
 */
function randomSelection(arr,length) {
    if (arr.length < length) {
        throw new RangeError(`Incorrect length of selection: array length: ${arr.length}, required length: ${length}!`)
    }
    return shuffleArray(arr).slice(0,length)
}


export { Point, randomColor, shuffleArray, randomSelection, randomLightColor }