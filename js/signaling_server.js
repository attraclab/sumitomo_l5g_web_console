//// For https SSL /////
// const fs = require('fs');
// const https = require('https');

// var privateKey  = fs.readFileSync('/home/ubuntu/privkey.pem', 'utf8');
// var certificate = fs.readFileSync('/home/ubuntu/fullchain.pem', 'utf8');

// var credentials = {key: privateKey, cert: certificate};
// var express = require('express');


// var app = express();


// const httpsServer = https.createServer(credentials, app)
// httpsServer.listen(9443);

// console.log("Server is running...")

// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({
//     server: httpsServer
    
// });

//// For local test ////
const { server } = require('websocket')
const WebSocket = require('ws')

const wss = new WebSocket.Server( {port: 6969} )


//// Code Start ////
var offer;
var answer;
var ws_offer;
var ws_answer;

wss.on('connection', (ws,req) => {

    
    ws.uuid = req.url.replace('/?uuid=', '')
    console.log("New client connected as " + ws.uuid)

    if (ws.uuid === '/offer_client'){
        ws_offer = ws
    }

    if (ws.uuid === "/answer_client"){
        ws_answer = ws
        ws_answer.send(JSON.stringify(offer))
        console.log("send offer to /anwser_client")
    }

    ws.on('message', message => {

        // console.log("got message " + message)
        if (ws.uuid === "/offer_client"){
            console.log("got offer")
            offer = JSON.parse(message)
            // console.log(offer)
            // console.log("got message " + message)
        } else if (ws.uuid === "/answer_client"){
            console.log("got answer")
            answer = JSON.parse(message)
            ws_offer.send(JSON.stringify(answer))
            console.log("send answer to /offer_client")
        }
    })

    ws.on('close', () => {

        console.log(`client ${ws.uuid} got disconnected`)

        if (ws.uuid === "/offer_client"){
            ws_offer = null
        } else if (ws.uuid === "/answer_client"){
            ws_answer = null
            // when answer closed, we send some text to offer
            // to let it refresh its page automatically

            
            if (ws_offer !== null){
                restart_msg = "restart_offer"
                ws_offer.send(restart_msg)
            }
            
        }
    })
})