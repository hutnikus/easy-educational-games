class GameElement {
    //relative to parent game object
    level = undefined

    //centered coordinates
    x = undefined;
    y = undefined;

    //everything drawable
    children = []

    clickable = undefined

    constructor(x,y,children,attrs={}) {
        this.x = x;
        this.y = y;
        for (const child of children) {
            this.addChild(child)
        }

        this.clickable = (attrs.clickable === undefined) ? false : attrs.clickable;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
    }

    addChild(child) {
        const nameIsUsed = this.children.filter(c => c.name === child.name && child.name !== undefined).length > 0
        if (nameIsUsed) {
            throw `used name "${child.name}"`;
        }
        this.children.push(child)
    }

    getChildByName(name) {
        let child = this.children.filter(child => child.name === name)
        if (child.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (child.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        return child[0]
    }

    //draws every child
    async draw(ctx) {
        //wait for loading all images
        for (const e of this.children) {
            e.img = await e.img
        }
        //wait for loading all gif data
        for (const e of this.children) {
            e.imgData = await e.imgData
        }

        this.children = this.children.sort(((a, b) => a.level - b.level))

        this.children
            .forEach(obj=>obj.draw(ctx,this.x,this.y))
    }

    async animate() {
        this.children
            .filter(obj => obj.updateAnimation !== undefined)
            .forEach(obj=>obj.updateAnimation())
    }

    //checks if mouse position is within any of the drawables
    isInside(mouse, tempContext) {
        if (!this.clickable) {
            return false
        }

        let centeredMouse = {
            x: mouse.x - this.x,
            y: mouse.y - this.y
        }

        for (const child of this.children) {
            if (child.isInside(centeredMouse, tempContext, this.x, this.y)) {
                return true;
            }
        }
        return false;
    }
}

// module.exports = GameElement

export { GameElement }