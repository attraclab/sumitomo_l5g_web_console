
let peerConnection;
let localStream;
let remoteStream;
var data_channel;
var data_channel_answer;
var data_channel_type;
var offer;
var webrtc_connected = false;

var json_ros_data;
var json_console_data = {
    'enable_nav' : false,
    'up': false,
    'down': false,
    'left': false,
    'right': false
}

var rc_mode = "UNKNOWN";
var auto_nav = "UNKNOWN";

//// Websocket ////
// const ws = new WebSocket("wss://ros-dev.attraclab-console.com:9443/answer_client")  // wss
var server_ip = "192.168.8.113"
console.log("Server IP is ", server_ip)
let ws_url = "ws://" + server_ip +  ":6969/answer_client"
var ws = new WebSocket(ws_url)     // ws
ws.addEventListener("open", () => {
        console.log("Connected to signaling server")
})
ws.addEventListener("message", ( message) => {
    // console.log("Got msg as " + message.data)
    offer = message.data;
    console.log(offer)
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
    
    // localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    // document.getElementById("user-video").srcObject = localStream
    
}

let creatPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(servers)

    // this is just video player of remoteStream but no track yet.
    remoteStream = new MediaStream()
    document.getElementById("robot-video").srcObject = remoteStream

    // add track from localStream to peerConnection object
    // localStream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, localStream)
    // })

    // once peer connection got track, just add peer track to remoteStream video player
    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    // create data channel
   
    peerConnection.ondatachannel = (event) => {
        //create data channel from what we got
        data_channel_answer = event.channel;
        data_channel_answer.onmessage = async (message) => {
            // console.log("New message from client " + message.data)

            json_ros_data = JSON.parse(message.data)
            rc_mode = json_ros_data.rc_mode
            auto_nav = json_ros_data.wf_status

        }
        data_channel_answer.onopen = e => {
            console.log("Connection opneddddd!!");
            webrtc_connected = true;
        } 
    }
    data_channel_type = "answer"
    
    

    // every ICE candidate got updated, we also want it to update on textarea of offer-sdp
    // normally ICE candidate can be slower than createOffer, so we can add this later
    // by using peerConnection.localDescription
    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            // document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
            console.log("ice candidate " + JSON.stringify(peerConnection.localDescription))
            ws.send(JSON.stringify(peerConnection.localDescription))
        }
    }

}

let createAnswer = async () => {

    creatPeerConnection()

    // let offer = document.getElementById("offer-sdp").value
    // if (!offer) return alert('Retrieve offer from peer first')

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)

    // answer of second peer should be localDescription of itself
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    // put answer of peerConnection to textarea
    // document.getElementById('answer-sdp').value = JSON.stringify(answer)
    console.log("created answer " + answer)
    ws.send(JSON.stringify(answer))

}

const sendData = () => {

    let data = JSON.stringify(json_console_data);
    data += "\n";
    console.log(data);
    
    try{
        data_channel_answer.send(data);

    }
    catch(err){
      console.log(err.message);
    }
    
  };
