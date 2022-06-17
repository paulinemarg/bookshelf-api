const bodyParser = require('body-parser'),
      express = require('express'),
      morgan = require('morgan'),
      uuid = require('uuid');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});