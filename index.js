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

//------------------Book Requests---------------//
app.get('/books', 
  function (req, res) {
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

app.get('/users/:Username/books',
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  }
);

app.post('/users/:Username/books/:BookID', 
  (req, res) => {
    Users.findOneAndUpdate({
      Username: req.params.Username
    }, {
      $push: { 
        FavoriteBooks: req.params.BookID
      }
    }, {
      new: true
    }, 
    (err, updateUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updateUser);
      }
    });
  }
);

app.delete('/users/:Username/books/:BookID',
  (req, res) => {
    Users.findOneAndUpdate({
      Username: req.params.Username
    }, {
      $pull: {
        FavoriteBooks: req.params.BookID
      }
    }, {
      new: true
    },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  }
);

//------------------Author Requests---------------//
app.get('/authors', (req, res) => {
  Authors.find()
  .then((author) => {
    res.status(200).json(author);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/authors/:Name', (req, res) => {
  Authors.findOne({
    Name: req.params.Name
  })
    .then((author) => {
      res.json(author);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//------------------Genre Requests---------------//
app.get('/genres', (req, res) => {
  Genres.find()
    .then((genre) => {
      res.status(200).json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/genres/:Name', (req, res) => {
  Genres.findOne({
    Name: req.params.Name
  })
    .then((genre) => {
      res.json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});