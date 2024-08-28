import { Blog } from '../../Models/Blogs/Blogs.model.js';
import { User } from '../../Models/Users/Users.model.js';

const blogResolvers = {
    Query: {
        // Fetch all blogs
        getBlogs: async () => {
            try {
                return await Blog.find().populate('author').populate('comments.author').populate('likes').populate('dislikes');
            } catch (error) {
                throw new Error('Error fetching blogs');
            }
        },

        // Fetch a single blog by ID
        getBlogById: async (_, { id }) => {
            try {
                return await Blog.findById(id).populate('author').populate('comments.author').populate('likes').populate('dislikes');
            } catch (error) {
                throw new Error('Blog not found');
            }
        }
    },

    Mutation: {
        // Create a new blog
        createBlog: async (_, { input }) => {
            const { title, content, authorId } = input;
            try {
                const newBlog = new Blog({
                    title,
                    content,
                    author: authorId,
                });
                await newBlog.save();
                return newBlog.populate('author').populate('comments.author').populate('likes').populate('dislikes');
            } catch (error) {
                throw new Error('Error creating blog');
            }
        },

        // Update an existing blog
        updateBlog: async (_, { id, input }) => {
            try {
                const updatedBlog = await Blog.findByIdAndUpdate(id, input, { new: true })
                    .populate('author')
                    .populate('comments.author')
                    .populate('likes')
                    .populate('dislikes');
                if (!updatedBlog) {
                    throw new Error('Blog not found');
                }
                return updatedBlog;
            } catch (error) {
                throw new Error('Error updating blog');
            }
        },

        // Delete a blog
        deleteBlog: async (_, { id }) => {
            try {
                const deletedBlog = await Blog.findByIdAndDelete(id);
                if (!deletedBlog) {
                    throw new Error('Blog not found');
                }
                return true;
            } catch (error) {
                throw new Error('Error deleting blog');
            }
        }
    },

    // Resolver for nested types
    Blog: {
        // Populate the author field for each blog
        author: async (blog) => {
            return await User.findById(blog.author);
        },

        // Populate the comments field for each blog
        comments: async (blog) => {
            return blog.comments.map(async (comment) => ({
                ...comment._doc,
                author: await User.findById(comment.author),
            }));
        },

        // Populate the likes field for each blog
        likes: async (blog) => {
            return blog.likes.map(async (userId) => await User.findById(userId));
        },

        // Populate the dislikes field for each blog
        dislikes: async (blog) => {
            return blog.dislikes.map(async (userId) => await User.findById(userId));
        }
    }
};

export default blogResolvers;
