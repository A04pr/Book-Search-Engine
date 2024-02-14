const { User } = require('./models');
const AuthService = require('./auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    me: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view this information');
      }
      return await User.findById(context.user._id);
    }
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }
      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      const token = AuthService.generateToken(user);

      return { token, user };
    },
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      const token = AuthService.generateToken(user);

      return { token, user };
    },
    saveBook: async (_, { bookId, title, authors, description, image, link }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book');
      }
      const user = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: { bookId, title, authors, description, image, link } } },
        { new: true }
      );
      return user;
    },
    removeBook: async (_, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove a book');
      }
      const user = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      return user;
    }
  }
};

module.exports = resolvers;