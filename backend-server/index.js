const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

//Loads the handlebars module
const hbs = require('express-handlebars');

var handlebars = hbs.create({
    extname: 'hbs',
    defaultLayout: 'index',
    layoutsDir: path.join(__dirname, '/views/layouts/'),
    partialsDir: path.join(__dirname, '/views/partials/')
})

//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars.engine);

//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

app.use(express.static('public'))

app.get('/', (req, res) => {
    //Serves the body of the page aka "main.handlebars" to the container 
    //aka "index.handlebars"
    res.render('main', {layout: 'index'});
});

app.listen(port, () => console.log(`App listening to port ${port}`));