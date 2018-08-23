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

function isUserinRoom(username,roomname){

    if (roomname[roomname].users[username]){
        return true;
    }else{
        return false;
    }

}

module.exports.createRoom = function(roomname,username,callback){

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

    if(user.users[username]){

        user.users[username].status = user.USER_STATUS.INROOM;
        user.users[username].roomname = roomname;
        
        var users ={};

        users[username]= user.users[username]; 

        rooms[roomname] = {users:users};

    }else{
        return callback(new Error(username,'user dont have connection'))
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

module.exports.enterRoom =function(roomname,username, callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!username){
        return callback(new Error('username cant not be null'));
    }

    if(!rooms[roomname].users[username]){

        user.users[username].status = user.USER_STATUS.INROOM;
        user.users[username].roomname = roomname;
        
        rooms[roomname].users[username] =user.users[username];

        var users =rooms[roomname].users

        return callback(null,users)
    
    }else{
        
        return callback(new Error('user is alredy in the room'));
    }

}

module.exports.leaveRoom = function(username,roomname,callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!username){
        return callback(new Error('username can not be null'));
    }

    rooms[roomname].users[username].status = user.USER_STATUS.ONLINE;
    rooms[roomname].users[username].roomname = null;
    delete rooms[roomname].users[username];
    
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

module.exports.broadcast = function(from_username,roomname,message,callback){

    if(!from_username){
        return callback(new Error('username can not be null'));
    }

    if(!roomname){
        return callback(new Error('roomname can not be null'));
    }

    if(!rooms[roomname]){
        return callback(new Error('room is not available'));
    }


    if(isUserinRoom(from_username,roomname)){
        for(var username in rooms[roomname].users){
            if(username != from_username){
                user.sendTo(username,message)
            }
        }
        
    }
    else{
        return callback(new Error(usrname ,"is not available in", roomname));
    }

    return callback(null)

    
}   



