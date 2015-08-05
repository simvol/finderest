/*
	Authors: 
    - Evgeny Makarov 
    - Kimar Arakaki Neves
    CPSC 2261 - Web Technology (Term Project/Summer 2015)
    Last modified: 05 AUG 2015


    STEPS required in MongoDB:
    // Set uniqueness for primary key e-mail for USERS.
    db.users.ensureIndex({emaiL:1},{unique:true});
    // Set uniqueness for primary key group_id for GROUPS.
    db.groups.ensureIndex({group_id:1},{unique:true});    
*/

// Declare dependencies.
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongojs =  require('mongojs');
var cors = require('cors');
var db = mongojs("finderest", ["users","groups","invitation","credentials","sessions"]);
var ObjectId = mongojs.ObjectId;

// Initiate body parser and express.
app = express();

app.use(bodyParser.json());

app.use(cors());

// Define response header.
app.all('*',function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Http-Method-Override,  Authorization, Content-Length, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});

// Login
app.post("/user/login", function(req, res) {

    // Gets the user email that is trying to login.
    var email = req.body.email;
    // Gets the user password that is trying to login.
    var password = req.body.password

    // find the credentials in mongo to validate and create session if appropriate.
    db.credentials.find({"email" : email}, function(err, records) {  
        if(records.length > 0){
            if(records[0].password == password)
                // Try to create a session to the user.
                db.sessions.insert({"email" : email}, function (error, record){
                    if(error)
                        res.send('{"error":"unable to create session."}');
                    if(record)
                        res.send('{"success":"ok","token":"'+record._id+'"}');         
                })
            else
                res.send('{"error":"fail"}');
        }else{
            res.send('{"error":"Not registered"}');
        }
    })
}); 

// Check if session is valid.
app.post("/user/session/validate", function(req, res) {

    // Gets the session token.
    var token = req.body.token;

    // Gets the email to which the session refer to.
    var email = req.body.email;

    // find the session in mongo to validate token. 
    db.sessions.find({ _id : ObjectId(req.body.token) }, function(err, records) {  
        if(records.length > 0){       
            if(records[0].email == email)
                res.send('{"success":"ok"}');         
            else
                res.send('{"error":"fail"}');        
        }else{
             res.send('{"error":"session not found"}');
        }
    })
}); 

// Logout
app.post("/user/logout", function(req, res) {

    // find the session in mongo to delete entry.
    db.sessions.find({ _id : ObjectId(req.body.token) }, function(err, records) {  
        if(records.length > 0){       
            db.sessions.remove({ _id : ObjectId(req.body.token) }, function (error, record){
                if(error)
                    res.send('{"error":"unable to remove session."}');
                if(record)
                    res.send('{"success":"ok"}');         
            })
            
        }else{
             res.send('{"error":"session not found"}');
        }
    })
}); 


//PUT - /create/users - Improve error handling
app.put("/create/users", function(req,res) {
    
    // Retrieve the body
    var body = req.body;

    // Retrieve e-mail to check if user already exists.
    email =  body.email;
    password = body.password;

     db.credentials.insert({"email" : email, "password" : password}, function(err, records){
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
            return; //force exit.
        }
    });


    console.log("Request: "+ JSON.stringify(body));

    db.users.insert({"email" : email, "password" : password}, function(err, records){
        console.log("Response: "+ JSON.stringify(records));
        if(err){
            console.log(err);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        } else if(records){
            console.log('{"success":"ok"}');
            res.send('{"success":"ok"}');
        } else{
            console.log("else");
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write('{ "error": "E-mail already in use." }');
            res.end();
        }
    });

});

//PUT - /create/groups - Improve error handling
app.put("/create/groups", function(req,res) {
    
    // Retrieve the body
    var body = req.body;

    // Retrieve e-mail to check if user already exists.
    body.email =  body.email;

    console.log("Request: "+body);


    db.groups.insert(body, function(err, records){
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        } else if(records){
            console.log(records);
            res.send('{"success" : "Group has been created"}');
        } else{
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write('{ "error" : "group_id already in use." }');
            res.end();
        }
    });

});

app.get("/user/:email", function(req,res){
    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // find the group in mongo
    db.users.find({"email" : email}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        } else if(records)
            res.send(JSON.stringify(records[0]));
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    })
});

