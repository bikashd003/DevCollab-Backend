import { Question } from "../../Models/Questions/Question.model.js";
const questionResolvers = {
    Query: {
        getQuestions: async () => {
            return await Question.find().populate("author").exec();
        },
        getQuestion: async (parent, args) => {
            return await Question.findById(args.id)
        },
    },
    Mutation: {
        createQuestion: async (parent, args) => {
            const newQuestion = new Question(args);
            return await newQuestion.save();
        },
        updateQuestion: async (parent, args) => {
            return await Question.findByIdAndUpdate(args.id, args, { new: true });
        },
        deleteQuestion: async (parent, args) => {
            await Question.findByIdAndDelete(args.id);
            return true;
        },
        upvoteQuestion: async (parent, args) => {
            const question = await Question.findById(args.id);
            question.upvotes += 1;
            return await question.save();
        },
        downvoteQuestion: async (parent, args) => {
            const question = await Question.findById(args.id);
            question.downvotes -= 1;
            return await question.save();
        },
    },
};
export { questionResolvers };