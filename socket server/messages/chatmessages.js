let messages_List = {}


 function addMessage(messageId, sender, recepient, message){
    messages_List[messageId] ={sender,recepient,message}
}

function deleteMessage(messageId){
    delete messages_List[messageId]
}

function showMessage(){
    return messages_List
}
function popOldMessageToFirebase(){
    for(const item in messages_List){
        console.log(JSON.stringify(messages_List[item]))
    }
}
module.exports = { addMessage,deleteMessage, showMessage, }