// Update user
app.post("/update/user/:email", function(req, res) {

    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // 
    var updatedUser = req.body; 
    // console.log("Body: "+ JSON.stringify(updatedUser));

    //remove email and _id from update object
    delete updatedUser.email;
    delete updatedUser["_id"];


    // console.log("Body after removal: "+ JSON.stringify(updatedUser));

    // find the profile in mongo
    db.users.find({"email" : email}, function(err, records) {  
        if(records){
            db.users.update({"email" : email}, { $set: updatedUser });
            // records.update({$push:{'messages.$' : updatedUser}})
            res.write('{"success":"true"}');
            res.end();
        }else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    })
}); 

// Update user - add group
app.post("/update/user/:email/groups", function(req, res) {

    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // 
    var newMembership = req.body.membership; 
    console.log("Body: "+ JSON.stringify(newMembership));

    // find the profile in mongo
    db.users.find({"email" : email}, function(err, records) {  
        if(records){
            db.users.update({"email" : email}, {$push:{"memberships" : newMembership}});
            // records.update({$push:{'messages.$' : newMembership}})
            res.write('{"success":"true"}');
            res.end();
        }else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    })
}); 

// Update group
app.post("/update/group/:group_id", function(req, res) {
    
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}');
        res.end();
        return; //Force exit the function.
    } else{
        groupId = parseInt(groupId);
    }

    //
    var updatedGroup = req.body; 
    // console.log("Body: "+ JSON.stringify(updatedGroup));

    //remove group_id from update object
    delete updatedGroup["group_id"]; 
    delete updatedGroup["_id"];

    // console.log("Body after removal: "+ JSON.stringify(updatedGroup));

    // find the group in mongo
    db.groups.find({"group_id" : groupId}, function(err, records) {
        if(records){
            db.groups.update({"group_id" : groupId}, { $set: updatedGroup });
            res.write('{"success":"true"}');
            res.end();
        }else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    })
}); 

// POST -- /group/:group_id/approve_request
app.post("/group/:group_id/approve_request", function(req, res){
    
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}'); 
        res.end();
        return;// force exit the function.
    } else{
        groupId = parseInt(groupId);
    }

    // Gets the request user's e-mail to add to the request list 
    var newMemberReq = req.body.email; 
    console.log("Entry requested by: "+ newMemberReq);


    // find the groups in mongo
    db.groups.find({"group_id":groupId}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        } else if(records.length > 0){
            db.groups.update({"group_id":groupId}, {$pull:{entry_reqs : newMemberReq}},function(err, groupRecords){
                db.users.update({"email":newMemberReq}, {$push:{memberships : groupId}},function(err, userRecords){
                    if(userRecords.n > 0){
                        db.groups.update({"group_id":groupId}, {$push:{ members : newMemberReq}},function(err, groupRecords2){
                            if(groupRecords2.n > 0){     
                                console.log('{"success" : "Update request: ' + records +    '" }');
                                res.send('{"success" : "Record updated", "member" : "' + newMemberReq + '" }')
                            }
                            else{
                                res.writeHead(500, {"Content-Type": "application/json"});
                                res.write({ error: err });
                                res.end(); 
                            }
                        });
                    } else {
                        db.groups.update({"group_id":groupId}, {$push:{entry_reqs : newMemberReq}});
                        res.writeHead(500, {"Content-Type": "application/json"});
                        res.write('{"error":"Unable to find user."}');
                        res.end(); 
                    }
                });
            });
        } else{
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        }
    });
});

// POST -- /group/:group_id/reject_rquest
app.post("/group/:group_id/reject_rquest", function(req, res){
    
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}'); 
        res.end();
        return;// force exit the function.
    } else{
        groupId = parseInt(groupId);
    }

    // Gets the request user's e-mail to add to the request list 
    var newMemberReq = req.body.email; 
    console.log("Entry requested by: "+ newMemberReq);


    // find the groups in mongo
    db.groups.find({"group_id":groupId}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        } else if(records.length > 0){
            db.groups.update({"group_id":groupId}, {$pull:{entry_reqs : newMemberReq}},function(err, records){
                if(records){
                    console.log('{"success" : "Update request: ' + records +    '" }');
                    res.send('{"success" : "Record updated" }')
                } else {
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.write({ error: err });
                    res.end();
                }
            });
        } else{
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        }
    });
});

