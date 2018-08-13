var WebSocketServer = require('ws').Server; 

var wss = new WebSocketServer({port: 9090}); 

var room =require('./room.js');
var user = require('./user.js');
var logger = require('logger')

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
		
      switch (data.type) {
        
        case "login":

          console.log(login,data.username)

          user.createUser(username,connection,(err,success)=>{
            
            var message = {
              type: "login",
              success: success
            }

            user.sendTo(username,message);
          }
        );

        case "createRoom":

          console.log("create room",data.roomname,data.username)

          room.createRoom(data.roomname,data,(err,room)=>{

            if(err)

            if(room){
              var message = {
                type: "createRoom",
                success: "success" 
              }
            }else{
              var message = {
                type: "createRoom",
                success: "false" 
              }
            }

            user.sendTo(username,message);
          })

          break;

        case "enterRoom": 
           
          console.log("enter room",data.user ,data.roomname)

          var toConn ;  

          

            break;

        case "inviteRoom": 
          console.log("Sending invite from ",from,"to ",to);

          user.sendTo(to,data.message)

          break;

        case "offer":
          
          console.log("Sending offer from ",from," to ", to);

          user.sendTo(to,data.message)

          break;

        case "answer": 
          console.log("Sending answer from ",from ," to ",to); 

          user.sendTo(to,data.message)

          break; 
       
        case "candidate": 
          
          console.log("Sending candidate from",from," to ", to); 

          user.sendTo(to,data.message)
          
          break;
       
        case "leaveRoom": 
          
          console.log(username ," leave from",data.roomname);
          
          room.leaveRoom(data.roomname,data.username);

          user.sendTo(to,)

          break;
        
        case "leave":
          
          console.log(username ,"totally leave");
          
          user.deleteUser(data.roomname,data.username);

          user.sendTo(to,)

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
	
      if(connection.name) { 
         delete users[connection.name]; 
			
         if(connection.otherName) { 
            console.log("Disconnecting from ", connection.otherName); 
            var conn = users[connection.otherName]; 
            conn.otherName = null;
				
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
            }
         } 
      }
		
   });  
	
   connection.send("Hello world");  
});

function sendTo(connection, message) { 
  connection.send(JSON.stringify(message)); 
}
  

