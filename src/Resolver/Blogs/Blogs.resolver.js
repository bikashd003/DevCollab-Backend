import { Blog } from '../../Models/Blogs/Blogs.model.js';

export const blogResolvers = {
    Query: {
        // Fetch all blogs
        getBlogs: async () => {
            try {
                return await Blog.find().populate('author').populate('comments.author').populate('likes');
            } catch (error) {
                console.log(error);
                throw new Error('Error fetching blogs');
            }
        },

        // Fetch a single blog by ID
        getBlogById: async (_, { id }) => {
            try {
                return await Blog.findById(id).populate('author').populate('comments.author').populate('likes');
            } catch (error) {
                throw new Error('Blog not found');
            }
        }
    },

    Mutation: {
        // Create a new blog
        createBlog: async (_, args) => {
            const { title, content } = args;
            try {
                const newBlog = new Blog({
                    title,
                    content,
                    author: "66b7b5c58020ef32626cbbfd",
                });
                await newBlog.save();
                return newBlog;
            } catch (error) {
                throw new Error('Error creating blog');
            }
        },

        // Update an existing blog
        updateBlog: async (_, { id, args }) => {
            try {
                const updatedBlog = await Blog.findByIdAndUpdate(id, args, { new: true })
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
        },
        //like blog
        likeBlog: async (_, { blogId, userId }) => {
            try {
                const blog = await Blog.findById(blogId);
                if (!blog) {
                    throw new Error('Blog not found');
                }
                if (blog.likes.includes(userId)) {
                    blog.likes = blog.likes.filter(id => id !== userId);
                } else {
                    blog.likes.push(userId);
                }
                await blog.save();
                return blog;
            } catch (error) {
                throw new Error('Error liking blog');
            }
        }
    },
};