// POST -- /request_entry/group_id
app.post("/request_entry/:group_id", function(req, res){
    
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}'); 
        res.end();
        return;// force exit the function.
    } else{
        groupId = parseInt(groupId);
    }

    // Gets the request user's e-mail to add to the request list 
    var newMemberReq = req.body.email; 
    console.log("Entry requested by: "+ newMemberReq);


    // find the groups in mongo
    db.groups.find({"group_id":groupId}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        } else if(records.length > 0){
            db.groups.update({"group_id":groupId}, {$push:{entry_reqs : newMemberReq}},function(err, records){
                if(records){
                    console.log('{"success" : "Update request: ' + records +    '" }');
                    res.send('{"success" : "Record updated" }')
                } else {
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.write({ error: err });
                    res.end();
                }
            });
        } else{
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write({ error: err });
            res.end();
        }
    });
});

// POST -- /people/invite NOT WORKING AS EXPECTED - Returning error but works
app.post("/people/invite", function(req, res){
    

    // Gets the group to which the entry request body has been made to
    var groupId = req.body.group_id;
    console.log("Group ID: "+groupId);


    // Gets the request user's e-mail to add to the request list 
    var invitations = req.body.emails; 
    console.log("invitations to: "+ invitations);
    
    for(var pos=0; pos < invitations.length; pos++){
        console.log("Preparing invitation for "+invitations[pos]);

        var userInvited = {
            "email" : invitations[pos]
        };
        // find the user in mongo
        db.users.find(userInvited, function(err, records) {  
            console.log(JSON.stringify(records));   

            if(records.length > 0){
                //Create invite
                var invite = { 
                    "group_id" : groupId, 
                    "date" :  new Date(),
                     "status" : "pending" };

                console.log( "Invite object: " + JSON.stringify(invite));

                //Create invitation in the database
                db.invitation.insert(invite,function(error, invRecord){
                    console.log("Inserting invite");
                    console.log(invRecord);
                    if(invRecord){
                        console.log("Recorded invite");
                        var invitationId = invRecord._id;
                        console.log("Invitation id: " + invitationId);
                        db.users.update(userInvited, {$push:{invitations : invitationId}});
                        invitationsCounter++;
                    } else {
                        res.writeHead(500, {"Content-Type": "application/json"});
                        res.write('error', { error: "Invitations failed. No guarantee all your invitations were sent." });
                        res.end();
                    }
                });
            }
        });
        
    }

    // Just confirm that the invitations were sent.
    res.send("{Successfully sent invitations.}");        
    
});

//GET - /groups - Retrieve all groups in the system
app.get("/groups",function(req, res){

    // find all records from the groups collection in mongoDB.
    db.groups.find({}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write("No Groups Found\n");
            res.end();
        } if(records)
            res.send(JSON.stringify(records));
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write("No Groups Found\n");
            res.end();
        }
    });
});

