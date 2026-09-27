import mongoose, { Document, Schema } from 'mongoose';

export interface IArtist extends Document {
  name: string;
  genre: string;
  bio: string;
  image: string;
  location: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    x?: string;
  };
  isActive: boolean;
  // Extended fields for frontend interoperability
  role?: string;
  badge?: string;
  category?: string;
  genres?: string[];
  quote?: string;
  stats?: {
    shows?: number;
    communityMembers?: string;
    reach?: string;
  };
  tracks?: Array<{
    title: string;
    duration: string;
    bpm: string;
  }>;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const artistSchema = new Schema<IArtist>(
  {
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      minlength: [1, 'Artist name cannot be empty'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      minlength: [1, 'Genre cannot be empty'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Global',
      trim: true,
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      spotify: { type: String, default: '' },
      x: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional compatibility fields
    role: {
      type: String,
      default: 'Independent Artist',
    },
    badge: {
      type: String,
      default: 'ROSTER',
    },
    category: {
      type: String,
      default: '',
    },
    genres: {
      type: [String],
      default: [],
    },
    quote: {
      type: String,
      default: '',
    },
    stats: {
      shows: { type: Number, default: 0 },
      communityMembers: { type: String, default: '10K+' },
      reach: { type: String, default: '100K+' },
    },
    tracks: [
      {
        title: { type: String, default: '' },
        duration: { type: String, default: '3:30' },
        bpm: { type: String, default: '120' },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // Ensure frontend compatibility
        if (!ret.category && ret.genre) ret.category = ret.genre.toUpperCase();
        if ((!ret.genres || ret.genres.length === 0) && ret.genre) ret.genres = [ret.genre.toUpperCase()];
        if (!ret.socials && ret.socialLinks) ret.socials = ret.socialLinks;
        return ret;
      },
    },
  }
);

// Index for high-performance text and genre searches
artistSchema.index({ name: 'text', genre: 'text', location: 'text' });

export const Artist = mongoose.models.Artist || mongoose.model<IArtist>('Artist', artistSchema);
export default Artist;
