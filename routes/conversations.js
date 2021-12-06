const router = require("express").Router();
const Conversation = require("../models/Conversation");

//new conv

router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});





// router.post("/", async (req, res) => {
//   console.log('i am here mf')
//   console.log(req.body)
//   const newMessage = new Message(req.body);


//   try {
//     const savedMessage = await newMessage.save();
//     res.status(200).json(savedMessage);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //get

// router.get("/:conversationId", async (req, res) => {
//   console.log("server side messages")
//   try {
//     const messages = await Message.find({
//       conversationId: req.params.conversationId,
//     });
//     console.log(messages)
//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.get("/:conversationId", async (req, res) => {
  console.log("server side messages")
  try {
    const messages = await Conversation.findOne({
      _id: req.params.conversationId,
    });
    const conversationId = messages._id
    let returnArray = messages.messages.map((item, index) => {
      return ({
        conversationId: conversationId,
        _id: item._id,
        text: item.text,
        sender: item.sender,
        createdAt: item.created_at
      })
    })
    res.status(200).json(returnArray);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.patch('/:convid', async (req, res) => {
  console.log("got in updating messages in conversations")

  try {
    const newData = {
      "sender": req.body.sender,
      "text": req.body.text,
      "created_at": Date.now()
    }
    let conversation = await Conversation.findOneAndUpdate({ _id: req.params.convid }, { $push: { messages: newData } })
    res.status(200).json({
      success: true,
      data: conversation
    })
  }
  catch (e) {
    res.status(400).json({
      success: false,
      error: e
    })
  }
})
module.exports = router;



// router.patch('/updateconversation/:convid', async (req, res) => {
//   console.log("got in updating conversation")

//   try {
//     const newData = {
//       "sender":req.body.sender,
//       "text": req.body.text,
//       "created_at": Date.now()
//     }
//     let conversation = await Conversation.findOneAndUpdate({ _id: req.params.convid }, { $push: { messages: newData } })
//     res.status(200).json({
//       success: true,
//       data: conversation
//     })
//   }
//   catch (e) {
//     res.status(400).json({
//       success: false,
//       error: e
//     })
//   }
// })
