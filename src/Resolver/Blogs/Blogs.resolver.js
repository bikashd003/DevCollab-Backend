import { Blog } from '../../Models/Blogs/Blogs.model.js';

export const blogResolvers = {
    Query: {
        // Fetch all blogs
        getBlogs: async () => {
            try {
                return await Blog.find().populate('author').populate('comments.author').populate('likes').sort({ createdAt: -1 });
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
        },
        topContributors: async () => {
            try {
                const topContributors = await Blog.aggregate([
                    { $group: { _id: '$author', count: { $sum: 1 } } }, // Group by author
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userDetails'
                        }
                    },
                    { $unwind: '$userDetails' },
                    {
                        $project: {
                            _id: 1,
                            count: 1,
                            username: '$userDetails.username',
                            profilePicture: '$userDetails.profilePicture'
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ]);
                console.log('topContributors', topContributors);
                return topContributors;
            } catch (error) {
                console.error('Error fetching top contributors:', error); // Log the error
                throw new Error('Error fetching top contributors');
            }
        }
    },

    Mutation: {
        // Create a new blog
        createBlog: async (_, args, context) => {
            const { title, content, tags } = args;
            try {
                const newBlog = new Blog({
                    title,
                    content,
                    author: context?.user?._id,
                    tags
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
        likeBlog: async (_, { id }, context) => {
            try {
                const userId = context.user._id;
                const blog = await Blog.findById(id);
                if (!blog) {
                    throw new Error('Blog not found');
                }
                if (blog.likes.includes(userId)) {
                    blog.likes.pull(userId);
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

