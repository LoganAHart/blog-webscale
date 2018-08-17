const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = {
  createUser: () => {
    return new User({}).save();
  },
  deleteUser: (user) => {
    return User.findByIdAndRemove(user._id);
  },
}

/*
Note - application currently does not make use of googleId or displayName,
but we may want to modify the userFactory function to include these at a later date

const userSchema = new Schema({
  googleId: String,
  displayName: String
});
*/
