
var ROOM_AVAILABLE_USER_NUM = require('./constants').ROOM_AVAILABLE_USER_NUM;
var MAX_ROOM_NAME_LENGTH =require('./constants').MAX_ROOM_NAME_LENGTH;
var MIN_ROOM_NAME_LENGTH = require('./constants').MIN_ROOM_NAME_LENGTH;

var rooms ={users:[]};

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

module.exports.createRoom = function(roomname,username,user,callback){

    if(!isNameForbidden(roomname)){

        return callback(new Error('roomname is forbiddenNames'));     
    }

    if(!isNameTooLong(roomname)){

        return callback(new Error('roomname is too Long'));
    }

    if(!isNameTooShort(roomname)){

        return callback(new Error('roomname is too Short'))
    }

    if(roomname != null){

        return callback(new Error('roomename can not be null'));
    }

    if(user){

        rooms[roomname].users[username]= user;

    }else{
        
        rooms[roomname].users=[];
    }

    var room = rooms[roomname]

    return callback(err,room)

}

module.exports.deleteRoom=function(roomname,callback){

    if(roomname != null){

        return callback(new Error('roomname can not be null'));
    }

    delete rooms[roomname]
    
    if(rooms[roomname]){

        return callback(err,false);
    }

    return callback(err, true);
}

module.exports.enterRoom =function(roomname,username, user, callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!username){
        return callback(new Error('username cant not be null'));
    }

    if(!room[roomname].users[username]){
        
        room[roomname].users[username] =user

        return callback(err,True);
    
    }else{
        
        return callback(err,False);
    }

}

module.exports.leaveRoom = function(roomname,username,callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(!username){
        return callback(new Error('username can not be null'));
    }

    delete rooms[roomname].users[username];
    
    if(rooms.length<=0){
        delete rooms[roomname];
    }

}


module.exports.checkfull = function(roomname,callback){

    if(!roomname){
        return callback(new Error('roomename can not be null'));
    }

    if(roomname.length <= ROOM_AVAILABLE_USER_NUM){
        return callback(err,true);
    }else{
        return callback(err,false);
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

    if(isUserinRoom){
        for(var username in rooms[roomname].users){
            if(from_username != from_username){
                user.sendTo(username,message)
            }
        }
        
        return callback(err, true);
    }
    else{
        return callback(new Error(usrname ,"is not available in", roomname));
    }

    return callback(err,false);
    
}   



