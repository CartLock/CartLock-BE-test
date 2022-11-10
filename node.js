const http = require("http"); 
//create a server object: 
http 
  .createServer(function (req, res) { 
    res.write("<h1>LockCart Deployment is under process</h1>");  
    //write a response to the client 
     
    res.end();  
    //end the response 
  }) 
