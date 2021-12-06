const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    messages:[{
      sender: String,
      text : String, 
      created_at: {
         type: Date
         }
      }]

  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);