//GET - /group/{group_id}
app.get("/group/:group_id",function(req, res){
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}'); 
        res.end();
        return;// force exit the function.
    } else{
        groupId = parseInt(groupId);
    }

    // find the group in mongo
    db.groups.find({"group_id" : groupId}, function(err, records) {
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        } else if(records.length > 0)
            res.send(JSON.stringify(records));
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

//GET - /group/{group_name}
app.get("/group/by_name/:group_name",function(req, res){
    // Gets the group to which the entry request has been made to
    var groupName = req.params.group_name;
    console.log("Group name: " + groupName);

    // find the group in mongo
    db.groups.find({"group_name" : groupName}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        } if(records.length > 0)
            res.send(JSON.stringify(records));
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

//GET - /group/{group_owner}
app.get("/group/by_owner/:group_owner",function(req, res){
    // Gets the group to which the entry request has been made to
    var groupOwner = req.params.group_owner;
    console.log("Group name: " + groupOwner);

    // find the group in mongo
    db.groups.find({"owner" : groupOwner}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Fail to execute your request."}');
            res.end();
        } if(records.length > 0)
            res.send(JSON.stringify(records));
        else{
            res.send('{"error":"No Groups Own"}');
            res.end();
        }
    });
});


//GET - /group/names/{group_id}
app.get("/group/:group_id/name",function(req, res){
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}');
        res.end();
        return; //Force exit the function
    } else{
        groupId = parseInt(groupId);
    }

    // find the group in mongo
    db.groups.find( {"group_id" : groupId}, function(err, records) {  
        console.log(records[0].group_owner);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        } else if(records)
            res.send('{"group_name":'+JSON.stringify(records[0].group_name)+', "group_id" : ' + groupId + '}');
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

//GET - /user/{email}
app.get("/user/:email", function(req,res){
    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // find the group in mongo
    db.users.find({"email" : email}, function(err, records) {  
        console.log(records);
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        } else if(records)
            res.send(JSON.stringify(records[0]));
        else{
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    });
});

//GET - /user/{email}/groups
app.get("/user/:email/groups", function(req,res){
    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // find the group in mongo
    db.users.find({"email" : email}, function(err, records) {  
        console.log(JSON.stringify(records.memberships));
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        } else{
            res.send(JSON.stringify(records[0].memberships));
        }
    });
});

//GET - /user/{email}/location
app.get("/user/:email/locations", function(req,res){
    // Gets the user from whom the locations is searched
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // find the user in mongo
    db.users.find({"email" : email}, function(err, records) {  
        console.log(JSON.stringify(records[0].locations));
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        } else
            res.send(JSON.stringify(records[0].locations));
    });
});

//GET -  /list/{group_id}/locations - FOR FUTURE    
// app.get("/users/:group_id/locations", function(req,res){
//     // Gets the user from whom the locations is searched
//     var groupId = req.params.group_id;
//     console.log("User e-mail: " + groupId);

//     // find the group in mongo
//     db.groups.find({"group_id" : groupId}, function(err, records) {  
//         console.log(JSON.stringify(records.locations));
//         if(records)
//             res.send(JSON.stringify(records.locations));
//         else{
//             res.writeHead(500, {"Content-Type":"application/json"});
//             res.write('{"error":"User Not Found"}');
//             res.end();
//         }
//     })
// });

//GET - /user/{email}/invitations
app.get("/user/:email/invitations", function(req,res){
    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

    // find the user in mongo
    db.users.find({"email" : email}, function(err, records) {  
        console.log(JSON.stringify(records));
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write(err);
            res.end();
        } else if (records){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        } else{
            res.send(JSON.stringify(records[0].invitations));
        }
                    

    });
});

// DELETE - /user/{email}
app.delete("/user/:email", function(req,res){
    // Gets the group to which the entry request has been made to
    var email = req.params.email;
    console.log("User e-mail: " + email);

     // find the profile in mongo
    db.users.remove({"email" : email}, function(err, records) {    
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write(err);
            res.end();
        } else if(!records){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }else{
            res.send(JSON.stringify(records));
        }   
    })
});

