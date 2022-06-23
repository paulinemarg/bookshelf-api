const mongoose = require('mongoose');

let bookSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],
  Author: [{type: mongoose.Schema.Types.ObjectId, ref: 'Author'}],
  Published: Date,
  Rating: String,
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: String,
  Birthday: Date,
  FavoriteBooks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Book'}]
});

let genreSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Description: {type: String, required: true}
});

let AuthorSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Bio: {type: String, required: true},
  Birth: Date,
  Work: [String],
  Image: String
});

let Book = mongoose.model('Book', bookSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Author = mongoose.model('Author', AuthorSchema);

module.exports.Book = Book;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Author = Author;
