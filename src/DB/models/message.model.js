import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            minlength: 2,
            maxlength: 10000,
            required: function () {
                return !this.attachments?.length;
            },
        },

        attachments: {
            type: [String],
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        collection: "SARAHA_MESSAGES",
        timestamps: true,
    }
);

export const MessageModel =
    mongoose.models.Message || mongoose.model("Message", messageSchema);