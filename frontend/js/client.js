var name; 
var connectedUser;
var room;

var conn = new WebSocket('ws://127.0.0.1:9090'); 

conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};
  

conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      
      case "login": 
            handleLogin(data.success); 
            break; 
      case "authenticate":
            handleAuthenticate(data.success);
            break;
      case "createRoom":
            handleCreateRoom(data.success)
            break;
      case "enterRoom":
            handleEnterRoom(data.users);
            break;
      case "offer": 
            handleOffer( data.fromUsername,data.offer); 
            break; 
      case "answer": 
            handleAnswer(data.fromUsername,data.answer); 
            break; 
      case "candidate": 
            handleCandidate(data.fromUsername,data.candidate); 
            break; 
      case "leave": 
            handleLeave();  
            break; 
      case "leaveRoom":
            handleLeaveRoom();
            break;
      
      case "anotherLeaveRoom":
            handleAnotherLeaveRoom(data.username);
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
         type: "login", 
      }); 
   }
	
});

enterRoomBtn.addEventListener("click",function(){
      var roomname = roomnameInput.value;

      room = {roomname:roomname};

      displayRoomname.innerHTML =roomname;

      if (roomname.length > 0) { 
            
            send({
                  type: "enterRoom",
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
                  type: "createRoom",
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
         type: "leaveRoom", 
         roomname: room.roomname
      });  
         
      //  handleLeaveRoom(); 
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
                                          yourConn[username] ={
                                                peerConnection: conn
                                          } 
                                          
                                          conn.createOffer(function (offer) { 
                                                
                                                send({ 
                                                type: "offer", 
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
                        yourConn[username] ={
                              peerConnection: conn
                        } 
                        
                        conn.setRemoteDescription(new RTCSessionDescription(offer));
            
                        conn.createAnswer(function (answer) { 
                              conn.setLocalDescription(answer); 
                                    
                              send({ 
                              type: "answer", 
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

function handleLeaveRoom(username){

      room = null;
      
      yourConn.remoteVideo.srcObject = null; 

      for(var username in yourConn){
            yourConn[username].close(); 
            yourConn[username].onicecandidate = null; 
            yourConn[username].onaddstream = null;
      }
      
      
      switchToRoomPage()
}

function handleAnotherLeaveRoom(username){

      alert(username +" gone")

      if(yourConn[username]){
            yourConn[username].close();
            yourConn[username].onicecandidate = null; 
            yourConn[username].onaddstream = null;
      }
}
  
function handleLeave() { 
      connectedUser = null; 

      switchToLoginPage()
};
   

function initRtcPeerConnection(otherUsername,remoteVideo,callback){

      var configuration = { 
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
         }; 

      var conn = new webkitRTCPeerConnection(configuration); 
                  
      conn.addStream(stream); 
            
      conn.onaddstream = function (e) { 
      remoteVideo.srcObject = e.stream; 
      };
            
      conn.onicecandidate = function (event) { 
      if (event.candidate) { 
            send({ 
            type: "candidate", 
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
            remoteVideo.src = source
      }

      dom.appendChild(remoteVideo)

      return callback(null,remoteVideo);

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