import mongoose from 'mongoose';

const ArtisanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        craft_specialty: {
            type: String,
            required: [true, 'Craft specialty is required'],
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 1200,
            default: '',
        },
        city: {
            type: String,
            enum: ['Visakhapatnam', 'Hyderabad', 'Chennai', 'Kolkata'],
            default: 'Visakhapatnam',
        },
        village: {
            type: String,
            trim: true,
            default: '',
        },
        years_of_experience: {
            type: Number,
            min: 0,
            max: 80,
            default: 0,
        },
        profile_image: {
            type: String,
            default: '',
        },
        banner_image: {
            type: String,
            default: '',
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        verification_badge: {
            type: String,
            enum: ['none', 'government', 'platform'],
            default: 'none',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        total_reviews: {
            type: Number,
            default: 0,
        },
        social_links: {
            instagram: { type: String, default: '' },
            facebook: { type: String, default: '' },
            youtube: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

export default mongoose.models.Artisan || mongoose.model('Artisan', ArtisanSchema);
