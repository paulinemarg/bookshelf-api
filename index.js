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
  res.send('Welcome to Bookshelf!');
});

app.get('/books', function (req, res) {
    books.find().populate('Author').populate('Genre')
      .then((books) => {
        res.status(200).json(books);
      }).catch((err) => {
        console.error(err);
        res.status(500).sned('Error: ' + err);
      });
  });

app.get('/books/:Name',
(req, res) => {
  Books.findOne({
    Name: req.params.Name
  })
  .then((book) => {
    res.json(book);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});