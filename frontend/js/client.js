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
            handleOffer( data.fromUsername,data.offer); 
            break; 
      case NEGOTIATION_MESSAGE.ANSWER: 
            handleAnswer(data.fromUsername,data.answer); 
            break; 
      case NEGOTIATION_MESSAGE.CANDIDATE: 
            handleCandidate(data.fromUsername,data.candidate); 
            break; 

      case BROADCASTMESSAGE.LEAVE_ROOM:
            handleBroadcastLeaveRoom(data.username);
            break;
                  
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
function send(message) { 
   if (connectedUser) { 
      message.fromUsername = connectedUser.name; 
   } 

   console.log("send Message" +message)
	
   conn.send(JSON.stringify(message)); 
};

 
var loginPage = document.querySelector('#loginPage'); 
var usernameInput = document.querySelector('#usernameInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

var roomPage = document.querySelector('#RoomPage'); 
var roomnameInput = document.querySelector('#roomnameInput'); 
var createRoomBtn = document.querySelector('#createRoomBtn'); 
var enterRoomBtn = document.querySelector('#enterRoomBtn'); 

var callPage = document.querySelector('#callPage'); 
var inviteoUsernameInput = document.querySelector('#inviteUsernameInput');
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
         name: usernameInput.value
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
      var inviteUsername = inviteUsernameInput.value;
            
      if (inviteUsername.length > 0) { 

            send({ 
                  type: "invite", 
                  toUsername: inviteUsername,
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

      connectedUser.name =null;
      alert("Ooops...try a different username"); 

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
                  users.forEach((username,i)=>{

                        createRemoteVideo(videoArea,null,(err,remoteVideo)=>{
                              if(err){
                                    console.log(err)
                              }
                              
                              if(remoteVideo){

                                    yourConn[username]={remoteVideo:remoteVideo};
                                    
                                    initRtcPeerConnection(username,remoteVideo,(err,conn)=>{

                                          yourConn[username].peerConnection=conn
                                           
                                          conn.createOffer(function (offer) { 
                                                
                                                send({ 
                                                type: NEGOTIATION_MESSAGE.OFFER, 
                                                offer: offer,
                                                toUsername:username
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


function handleOffer(username,offer) { 

      createRemoteVideo(videoArea,null,(err,remoteVideo)=>{
            if(err){
                  console.log(err)
            }
            
            if(remoteVideo){

                  yourConn[username]={remoteVideo:remoteVideo};

                  initRtcPeerConnection(username,remoteVideo,(err,conn)=>{

                        yourConn[username].peerConnection=conn
                        
                        conn.setRemoteDescription(new RTCSessionDescription(offer));
            
                        conn.createAnswer(function (answer) { 
                              conn.setLocalDescription(answer); 
                                    
                              send({ 
                              type: NEGOTIATION_MESSAGE.ANSWER, 
                              answer: answer,
                              toUsername: username
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
  
function handleAnswer(username,answer) { 
      yourConn[username].peerConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
function handleCandidate(username,candidate) { 
      yourConn[username].peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); 
};

function handleLeaveRoom(){

      room = null;
      
      stream.getTracks().forEach((track,i)=>{
            track.stop();
      })
      
      for( username in yourConn){

            yourConn[username].peerConnection.close(); 
            yourConn[username].peerConnection.onicecandidate = null; 
            yourConn[username].peerConnection.onaddstream = null;

            yourConn[username].remoteVideo.pause();
            deleteRemoteleteRemoteVideo(yourConn[username].remoteVideo)
            yourConn[username].remoteVideo=null

      }
      
      switchToRoomPage()
}

function handleBroadcastLeaveRoom(username){

      console.log(username +" gone")

      if(yourConn[username]){

            yourConn[username].peerConnection.close();
            yourConn[username].peerConnection.onicecandidate = null; 
            yourConn[username].peerConnection.onaddstream = null;

            yourConn[username].remoteVideo.pause()
            deleteRemoteleteRemoteVideo(yourConn[username].remoteVideo)
            yourConn[username].remoteVideo=null
      }
}
  
function handleLogout() { 
      connectedUser = null; 

      switchToLoginPage()
};
   

function initRtcPeerConnection(otherUsername,remoteVideo,callback){

      var configuration = {"iceServers": [
                              { "url": "stun:stun2.1.google.com:19302" },
                              { 
                                    "url":"turn:numb.viagenie.ca",
                                    "username":"webrtc@live.com",
                                    "credential":"webrtc@live.com"
                              }
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