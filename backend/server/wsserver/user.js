var users =[];

 const USER_STATUS={
    INROOM : 'inroom',
    INVITED : 'invited',
    ONLINE :'online'
}

module.exports.users = users;
module.exports.USER_STATUS=USER_STATUS;

module.exports.createUser =function(username,connection,callback){

    if(!username){
        callback(new Error('username can not be null'));
    }

    if(!connection){
        callback(new Error('connection can not be null'))
    }
    if(!users[username]){
        users[username] ={
            connection:connection,
            status:USER_STATUS.ONLINE
        };
        return callback(null,true);

    }else{
        
        return callback(null,false); 
    }

}

module.exports.deleteUser = function(username,callback){

    if(!username){
        return callback(new Error("usernaem can not be null"));
    }

    delete users[username];

}

module.exports.sendTo = function (username, message,callback) { 

    if(!username){
        return callback(new Error("usernaem can not be null"));
    }


    if(!users[username].connection){
        return callback(new Error(username, "dont have connection"));
    }

    users[username].connection.send(JSON.stringify(message));
}

module.exports.authenticate = function(username){


    if(users[username]){ 
        
        return true;

    }else{
        
        return false;
    }

}

module.exports.findUserFromConnection = function(conn,callback){


    if(!conn){
        return callback(new Error("connection can not be null"));
    }

    for(username in users){
        if(users[username].connection ===conn){

            return callback(null,username)
        }
    }

    return callback(null,null)

}

module.exports.isInRoom = function(username,callback){
    
    if(!username){
        return callback(new Error("usernaem can not be null"));
    }
    
    if(users[username].status ===USER_STATUS.INROOM){

        return callback(null,users[username].roomname);

    }else{
        return callback(null,null);
    }
    
}


module.exports.broadcast = function(usernames,message){

    usernames.array.forEach(username => {
        users[username].connection.send(JSON.stringify(message))
    });
}

