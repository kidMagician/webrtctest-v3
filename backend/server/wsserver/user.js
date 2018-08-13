var users =[];

module.exports.users = waitingUsers;

module.exports.createUser =function(username,connection,callback){

    if(!username){
        callback(new Error('username can not be null'));
    }

    if(!connection){
        callback(new Error('connection can not be null'))
    }

    users[username] =connection;
    
    if(!users[username]){
        
        return callback(err,false);
    
    }else{
        
        return callback(err,true);
    }

}

module.exports.deleteUser = function(username,callback){

    delete users[username];

}

module.exports.sendTo = function (username, message,callback) { 

    if(!username){
        return callback("usernaem can not be null");
    }

    if(!users[username]){
        return callback(username + "is not available");
    }

    if(!users[username].connection){
        return callback(username + "dont have connection");
    }

    users[username].connection.send(JSON.stringify(message));
}

module.exports.broadcast = function(usernames,message){

    usernames.array.forEach(username => {
        users[username].connection.send(JSON.stringify(message))
    });
}

