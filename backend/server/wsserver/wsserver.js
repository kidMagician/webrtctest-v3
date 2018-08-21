var WebSocketServer = require('ws').Server; 

var wss = new WebSocketServer({port: 9090}); 

var room =require('./room.js');
var user = require('./user.js');
// var logger = require('./../logger.js')

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

      if(data.type != "login"){
        if(!user.authenticate(data.fromUsername)){

          var message ={
            type: "authenticate",
            success:false
          }
        }
      }
      
      switch (data.type) {
        
        case "login":

          console.log("login ",data.fromUsername)

          user.createUser(data.fromUsername,connection,(err,success)=>{

            if(err){
              console.log(err)
            }

            var message = {
              type: "login",
              success: success
            }

            user.sendTo(data.fromUsername,message);
          }
        );

        break;

        case "createRoom":

          console.log("create room ",data.roomname,data.fromUsername)
          // log.info(data.fromUsername," create ", data.roomname )

          room.createRoom(data.roomname,data.fromUsername,(err,room)=>{

            if(err){
                console.log("err")
            }

            if(room){
              var message = {
                type: "createRoom",
                success: true
              }
            }else{
              var message = {
                type: "createRoom",
                success: false 
              }
            }

            user.sendTo(data.fromUsername,message);
          })

        break;

        case "enterRoom": 
           
          console.log("enter room",data.fromUsername ,data.roomname)

          room.enterRoom(data.roomname,data.fromUsername,(err,users)=>{
            if(err){
              console.log(err)
            }

            var sanitizedUsers = [];

            for(var key in users){    //change to map??
                
              if(key!=data.fromUsername){
                sanitizedUsers.push(key);
              }

            }    

            var message = {
              from: data.fromUsername,
              type: "enterRoom", 
              roomName: data.roomName,
              users : sanitizedUsers
            }

            user.sendTo(data.fromUsername,message);
            

          });
          
        break;

        case "offer":
      
          console.log("Sending offer from ", data.fromUsername,"to ",data.toUsername);
        
          user.sendTo(data.toUsername, { 
            fromUsername: data.fromUsername,
            type: "offer", 
            offer: data.offer, 
            toUsername: data.toUsername
          }); 

        break;

        case "inviteRoom": 

          console.log("Sending invite from ",data.fromUsername,"to ",data.toUsername);

          user.sendTo(to,data.message)

        break;

        case "answer": 

          console.log("Sending answer from ",data.fromUsername ," to ",data.toUsername); 

          user.sendTo(data.toUsername, { 
            fromUsername: data.fromUsername,
            type: "answer", 
            answer: data.answer, 
            toUsername: data.toUsername
          }); 

        break; 
       
        case "candidate": 
          
          console.log("Sending candidate from",data.fromUsername," to ", data.toUsername); 

          user.sendTo(data.toUsername, { 
            fromUsername: data.fromUsername,
            type: "candidate", 
            candidate: data.candidate, 
            toUsername: data.toUsername
          }); 
          
        break;
       
        case "leaveRoom": 
          
          console.log(data.fromUsername ," leave from",data.roomname);
          
          room.leaveRoom(data.fromUsername,data.roomname,(err)=>{

            if(err){
              console.log(err)
            }

            var message={

                fromUsername: data.fromUsername,
                type: "leaveRoom",
            }

            user.sendTo(data.fromUsername,message);

            var broadcastMessage={
              username: data.fromUsername,
              type: "anotherLeaveRoom"
            }

            if(room.rooms[data.roomname]){

                room.broadcast(data.fromUsername,data.roomname,broadcastMessage,(err)=>{

                console.log(err);
              });

            }

          });
          
        break;
        
        case "leave":
          
          console.log(data.fromUsername ,"totally leave");
          
          message ={
            type: "leave"
          };

          user.sendTo(data.fromUsername,message);

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
    user.findUserFromConnection(connection,(err,username)=>{
      if(username){
        user.isInRoom(username,(err,roomname)=>{
          if(roomname){

            room.leaveRoom(username,roomname,(err)=>{
              if(!err){
                console.log(err)

                if(room.rooms[roomname]){

                  room.broadcast(data.fromUsername,data.roomname,broadcastMessage,(err)=>{
  
                  console.log(err);
                });
  
              }
              }
            })
          }
        });

        user.deleteUser(username)

      }
    })
  })
    
})


module.exports.app=wss;
  

