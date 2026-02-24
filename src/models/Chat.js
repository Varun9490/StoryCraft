import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        messages: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: {
                    type: String,
                    maxlength: 2000,
                },
                message_type: {
                    type: String,
                    enum: ['text', 'image', 'aipreview', 'customization_request'],
                    default: 'text',
                },
                image_url: {
                    type: String,
                    default: '',
                },
                read: {
                    type: Boolean,
                    default: false,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        last_message: {
            type: String,
            default: '',
        },
        last_message_at: {
            type: Date,
        },
        customization_status: {
            type: String,
            enum: ['none', 'requested', 'preview_generated', 'confirmed', 'cancelled'],
            default: 'none',
        },
        customization_reference_image: {
            type: String,
            default: '',
        },
        customization_description: {
            type: String,
            maxlength: 500,
            default: '',
        },
    },
    { timestamps: true }
);

ChatSchema.index({ participants: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
