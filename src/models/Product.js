import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artisan',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2500,
        },
        category: {
            type: String,
            enum: [
                'toys',
                'textiles',
                'pottery',
                'jewelry',
                'metalwork',
                'woodwork',
                'paintings',
                'shell_craft',
                'other',
            ],
            required: true,
        },
        images: [
            {
                url: { type: String },
                public_id: { type: String },
                alt: { type: String, default: '' },
            },
        ],
        price: {
            type: Number,
            required: true,
            min: 1,
        },
        suggested_price_range: {
            min: { type: Number },
            max: { type: Number },
        },
        city: {
            type: String,
            enum: ['Visakhapatnam', 'Hyderabad', 'Chennai', 'Kolkata'],
            default: 'Visakhapatnam',
        },
        stock: {
            type: Number,
            default: 1,
            min: 0,
        },
        is_customizable: {
            type: Boolean,
            default: false,
        },
        is_published: {
            type: Boolean,
            default: false,
        },
        tags: [{ type: String }],
        ai_generated_faqs: [
            {
                question: String,
                answer: String,
                approved: { type: Boolean, default: false },
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
        faq_generation_count: {
            type: Number,
            default: 0,
            min: 0,
        },
        material: {
            type: String,
            default: '',
        },
        craft_technique: {
            type: String,
            default: '',
        },
        model_3d_url: {
            type: String,
            default: null,
        },
        model_3d_status: {
            type: String,
            enum: ['none', 'generating', 'ready', 'failed'],
            default: 'none',
        },
        story_panels: [
            {
                heading: { type: String, default: '' },
                body: { type: String, default: '' },
                image_url: { type: String, default: '' },
                layout: { type: String, enum: ['text-left', 'text-right', 'full-image', 'centered', 'text-top', 'text-bottom'], default: 'text-left' },
                text_position: { type: String, enum: ['center', 'top', 'bottom', 'left', 'right'], default: 'center' }, // For full-image text positioning
                text_animation: { type: String, enum: ['fade', 'slide-up', 'slide-left', 'slide-right'], default: 'slide-up' },
                image_animation: { type: String, enum: ['fade', 'clip-reveal', 'slide-left', 'slide-right', 'zoom-in'], default: 'clip-reveal' },
                order: { type: Number, default: 0 },
            },
        ],
        translation_cache: {
            type: Map,
            of: String,
            default: {},
        },
        unique_visitors: {
            type: [String],
            default: [],
            select: false,
        },
    },
    { timestamps: true }
);

ProductSchema.index({ artisan: 1, city: 1, category: 1, is_published: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
