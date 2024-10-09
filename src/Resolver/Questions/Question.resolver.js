import { Question } from "../../Models/Questions/Question.model.js";
import { Answer } from "../../Models/Questions/Answer.model.js";
import { User } from "../../Models/Users/Users.model.js"
const questionResolvers = {
    Query: {
        getQuestions: async (_, { limit, offset }) => {
            const questions = await Question.find()
                .populate("author")
                .skip(offset)
                .limit(limit)
                .exec();

            const totalQuestions = await Question.countDocuments();
            const totalPages = Math.ceil(totalQuestions / limit);

            return { questions, totalQuestions, totalPages };
        },
        getQuestionById: async (parent, args) => {
            return await Question.findById(args.id).populate('author answers');
        },
        searchQuestions: async (_, args, context) => {
            const { searchTerm, limit, offset, tags, userId } = args;

            let query = {};
            if (searchTerm) {
                query.$or = [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { content: { $regex: searchTerm, $options: 'i' } }
                ];
            }
            if (tags && tags.length > 0) {
                query.tags = { $in: tags };
            }
            if (userId) {
                const user = User.findOne({ username: userId })
                query['author.id'] = user._id;
            }
            const questions = await Question.find(query)
                .skip(offset)
                .limit(limit)
                .populate('author');
            console.log(questions)
            const totalCount = await Question.countDocuments(query);

            return {
                questions,
                totalPages: Math.ceil(totalCount / limit)
            };
        },


    },
    Mutation: {
        createQuestion: async (parent, args, context) => {
            const newQuestion = new Question({
                title: args.title,
                content: args.content,
                author: context.user._id,
                tags: args.tags
            });
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
        createAnswer: async (parent, args) => {
            const newAnswer = new Answer({
                content: args.content,
                author: context.user._id,
                question: args.questionId
            });
            return await newAnswer.save();
        },
        updateAnswer: async (parent, args) => {
            return await Answer.findByIdAndUpdate(args.id, args, { new: true });
        },
        deleteAnswer: async (parent, args) => {
            await Answer.findByIdAndDelete(args.id);
            return true;
        },
        upvoteAnswer: async (parent, args) => {
            const answer = await Answer.findById(args.id);
            answer.upvotes += 1;
            return await answer.save();
        },
        downvoteAnswer: async (parent, args) => {
            const answer = await Answer.findById(args.id);
            answer.downvotes -= 1;
            return await answer.save();
        },
        acceptAnswer: async (parent, args) => {
            const answer = await Answer.findById(args.id);
            answer.isAccepted = true;
            return await answer.save();
        },
    },
};
export { questionResolvers };