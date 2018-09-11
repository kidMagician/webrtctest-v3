var users =[];

 const USER_STATUS={
    INROOM : 'inroom',
    INVITED : 'invited',
    ONLINE :'online'
}

module.exports.users = users;
module.exports.USER_STATUS=USER_STATUS;

module.exports.createUser =function(userID,connection,callback){

    if(!userID){
        callback(new Error('userID can not be null'));
    }

    if(!connection){
        callback(new Error('connection can not be null'))
    }
    if(!users[userID]){
        users[userID] ={
            connection:connection,
            status:USER_STATUS.ONLINE
        };
        return callback(null,true);

    }else{
        
        return callback(null,false); 
    }

}

module.exports.deleteUser = function(userID,callback){

    if(!userID){
        return callback(new Error("usernaem can not be null"));
    }

    delete users[userID];

}

module.exports.sendTo = function (userID, message,callback) { 

    if(!userID){
        return callback(new Error("usernaem can not be null"));
    }


    if(!users[userID].connection){
        return callback(new Error(userID, "dont have connection"));
    }

    users[userID].connection.send(JSON.stringify(message));
}

module.exports.authenticate = function(userID){


    if(users[userID]){ 
        
        return true;

    }else{
        
        return false;
    }

}

module.exports.findUserFromConnection = function(conn,callback){


    if(!conn){
        return callback(new Error("connection can not be null"));
    }

    for(userID in users){
        if(users[userID].connection ===conn){

            return callback(null,userID)
        }
    }

    return callback(null,null)

}

module.exports.isInRoom = function(userID,callback){
    
    if(!userID){
        return callback(new Error("usernaem can not be null"));
    }
    
    if(users[userID].status ===USER_STATUS.INROOM){

        return callback(null,users[userID].roomname);

    }else{
        return callback(null,null);
    }
    
}


module.exports.broadcast = function(userIDs,message){

    userIDs.array.forEach(userID => {
        users[userID].connection.send(JSON.stringify(message))
    });
}

