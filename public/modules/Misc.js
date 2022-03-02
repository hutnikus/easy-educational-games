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

    distanceTo(point2) {
        return Math.sqrt((Math.pow(this.x-point2.x,2))+(Math.pow(this.y-point2.y,2)))
    }
    add(other) {
        return new Point(
            this.x + other.x,
            this.y + other.y
        )
    }
    subtract(other) {
        return new Point(
            this.x - other.x,
            this.y - other.y
        )
    }
    copy() {
        return new Point(this.x,this.y)
    }
    asString() {
        return 'X: ' + this.x + ', Y: ' + this.y
    }
    asArray() {
        return [this.x,this.y]
    }
    rotateAround(origin,angle) {
        const rx = origin.x + Math.cos(angle) * (this.x - origin.x) - Math.sin(angle) * (this.y - origin.y)
        const ry = origin.y + Math.sin(angle) * (this.x - origin.x) + Math.cos(angle) * (this.y - origin.y)

        return new Point(rx,ry)
    }
}

function Pixel(r,g,b,a) {
    return {
        r:r,
        g:g,
        b:b,
        a:a,
        isBlank() {
            return a === 0
        }
    }
}

// module.exports = {
//     Point,
//     Pixel
// }

export { Point, Pixel }