// DELETE - /groups/{group_id} 
app.delete("/group/:group_id", function(req,res){
    // Gets the group to which the entry request has been made to
    var groupId = req.params.group_id;
    console.log("Group id: " + groupId);

    if(isNaN(groupId)){
        res.writeHead(500, {"Content-Type":"application/json"});
        res.write('{"error":"Invalid entry: group ID must be a numeric integer value."}');
        res.end();
        return; //Force exit the function
    } else{
        groupId = parseInt(groupId);
    }

    // find the profile in mongo
    db.groups.remove({"group_id" : groupId}, function(err, records) {    
        if(err){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write(err);
            res.end();
        } else if(!records){
            res.writeHead(500, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }else{
            res.send(JSON.stringify(records));
        }
    })
});

// POST - /filter/group/category
app.post("/filter/group/category", function(err, records){
    // Gets the request categories requested in the list 
    var categories = req.body.categories; 
    console.log("Group Categories requested by: "+ categories);

    // find the groups in mongoDB
    db.groups.find({"category" : {$in: categories}}, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

// POST - filter/group/region
app.post("/filter/group/region", function(err, records){
    // Gets the request regions requested in the list 
    var regions = req.body.regions; 
    console.log("Group regions requested by: "+ regions);

    // find the groups in mongoDB
    db.groups.find({"address" : {$in: {"postal_code":{$in: regions} } } }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

// POST - /filter/group/size TODO based on members.length
app.post("/filter/group/size", function(err, records){
    // Gets the request sizes requested in the list 
    var minSize = req.body.min-size; 
    var maxSize = req.body.max-size; 

    console.log("Group min-size requested: "+ minSize);
    console.log("Group max-size requested: "+ maxSize);

    // // find the groups in mongoDB
    // db.groups.find({"address" : {"postal_code": {$in: regions}}}, function(err, records) {  
    //     console.log(JSON.stringify(records));
    //     if(records.length >0){
    //         res.send(JSON.stringify(records));
    //     }
    //     else{
    //         res.writeHead(404, {"Content-Type":"application/json"});
    //         res.write('{"error":"Group Not Found"}');
    //         res.end();
    //     }
    // });
});

//POST - /filter/group/members
app.post("/filter/group/members", function(err, records){
    // Gets the request regions requested in the list 
    var members = req.body.members; 
    console.log("Group including: "+ members);

    // find the groups in mongoDB
    db.groups.find({"members" : {$in: members} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

//POST - /filter/group/meeting-time
app.post("/filter/group/meeting-time", function(err, records){
    // Gets the request meeting-times requested in the list 
    var meetTime = req.body.meet-time; 
    console.log("Group including: "+ meetTime);

    // find the groups in mongoDB
    db.groups.find({"meeting_time" : {$in: meetTime} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

//POST -/filter/group - TO finish, min-size + max-size logic
app.post("/filter/group", function(err, records){
    // Gets the request categories requested in the list 
    var categories = req.body.categories; 
    console.log("Group Categories requested by: "+ categories);

    // Gets the request regions requested in the list 
    var regions = req.body.regions; 
    console.log("Group regions requested by: "+ regions);

    // Gets the request sizes requested in the list 
    var minSize = req.body.min-size; 
    var maxSize = req.body.max-size; 

    console.log("Group min-size requested: "+ minSize);
    console.log("Group max-size requested: "+ maxSize);

    // Gets the the list of members the group must include.
    var members = req.body.names; 
    console.log("Group including: "+ members);

    // Gets the request meeting-times requested in the list 
    var meetTime = req.body.meet-time; 
    console.log("Group including: "+ meetTime);

    // find the groups in mongoDB
    db.groups.find({"category" : {$in: categories}, "address" : {$in: {"postal_code":{$in: regions} } }, "members" : {$in: members}, "meeting_time" : {$in: meetTime} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"Group Not Found"}');
            res.end();
        }
    });
});

// POST - filter/user/region
app.post("/filter/user/region", function(err, records){
    // Gets the request regions requested in the list 
    var regions = req.body.regions; 
    console.log("User regions requested by: "+ regions);

    // find the users in mongoDB
    db.users.find({"locations" : {$in: {"postal_code": {$in: regions } } } }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    });
});

//POST - /filter/user/skills
app.post("/filter/user/skills", function(err, records){
    // Gets the skill list 
    var skills = req.body.skills; 
    console.log("User skills requested: "+ skills);

    // find the users in mongoDB
    db.users.find({"skills" : {$in: skills} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    });
});

// POST - /filter/user/interest
app.post("/filter/user/interest", function(err, records){
    // Gets the interest list 
    var interests = req.body.interests; 
    console.log("User interests requested: "+ interests);

    // find the users in mongoDB
    db.users.find({"interests" : {$in: interests} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    });
});

//POST - /filter/user
app.post("/filter/user", function(err, records){

    // Gets the request regions requested in the list 
    var regions = req.body.regions; 
    console.log("User regions requested by: "+ regions);

    // Gets the skill list 
    var skills = req.body.skills; 
    console.log("User skills requested: "+ skills);

    // Gets the interest list 
    var interests = req.body.interests; 
    console.log("User interests requested: "+ interests);

    // find the users in mongoDB
    db.users.find({"locations" : {$in: {"postal_code": {$in: regions} } },"skills" : {$in: skills}, "interests" : {$in: interests} }, function(err, records) {  
        console.log(JSON.stringify(records));
        if(records.length >0){
            res.send(JSON.stringify(records));
        }
        else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.write('{"error":"User Not Found"}');
            res.end();
        }
    });
});

// Initiate server port listening. 
var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Lab11 app listening at http://%s:%s', host, port);
    
});
