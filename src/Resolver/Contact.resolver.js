import { Contact } from "../Models/Users/Contact.Model.js";
const contactResolvers={
    Query:{
        contacts:async ()=>await Contact.find(),
        contact:async (_,{id})=>await Contact.findById(id)
    },
    Mutation:{
        createContact:async (_,args)=>{
            const newContact=new Contact(args);
            return await newContact.save();
        },
        updateContact:async (_id,args)=>{
            const updatedContact=await Contact.findByIdAndUpdate(args._id, args, {new: true});
            return updatedContact;
        },
        deleteContact:async (_id, {id})=>{
            const deletedContact=await Contact.findByIdAndDelete(id);
            return deletedContact;
        },
    },
};
export {contactResolvers};