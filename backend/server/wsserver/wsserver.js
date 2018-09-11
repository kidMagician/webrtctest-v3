var WebSocketServer = require('ws').Server; 

var wss = new WebSocketServer({port: 9090}); 

var room = require('./room.js');
var user = require('./user.js');
// var logger = require('./../logger.js')

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

const SESSION_MESSAGE ={
  LOGIN: "session:login",
  LOGOUT: "session:logout"
}

wss.on('connection', function(connection) {
  
  console.log("User connected");
	
  connection.on('message', function(message) { 
	
      var data; 
		
      try { 
         data = JSON.parse(message); 
        
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }

      if(data.type != SESSION_MESSAGE.LOGIN){
        if(!user.authenticate(data.fromUserID)){

          var message ={
            type: "authenticate",
            success:false
          }
        }
      }
      
      switch (data.type) {
        
        case SESSION_MESSAGE.LOGIN:

          console.log("try login ",data.fromUserID)

          user.createUser(data.fromUserID,connection,(err,success)=>{

            if(err){
              console.log(err)
              throw err
            }

            var message = {
              type: SESSION_MESSAGE.LOGIN,
              success: success
            }

            connection.send(JSON.stringify(message));
          });

        break;
        case SESSION_MESSAGE.LOGOUT:
          
          console.log(data.fromUserID ," logout");
          
          message ={
            type: SESSION_MESSAGE.LOGOUT
          };

          user.sendTo(data.fromUserID,message);

        break;
        case ROOM_MESSANGE.CREATE_ROOM:

          console.log("create room(",data.roomname,") from ",data.fromUserID)
          // log.info(data.fromUserID," create ", data.roomname )

          room.createRoom(data.roomname,data.fromUserID,(err,room)=>{

            if(err){
                console.log("err")
                throw err
            }

            if(room){
              var message = {
                type: ROOM_MESSANGE.CREATE_ROOM,
                success: true
                
              }
            }else{
              var message = {
                type: ROOM_MESSANGE.CREATE_ROOM,
                success: false 
              }
            }

            user.sendTo(data.fromUserID,message);
          })

        break;

        case ROOM_MESSANGE.ENTER_ROOM: 
           
          console.log("enter room",data.fromUserID ,data.roomname)

          room.enterRoom(data.roomname,data.fromUserID,(err,users)=>{
            if(err){
              
              console.log(err)
              throw err;
            }

            var sanitizedUsers = [];

            for(var key in users){    //change to map??
                
              if(key!=data.fromUserID){
                sanitizedUsers.push(key);
              }

            }    

            var message = {
              from: data.fromUserID,
              type: ROOM_MESSANGE.ENTER_ROOM, 
              roomName: data.roomName,
              users : sanitizedUsers
            }

            user.sendTo(data.fromUserID,message);

            var broadcastMessage ={
              from:data.fromUserID,
              type: BROADCASTMESSAGE.ENTER_ROOM,
              roomName: data.roomName
            }

            room.broadcast(data.fromUserID,data.roomname,broadcastMessage,(err)=>{
              if(err){
                console.log(err);
                throw err
              }
            })
            

          });
             
        break;
        case ROOM_MESSANGE.LEAVE_ROOM: 
        
          console.log(data.fromUserID ," leave from",data.roomname);
          
          room.leaveRoom(data.fromUserID,data.roomname,(err)=>{

            if(err){
              console.log(err)
              throw err
            }

            var message={

              fromUserID: data.fromUserID,
              type: ROOM_MESSANGE.LEAVE_ROOM,
            }

            user.sendTo(data.fromUserID,message);

            var broadcastMessage={
              userID: data.fromUserID,
              type: BROADCASTMESSAGE.LEAVE_ROOM
            }

            if(room.rooms[data.roomname]){

              room.broadcast(data.fromUserID,data.roomname,broadcastMessage,(err)=>{
                if(err){
                  console.log(err);
                  throw err
                }
                
              });

            }

          });
        
      break;

        case NEGOTIATION_MESSAGE.OFFER:
      
          console.log("Sending offer from ", data.fromUserID,"to ",data.toUserID);
        
          user.sendTo(data.toUserID, { 
            fromUserID: data.fromUserID,
            type: NEGOTIATION_MESSAGE.OFFER, 
            offer: data.offer, 
            toUserID: data.toUserID
          }); 

        break;

        case NEGOTIATION_MESSAGE.ANSWER: 

        console.log("Sending answer from ",data.fromUserID ," to ",data.toUserID); 

        user.sendTo(data.toUserID, { 
          fromUserID: data.fromUserID,
          type: NEGOTIATION_MESSAGE.ANSWER, 
          answer: data.answer, 
          toUserID: data.toUserID
        }); 

      break; 
     
      case NEGOTIATION_MESSAGE.CANDIDATE: 
        
        console.log("Sending candidate from",data.fromUserID," to ", data.toUserID); 

        user.sendTo(data.toUserID, { 
          fromUserID: data.fromUserID,
          type: NEGOTIATION_MESSAGE.CANDIDATE, 
          candidate: data.candidate, 
          toUserID: data.toUserID
        }); 
        
      break;

      case "inviteRoom": 

        console.log("Sending invite from ",data.fromUserID,"to ",data.toUserID);

        user.sendTo(to,data.message)

      break;

      default: 
          sendToConnection(connection, { 
            type: "error", 
            message: "Command not found: " + data.type 
          }); 
      
      break; 
      }
	}); 
	
  connection.on("close", function() { 

    console.log("ws client connection close")

    user.findUserFromConnection(connection,(err,userID)=>{
      if(err){
        console.log(err)
        throw err
      }

      if(userID){

        console.log("userID:",userID)

        user.isInRoom(userID,(err,roomname)=>{

          if(err){
            console.log(err)
            throw err
          }

          if(roomname){

            console.log(userID ,"leaveRoom from" ,roomname)

            room.leaveRoom(userID,roomname,(err)=>{
              
              if(err){
                console.log(err)
                throw err
              }
              
              if(!err){

                if(room.rooms[roomname]){

                  var broadcastMessage={
                    userID: userID,
                    type: BROADCASTMESSAGE.LEAVE_ROOM
                  }

                  room.broadcast(userID,roomname,broadcastMessage,(err)=>{
                    if(err){
                      console.log(err);
                      throw err
                    }
                  
                });
  
              }
              }
            })
          }
        });

        user.deleteUser(userID)

      }
    })
  })
    
})


module.exports.app=wss;
  

