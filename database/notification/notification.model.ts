import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { INotification } from "@/types/notification.type";

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "INTERACTION",
        "RECOMMENDATION",
        "SYSTEM",
        "ACHIEVEMENT",
        "REMINDER",
        "MENTION",
      ],
    },

    subtype: {
      type: String,
      required: true,
      enum: [
        // Interaction subtypes
        "POST_LIKE",
        "POST_COMMENT",
        "COMMENT_REPLY",
        "NEW_FOLLOWER",
        "SHARED_POST",

        // Recommendation subtypes
        "TRENDING_CONTENT",
        "SUGGESTED_USER",
        "SIMILAR_CONTENT",

        // System subtypes
        "ACCOUNT_UPDATE",
        "SECURITY_ALERT",
        "PAYMENT_STATUS",

        // Achievement subtypes
        "BADGE_EARNED",
        "MILESTONE_REACHED",

        // Reminder subtypes
        "SCHEDULED_REMINDER",
        "CUSTOM_REMINDER",

        // Mention subtypes
        "COMMENT_MENTION",
        "POST_MENTION",
      ],
    },

    actors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    targetObject: {
      model: {
        type: String,
        enum: ["Post", "Comment", "User", "Achievement", "System"],
      },
      id: Schema.Types.ObjectId,
      slug: {
        type: String,
      },
    },

    content: {
      title: String,
      body: String,
      thumbnail: String,
      url: String,
    },

    status: {
      isRead: {
        type: Boolean,
        default: false,
        index: true,
      },
      isArchived: {
        type: Boolean,
        default: false,
      },
      readAt: Date,
      archivedAt: Date,
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },

    // expiresAt: {
    //   type: Date,
    //   index: true,
    // },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
  },
);

NotificationSchema.index({
  recipient: 1,
  type: 1,
  "status.isRead": 1,
  created_at: -1,
});

NotificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    "status.isRead": false,
    "status.isArchived": false,
  });
};

NotificationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

NotificationSchema.set("toObject", {
  virtuals: true,
});

// Methods
NotificationSchema.methods.markAsRead = async function () {
  this.status.isRead = true;
  this.status.readAt = new Date();
  return this.save();
};

NotificationSchema.methods.archive = async function () {
  this.status.isArchived = true;
  this.status.archivedAt = new Date();
  return this.save();
};

// Static methods
NotificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    "status.isRead": false,
    "status.isArchived": false,
  });
};

NotificationSchema.plugin(mongooseLeanVirtuals);

const NotificationModel: Model<INotification> =
  models.Notification || model("Notification", NotificationSchema);

export default NotificationModel;
