import { Question } from "../../Models/Questions/Question.model.js";
import { Answer } from "../../Models/Questions/Answer.model.js";
import { User } from "../../Models/Users/Users.model.js"
import { checkForAbusiveLanguage } from "../../Constant/CheckForAbusiveLanguage.js";
const questionResolvers = {
    Query: {
        getQuestions: async (_, { limit, offset }) => {
            const questions = await Question.find()
                .populate("author")
                .populate("upvotes")
                .populate("downvotes")
                .skip(offset)
                .limit(limit)
                .exec();

            const totalQuestions = await Question.countDocuments();
            const totalPages = Math.ceil(totalQuestions / limit);

            return { questions, totalQuestions, totalPages };
        },
        getQuestionById: async (parent, args, context) => {
            const question = await Question.findById(args.id)
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'author'
                    }
                })
                .populate('author')
                .populate('upvotes')
                .populate('downvotes');
            question.views += 1;
            await question.save();
            return question;
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
                .populate('author')
                .populate('upvotes')
                .populate('downvotes');
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
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            //check content has abousive language
            const hasAbusiveLanguage = await checkForAbusiveLanguage(args.content);
            if (hasAbusiveLanguage) {
                throw new Error('Content has abusive language please be polite and respectful');
            }
            const newQuestion = new Question({
                title: args.title,
                content: args.content,
                author: context.user._id,
                tags: args.tags
            });
            return await newQuestion.save();
        },
        updateQuestion: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            return await Question.findByIdAndUpdate(args.id, args, { new: true });
        },
        deleteQuestion: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            await Question.findByIdAndDelete(args.id);
            return true;
        },
        upvoteQuestion: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const question = await Question.findById(args.id);
            const userId = context.user._id;

            if (question.upvotes.includes(userId)) {
                // Remove user ID from upvotes
                question.upvotes.pull(userId);
            } else {
                // Add user ID to upvotes if not present
                question.upvotes.push(userId);
                // Remove from downvotes if present
                question.downvotes.pull(userId);
            }
            await question.save();

            // Return the populated question
            return await Question.findById(args.id)
                .populate('author')
                .populate('upvotes')
                .populate('downvotes');
        },
        downvoteQuestion: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const question = await Question.findById(args.id);
            const userId = context.user._id;

            if (question.downvotes.includes(userId)) {
                question.downvotes.pull(userId);
            } else {
                question.downvotes.push(userId);
                // Remove from upvotes if present
                question.upvotes.pull(userId);
            }
            await question.save();

            // Return the populated question
            return await Question.findById(args.id)
                .populate('author')
                .populate('upvotes')
                .populate('downvotes');
        },
        createAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            //check content has abousive language
            const hasAbusiveLanguage = await checkForAbusiveLanguage(args.content);
            if (hasAbusiveLanguage) {
                throw new Error('Content has abusive language please be polite and respectful');
            }
            const newAnswer = new Answer({
                content: args.content,
                author: context.user._id,
                questionId: args.questionId
            });
            await newAnswer.save();
            const question = await Question.findById(args.questionId);
            question.answers.push(newAnswer._id);
            await question.save();
            return newAnswer;
        },
        updateAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            //check content has abousive language
            const hasAbusiveLanguage = await checkForAbusiveLanguage(args.content);
            if (hasAbusiveLanguage) {
                throw new Error('Content has abusive language please be polite and respectful');
            }
            return await Answer.findByIdAndUpdate(args.id, args, { new: true });
        },
        deleteAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            await Answer.findByIdAndDelete(args.id);
            return true;
        },
        upvoteAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const answer = await Answer.findById(args.id);
            const userId = context.user._id;
            if (answer.upvotes.includes(userId)) {
                answer.upvotes.pull(userId);
            } else {
                answer.upvotes.push(userId);
            }
            return await answer.save();
        },
        downvoteAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const answer = await Answer.findById(args.id);
            const userId = context.user._id;
            if (answer.downvotes.includes(userId)) {
                answer.downvotes.pull(userId);
            } else {
                answer.downvotes.push(userId);
            }
            return await answer.save();
        },
        acceptAnswer: async (parent, args, context) => {
            //check if the user is authenticated
            if (!context.user) {
                throw new Error('User is not authenticated');
            }
            const answer = await Answer.findById(args.id);
            const userId = context.user._id;
            if (answer.author.toString() === userId.toString()) {
                answer.isAccepted = true;
                return await answer.save();
            }
            return null;
        },
    },
};
export { questionResolvers };