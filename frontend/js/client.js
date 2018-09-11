var name; 
var connectedUser;
var room;

const BROADCASTMESSAGE ={
      ENTER_ROOM:"broadcast:enterRoom",
      LEAVE_ROOM:"broadcast:leaveRoom"
    }

    const NEGOTIATION_MESSAGE ={
      OFFER:"negotiation:offer",
      ANSWER:"negotiation:answer",
      CANDIDATE:"negotiation:candidate",
      SUCESS_NEGOTIATION:"negotiation:sucess",
      FAILED_NEGOTIATION:"negotiation:failed"
    }
    
    const ROOM_MESSANGE ={
      CREATE_ROOM:"room:createRoom",
      ENTER_ROOM:"room:enterRoom",
      FAILED_ENTER_ROOM:"room:failedEnterRoom",
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
    

var conn = new WebSocket('ws://127.0.0.1:9090'); 

conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};
  

conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      
      case SESSION_MESSAGE.LOGIN: 
            handleLogin(data.success); 
            break; 
      case SESSION_MESSAGE.LOGOUT: 
            handleLogout();  
            break;       
      case "authenticate":
            handleAuthenticate(data.success);
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
            handleOffer( data.fromUserID,data.offer); 
            break; 
      case NEGOTIATION_MESSAGE.ANSWER: 
            handleAnswer(data.fromUserID,data.answer); 
            break; 
      case NEGOTIATION_MESSAGE.CANDIDATE: 
            handleCandidate(data.fromUserID,data.candidate); 
            break; 
      case BROADCASTMESSAGE.LEAVE_ROOM:
            handleBroadcastLeaveRoom(data.userID);
            break;
                  
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
function send(message) { 
   if (connectedUser.name) { 
      message.fromUserID = connectedUser.name; 
   } 

   console.log("send Message" +message)
   try{
      conn.send(JSON.stringify(message)); 
   }catch(exception){

      console.log("failed webscoket send\ndetail:",exception)

   }
   
};

 
var loginPage = document.querySelector('#loginPage'); 
var userIDInput = document.querySelector('#userIDInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

var roomPage = document.querySelector('#RoomPage'); 
var roomnameInput = document.querySelector('#roomnameInput'); 
var createRoomBtn = document.querySelector('#createRoomBtn'); 
var enterRoomBtn = document.querySelector('#enterRoomBtn'); 

var callPage = document.querySelector('#callPage'); 
var inviteoUserIDInput = document.querySelector('#inviteUserIDInput');
var inviteBtn = document.querySelector('#inviteBtn'); 
var displayRoomname =document.querySelector("#displayRoomname");

var leaveRoomBtn = document.querySelector('#leaveRoomBtn');

var videoArea = document.querySelector('#videoArea');
var localVideo = document.querySelector('#localVideo'); 


var yourConn={}; 
var stream;
  
callPage.style.display = "none";
roomPage.style.display ="none";

loginBtn.addEventListener("click", function (event) { 
   connectedUser={
         name: userIDInput.value
   };
	
   if (connectedUser.name.length > 0) { 
      send({ 
         type: SESSION_MESSAGE.LOGIN, 
      }); 
   }	
});

enterRoomBtn.addEventListener("click",function(){
      var roomname = roomnameInput.value;

      room = {roomname:roomname};

      displayRoomname.innerHTML =roomname;

      if (roomname.length > 0) { 
            
            send({
                  type: ROOM_MESSANGE.ENTER_ROOM,
                  roomname: roomname
            });
      }
});

createRoomBtn.addEventListener("click",function(){
      
      var roomname = roomnameInput.value;
      room = {roomname:roomname};

      displayRoomname.innerHTML =roomname;

      if (roomname.length > 0) { 
            
            send({
                  type: ROOM_MESSANGE.CREATE_ROOM,
                  roomname: roomname
            });
      
      }
});
  
inviteBtn.addEventListener("click", function () { 
      var inviteUserID = inviteUserIDInput.value;
            
      if (inviteUserID.length > 0) { 

            send({ 
                  type: "invite", 
                  toUserID: inviteUserID,
                  roomname: room.roomname
            });
      }
});

leaveRoomBtn.addEventListener("click", function () { 

      send({ 
         type: ROOM_MESSANGE.LEAVE_ROOM, 
         roomname: room.roomname
      });  
         
      
   });
  
function handleLogin(success) { 
   if (success === false) { 

      connectedUser =null;
      alert("Ooops...try a different userID"); 

   } else { 

      switchToRoomPage()
   } 
};

function handleAuthenticate(success){

      if(!success){
            alert("ooops.....user is not valid ");
      }

}

function handleCreateRoom(success){
      if (success === false) { 
            alert("Ooops...");
             
      } else { 
            switchToCallpage();
                  
            navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) { 
               stream = myStream; 
                        
               localVideo.srcObject = stream;

                        
            }, function (error) { 
               console.log(error); 
              
            }); 
                  
      } 
}

