# Easy educational games

# Template project

You can find the template project repository at
https://github.com/hutnikus/easy-educational-games-testing

# About

This module makes creating simple educational games simple.

# How to use this module

1. Create a new project. Use the command `npm init -y`
2. Install this package with `npm install easy-educational-games --save`
3. Create index.js file in the root of your project
4. Paste this code into index.js
```javascript
const g = require("easy-educational-games")
const path = require("path");
//set static folder
g.app.use(g.express.static(path.join(__dirname,"public")))
g.app.listen(g.PORT,"0.0.0.0",
    ()=>console.log(`Server running on port ${g.PORT}`)
)
```
5. Create a new folder in your project called `public`, here will be the source code for your app and also the displayed page.
6. If you only have 1 page, create files called `index.html`, `script.js` and a directory named `resources` in the `public` folder.
7. If you want to use multiple pages, create a new directory for each page.
8. Somewhere in the body of the html add a canvas element with the id `game`.
9. On the end of the `index.html` file, paste the code `<script src="script.js" type="module"></script>` to include the source code of your app.
10. In the `script.js` file, paste the code
```javascript
import {Game} from "/modules/index.js"

const canvas = document.getElementById('game');
canvas.width = 600;
canvas.height = 600;

const game = new Game(canvas);
```
11. Run the server with `npm start`

# What does the pasted code in index.js do?

This is what is exported with require("easy-educational-games")

```javascript
module.exports = {
    app,express,PORT,
    modulesPath: "./node_modules/easy-educational-games/public/modules"
}
```

* `app` is the express app
* `express` is the express module
* `PORT` is the port number (default is 3000, or `process.env.PORT`)
* `modulesPath` is the path to the modules folder. In the express app, you can use `/modules/index.js` to load modules.

# How to use this module

In the file `script.js` is the source code of your app.
You import straight from node_modules, for the code to run locally (the path is automatically set).

Through importing you can access classes and some misc functions, that are defined in the documentation.

Look at the template project for an example of how to use this module.