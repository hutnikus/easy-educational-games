function Point(x,y) {
    return {
        x: x,
        y: y,
        distanceTo(point2) {
            return Math.sqrt((Math.pow(this.x-point2.x,2))+(Math.pow(this.y-point2.y,2)))
        }
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