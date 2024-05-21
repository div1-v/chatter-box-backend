const Group = require("../models/group");


const getConversation = async(currentUserId)=>{
    if (currentUserId) {
        const currentUserConversation = await Group.find({
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        })
          .populate("messages")
          .populate("sender")
          .populate("receiver")
          .sort({ updatedAt: -1 });
  
        const convo = currentUserConversation.map((conv) => {
          const countUnseenMsg = conv.messages.reduce(
            (prev, curr) => {
                if(curr?.msgByUserId?.toString()!==currentUserId){
                   return  prev + (curr.seen ? 0 : 1)
                }else{
                    return prev;
                }
            } ,0);
  
          return {
            _id: conv?._id,
            sender: conv?.sender,
            receiver: conv?.receiver,
            unseenMsg: countUnseenMsg,
            lastMsg: conv?.messages[conv?.messages?.length - 1],
          };
        });
        return convo;
      }else{
        return [];
      }
}

module.exports = getConversation;