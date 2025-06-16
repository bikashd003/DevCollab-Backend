import { Blog } from '../../Models/Blogs/Blogs.model.js';

export const blogResolvers = {
    Query: {
        // Fetch all blogs
        getBlogs: async () => {
            try {
                return await Blog.find()
                    .populate('author')
                    .populate('comments.author')
                    .populate('likes')
                    .populate({
                        path: 'comments.likes',
                        select: 'id username profilePicture'
                    })
                    .sort({ createdAt: -1 });
            } catch (error) {
                console.log(error);
                throw new Error('Error fetching blogs');
            }
        },

        // Fetch a single blog by ID
        getBlogById: async (_, { id }) => {
            try {
                return await Blog.findById(id)
                    .populate('author')
                    .populate('comments.author')
                    .populate('likes')
                    .populate({
                        path: 'comments.likes',
                        select: 'id username profilePicture'
                    });
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
                return topContributors;
            } catch (error) {
                throw new Error('Error fetching top contributors');
            }
        },
        getPopularTags: async () => {
            try {
                const popularTags = await Blog.aggregate([
                    { $unwind: '$tags' },
                    { $group: { _id: '$tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ]);
                // Map the result to return the tag and count in the correct format
                return popularTags.map(tag => ({
                    tag: tag._id,
                    count: tag.count
                }));
            } catch (error) {
                throw new Error('Error fetching popular tags');
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
        updateBlog: async (_, { id, title, content, tags }) => {
            try {
                const updatedBlog = await Blog.findByIdAndUpdate(
                    id,
                    { title, content, tags },
                    { new: true }
                ).populate('author')
                .populate('comments.author')
                .populate('likes')
                .populate({
                    path: 'comments.likes',
                    select: 'id username profilePicture'
                });
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
        },

        // Create comment
        createComment: async (_, { content, blogId }, context) => {
            try {
                const userId = context.user._id;
                const blog = await Blog.findById(blogId);
                if (!blog) {
                    throw new Error('Blog not found');
                }

                const newComment = {
                    content,
                    author: userId,
                    likes: []
                };

                blog.comments.push(newComment);
                await blog.save();

                // Return the newly created comment
                const savedBlog = await Blog.findById(blogId)
                    .populate('comments.author')
                    .populate({
                        path: 'comments.likes',
                        select: 'id username profilePicture'
                    });
                return savedBlog.comments[savedBlog.comments.length - 1];
            } catch (error) {
                throw new Error('Error creating comment');
            }
        },

        // Update comment
        updateComment: async (_, { id, content }, context) => {
            try {
                const userId = context.user._id;
                const blog = await Blog.findOne({ 'comments._id': id });
                if (!blog) {
                    throw new Error('Comment not found');
                }

                const comment = blog.comments.id(id);
                if (comment.author.toString() !== userId.toString()) {
                    throw new Error('Not authorized to update this comment');
                }

                comment.content = content;
                await blog.save();

                const updatedBlog = await Blog.findById(blog._id)
                    .populate('comments.author')
                    .populate({
                        path: 'comments.likes',
                        select: 'id username profilePicture'
                    });
                return updatedBlog.comments.id(id);
            } catch (error) {
                throw new Error('Error updating comment');
            }
        },

        // Delete comment
        deleteComment: async (_, { id }, context) => {
            try {
                const userId = context.user._id;
                const blog = await Blog.findOne({ 'comments._id': id });
                if (!blog) {
                    throw new Error('Comment not found');
                }

                const comment = blog.comments.id(id);
                if (comment.author.toString() !== userId.toString()) {
                    throw new Error('Not authorized to delete this comment');
                }

                blog.comments.pull(id);
                await blog.save();
                return true;
            } catch (error) {
                throw new Error('Error deleting comment');
            }
        },

        // Like comment
        likeComment: async (_, { id }, context) => {
            try {
                const userId = context.user._id;
                const blog = await Blog.findOne({ 'comments._id': id });
                if (!blog) {
                    throw new Error('Comment not found');
                }

                const comment = blog.comments.id(id);
                if (comment.likes.includes(userId)) {
                    comment.likes.pull(userId);
                } else {
                    comment.likes.push(userId);
                }

                await blog.save();

                const updatedBlog = await Blog.findById(blog._id)
                    .populate('comments.author')
                    .populate({
                        path: 'comments.likes',
                        select: 'id username profilePicture'
                    });
                return updatedBlog.comments.id(id);
            } catch (error) {
                throw new Error('Error liking comment');
            }
        }
    },
};

