
let peerConnection;
let localStream;
let remoteStream;
var data_channel;
var data_channel_answer;
var data_channel_type;

var data_channal_created = false

var answer;
var got_answer = false;
var got_answer_stamp;

//// Websocket ////
//// For Signaling server
var server_ip = "192.168.8.113"
console.log("Server IP is ", server_ip)
let ws_url = "ws://" + server_ip +  ":6969/offer_client"
const ws = new WebSocket(ws_url)
// const ws = new WebSocket("wss://ros-dev.attraclab-console.com:9443/offer_client")

ws.addEventListener("open", () => {
    console.log("Connected to signaling server")
})
ws.addEventListener("message", ( message ) => {
    if (message.data.startsWith("restart_offer")){
        console.log(message.data)
        location.reload()
    } else{
        answer = message.data;
        console.log(answer)
        got_answer = true;
        got_answer_stamp = new Date().getTime()
        // addAnswer()
    }
   
})

///// For Local data server
let ws_local_url = "ws://localhost:8888/js_client"
const ws_local = new WebSocket(ws_local_url)

ws_local.addEventListener("open", () => {
    console.log("Connect with local server")
    ws_local.send("Hello from JS")
})

ws_local.addEventListener("message", ( message ) => {
    // console.log("got msg from local server " + message.data)
    if (data_channal_created){
        data_channel.send(message.data);
        // console.log(message.data)
    }
        
    
})

//// WebRTC ////
let servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 
                    'stun:stun2.l.google.com:19302']
        }
    ]
}

// just start user webcam 
let init = async () => {
    var deviceId = "961722b0b77d68efd5a59fe0ae1e0296a8a6eb00cf92996fab0b84ba0e741916"  // fake device of GoPro
    // var deviceId = "19c85837896160c2f52a6dbe822c08c6b26c60602660eba679046e758ab50035"     // Logicool C930e 
    const constraints = {
        audio: false,
        //video: {deviceId: deviceId ? {exact: deviceId} : undefined}
        video: true
    }

    localStream = await navigator.mediaDevices.getUserMedia(constraints)

    createOffer()
    
}

let creatPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(servers)

    // this is just video player of remoteStream but no track yet.
    // remoteStream = new MediaStream()
    // document.getElementById("user-video").srcObject = remoteStream

    // add track from localStream to peerConnection object
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    // once peer connection got track, just add peer track to remoteStream video player
    // peerConnection.ontrack = async (event) => {
    //     event.streams[0].getTracks().forEach((track) => {
    //         remoteStream.addTrack(track)
    //     })
    // }

    data_channel = peerConnection.createDataChannel("channel")
    data_channel.onmessage = async (message) => {
        console.log(message.data)
        ws_local.send(message.data)
    }
    data_channel.onopen = e => {
        console.log("Connection Opened")
        data_channal_created = true
    }
    data_channel.onclose = e => {
        console.log("Closed data channel")
        data_channal_created = false
        location.reload()
    }

    data_channel_type = "offer"

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            // document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
            console.log("ice candidate " + JSON.stringify(peerConnection.localDescription))
            try{
                ws.send(JSON.stringify(peerConnection.localDescription))
            }
            catch (error){
                console.log(error)
                location.reload()
            }
        }
    }
}

let createOffer = async () => {
    
    creatPeerConnection()

    // create offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    // display offer on text area of offer-sdp

    // document.getElementById("offer-sdp").value = JSON.stringify(offer)
    console.log("offer " + JSON.stringify(offer))

    ws.send(JSON.stringify(offer))
}


let addAnswer = async () => {

    // let answer = document.getElementById('answer-sdp').value 
    // if (!answer) return alert('Retrieve answer from peer first')

    answer = JSON.parse(answer)
    peerConnection.setRemoteDescription(answer)
    // checking 1st peer doesn't have remoteDescription yet
    // then set it from answer we paste on textarea
    // if (!peerConnection.currentRemoteDescription){
    //     peerConnection.setRemoteDescription(answer)
    // }
}

let sendDataChannel = async () => {

    let data = document.getElementById("chat-send").value
    data_channel.send(data);
    
}

init()

var interval = setInterval(add_answer_callback, 1000)

function add_answer_callback(){
    if (got_answer === true){
        var got_answer_period = new Date().getTime() - got_answer_stamp;
        console.log("got answer period " + got_answer_period)
        if (got_answer_period > 2000){
            console.log("addAnswer=>>>>>>")
            addAnswer()
            got_answer = false
        }
    }
}
