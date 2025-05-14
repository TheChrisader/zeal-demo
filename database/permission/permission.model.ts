import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { Id } from "@/lib/database";
import { IPermission } from "@/types/permission.type";

const PermissionSchema = new Schema<IPermission>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          // Validate permission format (resource:action)
          return v.every((permission) => /^[a-z_]+:[a-z_]+$/.test(permission));
        },
        message: "Permissions must follow format: resource:action",
      },
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "permissions",
  },
);

// Ensure unique user_id
PermissionSchema.index({ user_id: 1 }, { unique: true });

PermissionSchema.virtual("id").get(function () {
  return (this._id as Id).toHexString();
});

PermissionSchema.set("toObject", {
  virtuals: true,
});

PermissionSchema.set("toJSON", {
  virtuals: true,
});

PermissionSchema.plugin(mongooseLeanVirtuals);

const PermissionModel: Model<IPermission> =
  models.Permission || model<IPermission>("Permission", PermissionSchema);

export default PermissionModel;
