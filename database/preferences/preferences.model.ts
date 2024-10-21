import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IPreferences } from "@/types/preferences.type";

const PreferencesSchema = new Schema<IPreferences>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    language: {
      type: String,
      default: "en",
    },
    category_updates: {
      type: [String],
      default: [
        "Personal Finance",
        "Politics",
        "Breaking",
        "Top US News",
        "UK Top News",
      ],
    },
    notification_settings: {
      BREAKING: {
        type: Boolean,
        default: true,
      },
      TOP: {
        type: Boolean,
        default: true,
      },
      NEWS: {
        type: Boolean,
        default: true,
      },
    },
    notification_preferences: {
      push_notification: {
        type: Boolean,
        default: true,
      },
      email_notification: {
        type: Boolean,
        default: true,
      },
      in_app_notification: {
        type: Boolean,
        default: true,
      },
    },
    privacy_settings: {
      profile_visibility: {
        enum: ["public", "private"],
        type: String,
        default: "public",
      },
      last_seen: {
        type: Date,
        default: Date.now(),
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
  },
);

PreferencesSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

PreferencesSchema.set("toObject", {
  virtuals: true,
});

PreferencesSchema.plugin(mongooseLeanVirtuals);

const PreferencesModel: Model<IPreferences> =
  models.Preferences || model<IPreferences>("Preferences", PreferencesSchema);

export default PreferencesModel;
