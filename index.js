const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const { check, validationResult } = require('express-validator');
const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ 
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

const Books = Models.Book;
const Users = Models.User;
const Genres = Models.Genre;
const Authors = Models.Author;

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const passport = require('passport');
require('./passport');

mongoose.connect('mongodb://localhost:27017/bookshelfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const auth = require('./auth')(app);

app.get('/', (req, res) => {
  res.send('Welcome to Bookshelf!');
});

//------------------Book Requests---------------//
app.get('/books', 
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Books.find().populate('Author').populate('Genre')
      .then((books) => {
        res.status(200).json(books);
      }).catch((err) => {
        console.error(err);
        res.status(500).sned('Error: ' + err);
      });
  });

app.get('/books/:Name',
passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
  Authors.find()
  .then((author) => {
    res.status(200).json(author);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/authors/:Name', (req, res) => {
  passport.authenticate('jwt', { session: false }),
  Author.findOne({
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
  passport.authenticate('jwt', { session: false }),
  Genres.find()
    .then((genre) => {
      res.status(200).json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/genres/:Name', (req, res) => {
  passport.authenticate('jwt', { session: false }),
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

//------------------User Requests---------------//
app.get('/users', (req, res) => {
  passport.authenticate('jwt', { session: false }),
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', (req, res) => {
  passport.authenticate('jwt', { session: false }),
  Users.findOne({
    Username: req.params.Username
  })
    .then((user) => {
      res.json(user);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        errors: errors.array() 
      });
    }
    let hashedPassword = Users.hashedPassword(req.body.Password);
    Users.findOne({
      Username: req.body.Username 
    })
      .then((user) => {
        if (user) { 
          return res.status(400).send(req.body.Username + ' already exists!');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            }).then((user) => {
              res.status(201).json(user)
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
          }
        }).catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
  });

app.put('/users/:Username', (req, res) => {
  passport.authenticate('jwt', { session: false }),
  Users.findOneAndUpdate({
    Username: req.params.Username
  }, {
    $set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  }, {
    new: true
  }, //this line makes sure that updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});


app.delete('/users/:Username', (req, res) => {
  passport.authenticate('jwt', { session: false }),
  Users.findOneAndDelete({
    Username: req.params.Username
  }).then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found!');
    } else {
      res.status(200).send(req.params.Username + ' was removed!');
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});