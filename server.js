require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));


app.use('/bower_components', express.static(`${__dirname}/bower_components/`));
app.use('/js', express.static(`${__dirname}/js/`));
app.use((req, res) => res.sendFile(`${__dirname}/index.html`));

app.listen(port, () => {
    console.log('listening on %d', port);
});