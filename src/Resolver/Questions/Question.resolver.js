import { Question } from "../../Models/Questions/Question.model.js";
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
            return await Question.findById(args.id).populate('author');
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
    },
};
export { questionResolvers };