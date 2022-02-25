function Point(x,y) {
    return {
        x: x,
        y: y,
        distanceTo(point2) {
            return Math.sqrt((Math.pow(this.x-point2.x,2))+(Math.pow(this.y-point2.y,2)))
        },
        add(other) {
            this.x += other.x
            this.y += other.y
            return this
        },
        subtract(other) {
            this.x -= other.x
            this.y -= other.y
            return this
        },
        copy() {
            return new Point(this.x,this.y)
        },
        asString() {
            return 'X: ' + this.x + ', Y: ' + this.y
        },
        asArray() {
            return [this.x,this.y]
        },
        rotateAround(origin,angle) {
            const rx = origin.x + Math.cos(angle) * (this.x - origin.x) - Math.sin(angle) * (this.y - origin.y)
            const ry = origin.y + Math.sin(angle) * (this.x - origin.x) + Math.cos(angle) * (this.y - origin.y)

            this.x = rx
            this.y = ry

            return this
        },
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