import { Contact } from "../../Models/Users/Contact.Model.js";
import { AuthenticationError } from 'apollo-server-express';
const contactResolvers = {
  Query: {
    contacts: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Contact.find();
    },
    contact: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Contact.findById(id);
    },
  },
  Mutation: {
    createContact: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const newContact = new Contact(args);
      return await newContact.save();
    },
    updateContact: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedContact = await Contact.findByIdAndUpdate(args._id, args, { new: true });
      return updatedContact;
    },
    deleteContact: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const deletedContact = await Contact.findByIdAndDelete(id);
      return deletedContact;
    },
  },
};

export { contactResolvers };
