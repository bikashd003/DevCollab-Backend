import Editor from "../../Models/Editor/Editor.model.js";

const editorResolvers = {
    Query: {
        getEditorById: async (parent, args, context) => {
            return await Editor.findById(args.id);
        }
    },
    Mutation: {
        createEditor: async (parent, args, context) => {
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const editor = await Editor.create({ ...args, createdBy: context.user._id });
            return editor;
        },
        updateEditor: async (parent, args, context) => {
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const editor = await Editor.findByIdAndUpdate(args.id, args, { new: true });
            return editor;
        },
        deleteEditor: async (parent, args, context) => {
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const editor = await Editor.findByIdAndDelete(args.id);
            return editor;
        }
    }

}

export { editorResolvers };
