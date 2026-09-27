import mongoose, { Document, Schema } from 'mongoose';

export interface IEventScheduleItem {
  time: string;
  activity: string;
}

export interface IEventFaq {
  q: string;
  a: string;
}

export interface IEvent extends Document {
  title: string;
  date: string;
  day?: string;
  month?: string;
  year?: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  type: string;
  image: string;
  featured: boolean;
  price: string;
  capacity: number;
  registeredCount: number;
  description: string;
  schedule: IEventScheduleItem[];
  faqs: IEventFaq[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [1, 'Event title cannot be empty'],
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
      trim: true,
      minlength: [1, 'Event date cannot be empty'],
    },
    day: {
      type: String,
      default: '',
      trim: true,
    },
    month: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: String,
      default: '',
      trim: true,
    },
    time: {
      type: String,
      default: 'TBD',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    venue: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
    },
    type: {
      type: String,
      default: 'Community Event',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    price: {
      type: String,
      default: 'Free Entry with RSVP',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 500,
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    schedule: [
      {
        time: { type: String, default: '' },
        activity: { type: String, default: '' },
      },
    ],
    faqs: [
      {
        q: { type: String, default: '' },
        a: { type: String, default: '' },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // Extract day/month/year if missing from date string like "12 OCT 2024"
        if (!ret.day || !ret.month || !ret.year) {
          const parts = (ret.date || '').split(' ');
          if (parts.length >= 3) {
            if (!ret.day) ret.day = parts[0];
            if (!ret.month) ret.month = parts[1];
            if (!ret.year) ret.year = parts[2];
          }
        }
        return ret;
      },
    },
  }
);

eventSchema.index({ title: 'text', location: 'text', category: 'text', venue: 'text' });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
export default Event;