function handleEnterRoom(users){
      if(users.length<=0){

            alert("Ooops... no users in room"); 

      }else{

            switchToCallpage()

            navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) { 
                  stream = myStream; 
                        
                  localVideo.srcObject = stream;
                  users.forEach((userID,i)=>{

                        createRemoteVideo(videoArea,null,(err,remoteVideo)=>{
                              if(err){
                                    console.log(err)
                              }
                              
                              if(remoteVideo){

                                    
                                    initRtcPeerClient(userID,remoteVideo,(err,client)=>{

                                          yourConn[userID]=client

                                          var conn = client.peerConnection
                                           
                                          conn.createOffer(function (offer) { 
                                                
                                                send({ 
                                                type: NEGOTIATION_MESSAGE.OFFER, 
                                                offer: offer,
                                                toUserID:userID
                                                }); 
            
                                                conn.setLocalDescription(offer); 
            
                                          }, function (error) { 
                                                alert("Error when creating an offer"); 
                                             });
                  
                                    })

                              }else{
                                    console.log("videoTemplete not available")
                              }

                        })

                  })
  
                 
            }, function (error) { 
                  console.log(error);
                  
            });
            
      }
}

function handleOffer(userID,offer) { 

      createRemoteVideo(videoArea,null,(err,remoteVideo)=>{
            if(err){
                  console.log(err)
            }
            
            if(remoteVideo){


                  initRtcPeerClient(userID,remoteVideo,(err,client)=>{

                        yourConn[userID]=client

                        var conn =client.peerConnection
                        
                        conn.setRemoteDescription(new RTCSessionDescription(offer));
            
                        conn.createAnswer(function (answer) { 
                              conn.setLocalDescription(answer); 
                                    
                              send({ 
                              type: NEGOTIATION_MESSAGE.ANSWER, 
                              answer: answer,
                              toUserID: userID
                              });
                              
                        }, function (error) { 
                              alert("Error when creating an answer"); 
                        }); 

                  })

            }else{
                  console.log("videoTemplete not available")
            }

      })
      
};
  
function handleAnswer(userID,answer) { 
      yourConn[userID].peerConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
function handleCandidate(userID,candidate) { 
      yourConn[userID].peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); 
};

function handleLeaveRoom(){

      room = null;
      
      stream.getTracks().forEach((track,i)=>{
            track.stop();
      })
      
      for( userID in yourConn){

            yourConn[userID].peerConnection.close(); 
            yourConn[userID].peerConnection.onicecandidate = null; 
            yourConn[userID].peerConnection.onaddstream = null;

            yourConn[userID].remoteVideo.pause();
            deleteRemoteleteRemoteVideo(yourConn[userID].remoteVideo)
            yourConn[userID].remoteVideo=null

      }
      
      switchToRoomPage()
}

function handleBroadcastLeaveRoom(userID){

      console.log(userID +" gone")

      if(yourConn[userID]){

            yourConn[userID].peerConnection.close();
            yourConn[userID].peerConnection.onicecandidate = null; 
            yourConn[userID].peerConnection.onaddstream = null;

            yourConn[userID].remoteVideo.pause()
            deleteRemoteleteRemoteVideo(yourConn[userID].remoteVideo)
            yourConn[userID].remoteVideo=null
      }
}
  
function handleLogout() { 
      connectedUser = null; 

      switchToLoginPage()
};
   



function createRemoteVideo(dom,source,callback){

      var remoteVideo=document.createElement('video');
      remoteVideo.autoplay =true;

      if(source){
            remoteVideo.srcObject = source
      }

      dom.appendChild(remoteVideo)

      return callback(null,remoteVideo);

}

function deleteRemoteleteRemoteVideo(remoteVideo){

      var parentElement = remoteVideo.parentElement

      parentElement.removeChild(remoteVideo)

      remoteVideo.srcObject =null;

}

function switchToCallpage(){

      loginPage.style.display = "none"; 
      roomPage.style.display ="none";
      callPage.style.display = "block";
}

function switchToLoginPage(){

      loginPage.style.display = "block"; 
      roomPage.style.display ="none";
      callPage.style.display = "none";

}
function switchToRoomPage(){

      loginPage.style.display = "none"; 
      roomPage.style.display ="block";
      callPage.style.display = "none";

}