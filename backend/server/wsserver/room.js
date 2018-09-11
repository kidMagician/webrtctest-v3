var ROOM_AVAILABLE_USER_NUM = require('./constants').ROOM_AVAILABLE_USER_NUM;
var MAX_ROOM_NAME_LENGTH =require('./constants').MAX_ROOM_NAME_LENGTH;
var MIN_ROOM_NAME_LENGTH = require('./constants').MIN_ROOM_NAME_LENGTH;

var rooms ={};

module.exports.rooms = rooms;

var user= require('./user.js');

var forbiddenNames = [
  ];

function isNameForbidden(roomname){

    return forbiddenNames.indexOf(roomnames) >=0;
}

function isNameTooLong(roomname){

    return roomname.length > MAX_ROOM_NAME_LENGTH; 
}

function isNameTooShort(roomname){

    return roomname.length < MIN_ROOM_NAME_LENGTH;
}

function isUserinRoom(userID,roomname){

    if (rooms[roomname].users[userID]){
        return true;
    }else{
        return false;
    }

}

module.exports.createRoom = function(roomname,userID,callback){

    // if(!isNameForbidden(roomname)){

    //     return callback(new Error('roomname is forbiddenNames'));     
    // }

    // if(!isNameTooLong(roomname)){

    //     return callback(new Error('roomname is too Long'));
    // }

    // if(!isNameTooShort(roomname)){

    //     return callback(new Error('roomname is too Short'))
    // }

    if(!roomname){

        return callback(new Error('roomename can not be null'));
    }

    if(user.users[userID]){

        user.users[userID].status = user.USER_STATUS.INROOM;
        user.users[userID].roomname = roomname;
        
        var users ={};

        users[userID]= user.users[userID]; 

        rooms[roomname] = {users:users};

    }else{
        return callback(new Error(userID,'user dont have connection'))
    }

    var room = rooms[roomname]

    return callback(null,room)

}

 function deleteRoom(roomname,callback){

    if(!roomname){

        return callback(new Error('roomname can not be null'));
    }

    delete rooms[roomname]
    
    return callback(null)
}

module.exports.enterRoom =function(roomname,userID, callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!userID){
        return callback(new Error('userID cant not be null'));
    }

    if(!rooms[roomname]){
        return callback(new Error('room is not avaliavle \n roomname:'+roomname))
    }

    if(!rooms[roomname].users[userID]){

        user.users[userID].status = user.USER_STATUS.INROOM;
        user.users[userID].roomname = roomname;
        
        rooms[roomname].users[userID] =user.users[userID];

        var users =rooms[roomname].users

        return callback(null,users)
    
    }else{
        
        return callback(new Error('user is alredy in the room'));
    }

}

module.exports.leaveRoom = function(userID,roomname,callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!userID){
        return callback(new Error('userID can not be null'));
    }

    rooms[roomname].users[userID].status = user.USER_STATUS.ONLINE;
    rooms[roomname].users[userID].roomname = null;
    delete rooms[roomname].users[userID];
    
    if(Object.keys(rooms[roomname].users).length<=0){
        deleteRoom(roomname,(err)=>{

            if(err){
                return callback(err);
            }
        });
    }
    
    return callback(null);

}


module.exports.checkfull = function(roomname,callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(roomname.length <= ROOM_AVAILABLE_USER_NUM){
        return callback(null,true);
    }else{
        return callback(null,false);
    }

}

module.exports.broadcast = function(from_userID,roomname,message,callback){

    if(!from_userID){
        return callback(new Error('userID can not be null'));
    }

    if(!roomname){
        return callback(new Error('roomname can not be null'));
    }

    if(!rooms[roomname]){
        return callback(new Error('room is not available'));
    }


    for(var userID in rooms[roomname].users){
        if(userID != from_userID){
            user.sendTo(userID,message)
        }
    }

    return callback(null)

    
}





