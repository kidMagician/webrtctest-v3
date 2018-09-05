var peerConnections={};
var ws; 
var room;

const BROADCASTMESSAGE ={
      ENTER_ROOM:"broadcast:enterRoom",
      LEAVE_ROOM:"broadcast:leaveRoom"
}

const PARTICIPANTMESSAGE ={
      DISCONNECTED:"participant:disconnected",
      CONNECTED:"participant:connected"
}
    
const NEGOTIATION_MESSAGE ={
      OFFER:"negotiation:offer",
      ANSWER:"negotiation:answer",
      CANDIDATE:"negotiation:candidate",
      SUCESS_NEGOTIATION:"negotiation:sucess",
      FAILED_NEGOTIATION:"negotiation:failed"
}
    
const ROOM_MESSANGE ={
      CONNECT_ROOM:"room:connectRoom",
      FAILED_CONNECT_ROOM:"room:failedEnterRoom",
      LEAVE_ROOM:"room:leaveRoom",
}

const FAILED_CREATE_STATE={
      DUPLIACTED_NAME:"createRoomFailed:duplicatedname",
      TOO_LONG_NAME:"createRoomFailed:tooLongName",
      TOO_SHORT_NAME:"createRoomFailed:tooShortName",
      FORBIDDEN_NAME:"createRoomFailed:forbiddenname"

}
    
const SESSION_MESSAGE ={
      LOGIN: "session:login",
      LOGOUT: "session:logout"
}

function initRtcPeerConnection(otherUsername,remoteVideo,callback){

    var configuration = { 
          "iceServers": [{ "url": "stun:stun2.1.google.com:19302" },
                            // {"url":"turn:webrtc@live.com@numb.viagenie.ca",
                            // "credential":"webrtc@live.com"
                            // }
                      ]}; 

    var conn = new webkitRTCPeerConnection(configuration); 
                
    conn.addStream(stream); 
          
    conn.onaddstream = function (e) { 
    remoteVideo.srcObject = e.stream; 
    };
          
    conn.onicecandidate = function (event) { 
    if (event.candidate) { 
          send({ 
          type: NEGOTIATION_MESSAGE.CANDIDATE, 
          candidate: event.candidate,
          toUsername: otherUsername
          }); 
    }};  
          
    return callback(null,conn)

}

module.exports.connect = function(){

      ws = new WebSocket('ws://127.0.0.1:9090'); 

      return new Promise(function(resolve,reject){

      })

}

ws.onopen = function () { 
      console.log("Connected to the signaling server"); 
};

ws.onerror = function (err) { 
      console.log("Got error", err); 
   };


ws.onmessage = function (msg) { 
      console.log("Got message", msg.data);
         
      var data = JSON.parse(msg.data); 
         
      switch(data.type) { 
            case ROOM_MESSANGE.CONNECT_ROOM:
                  handleConnectRoom()            
            break;

            case ROOM_MESSANGE.CREATE_ROOM:
                  handleCreateRoom(data.success)
            break;

            case ROOM_MESSANGE.ENTER_ROOM:
                  handleEnterRoom(data.users);
            break;

            case ROOM_MESSANGE.LEAVE_ROOM:
                  handleLeaveRoom();
            break;

            case NEGOTIATION_MESSAGE.OFFER: 
                  handleOffer( data.fromUsername,data.offer); 
            break;

            case NEGOTIATION_MESSAGE.ANSWER: 
                  handleAnswer(data.fromUsername,data.answer); 
            break;

            case NEGOTIATION_MESSAGE.CANDIDATE: 
                  handleCandidate(data.fromUsername,data.candidate); 
            break; 

            case PARTICIPANTMESSAGE.DISCONNECTED:
                  handleParticipantDisconnected(data.username);
            break;

            case PARTICIPANTMESSAGE.CONNECTED:
                  handleParticipantConnected();
            break;
                     
         default: 
            break; 
      }
};

function handleParticipantDisconnected(){

      room.emit('participantDisconnected')
}


function handleLeaveRoom(){
      room.emit('disconnected',room)
}





