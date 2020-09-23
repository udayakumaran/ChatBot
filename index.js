const express = require('express');
const mysql = require('mysql')
const bodyparser = require('body-parser');
const { Socket } = require('dgram');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http)      //chat application



app.use( express.static(__dirname) );
app.use( bodyparser.json() )

var mysqlConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password : '1234',
    database : 'new1',
    multipleStatements: true

});

async function botstr(findStr){
      var { NlpManager } = require('node-nlp');       //natural language processing for chatbot
      const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }});
      //train the chatbot
     
      manager.addDocument('en', 'hello', 'greetings.hello');
      manager.addDocument('en', 'hi there', 'greetings.hello');
      manager.addDocument('en', 'hi', 'greetings.hello');
      manager.addDocument('en', 'hi there', 'greetings.hello');
      
      manager.addDocument('en', "Order", 'order');
      manager.addDocument('en', "Want to order something", 'order');
      manager.addDocument('en', "Want to order some pizza", 'order');
      manager.addDocument('en', "Menu", 'order');

      manager.addDocument('en', "Veg Pizza", 'veg');
      manager.addDocument('en',"Chesse Pizza", 'value');
      manager.addDocument('en',"Chilly Pizza", 'value');
      manager.addDocument('en',"Regular", 'size');
      manager.addDocument('en',"Medium", 'size');
      manager.addDocument('en',"Large", 'size');

      manager.addDocument('en',"Non-Veg Pizza", 'nveg')

      manager.addDocument('en',"Quantity of", 'quantity')

      manager.addDocument('en', "my name is %name%", 'name');
      manager.addDocument('en', "my address is %address%", 'address');

      manager.addAnswer('en','greetings.hello','Welcome to YoYo Pizza' )
      manager.addAnswer('en','order','Menu \
      <script> \
      $("button").click(function() { \
        var socket = io(); \
        var v_button = $(this).val(); \
        if(v_button === "1") \
           msg = "Veg Pizza"; \
        else \
           msg = "Non-Veg Pizza"; \
           setTimeout(function() {\
            socket.emit("chat message", msg); \
         }, 1); \
      }); \
      </script> \
      <br> \
      <button value="1" >Veg Pizza</button> \
      <button value="2" >Non-Veg Pizza</button>' )
      manager.addAnswer('en','veg',' Veg Pizza List \
      <script> \
      $("button").click(function() { \
        var socket = io(); \
        var v_button = $(this).val(); \
        if(v_button === "1") \
           msg = "Cheese Pizza"; \
        else \
          msg = "Chilly Pizza"; \
          setTimeout(function() {\
            socket.emit("chat message", msg); \
         }, 1); \
      }); \
      </script> \
      <br> \
      <button value="1" >Chesse Pizza</button> \
      <button value="2" >Chilly Pizza</button>' )
      manager.addAnswer('en','name','your address?' )
      manager.addAnswer('en','address','your phone number?' )
      manager.addAnswer('en','value','Size\
      <script> \
      $("button").click(function() { \
        var socket = io(); \
        var v_button = $(this).val(); \
        if(v_button === "1") \
           msg =  "Regular"; \
        else if(v_button === "2") \
         msg = "Medium"; \
        else \
          msg =  "Large"; \
          setTimeout(function() {\
            socket.emit("chat message", msg); \
         }, 100); \
      }); \
      </script> \
      <br> \
      <button value="1" >Regular</button> \
      <button value="2" >Medium</button> \
      <button value="3" > Large </button>' )

      manager.addAnswer('en','size','Number of pizza u need \
      <script> \
      $("button").click(function() { \
        var socket = io(); \
        var v_button = $(this).val(); \
        if(v_button === "1") \
           msg = "Quantity of 1"; \
        else if(v_button === "2")\
           msg = "Quantity of 2"; \
        else \
           msg = "Quantity of 3"; \
           setTimeout(function() {\
            socket.emit("chat message", msg); \
         }, 1); \
      }); \
      </script> \
      <br> \
      <button value="1" >1</button> \
      <button value="2" >2</button> \
      <button value="3" >3</button> ' )
       manager.addAnswer('en','quantity','any thing else\
       <script> \
      $("button").click(function() { \
        var socket = io(); \
        var v_button = $(this).val(); \
        if(v_button === "1") \
           msg = "Order"; \
        else if(v_button === "2")\
           msg = "Enough"; \
           setTimeout(function() {\
            socket.emit("chat message", msg); \
         }, 1); \
      }); \
      </script> \
      <br> \
      <button value="1" >order</button> \
      <button value="2" >Enough</button> ' )


      await manager.train();
      manager.save();
      var response = await manager.process('en', findStr);
      console.log(response);
      console.log(response.answer);
      return response.answer;
}

//serve the static html files
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
      console.log('user disconnected');
  });
  
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
    botstr(msg)
        .then(result => {
            if(result == null){
              io.emit('chat message', "Sorry :( Donno.<br>1. Search Songs<br>2. Try searching facts<br>3.TED talks will grow you");
            }
            else{
              io.emit('chat message', result);
            }
        });

  });
});

app.get('/pizza',(req,res)=>{
    mysqlConnection.query('SELECT * FROM pizza1',(err,rows,fields)=>{
        if(!err)
         res.json(rows)
        else
        console.log(err);
    });
});
app.post('/pizza1',(req,res)=>{
    let ord = req.body;
    mysqlConnection.query('INSERT INTO pizza1(name) VALUES (?)',[ord.name],(err,rows,fields)=>{
        if(!err)
         res.send('posted')
        else
        console.log(err);
    });
});

//server start
http.listen(8000, function(){
  console.log('listening on *:8000');
});