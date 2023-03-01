
///////////////////////
/// Connect WebRTC  ///
/// after 3 seconds ///
///////////////////////
function start_connect(){

    console.log("Start auto connect")
    createAnswer()
}

setTimeout(start_connect, 3000)

///////////////////////////
/// Ask to refresh      ///
/// if takes to long... ///
///////////////////////////
setTimeout(askToRefreshIfNotConnected, 8000)

function askToRefreshIfNotConnected() {
    // if (confirm("It's taking too long for connection..\n Please press OK to refresh")) {
    //     location.reload()
    // } 
    if (webrtc_connected !== true){
        alert("It's taking too long for connection..\n Please press OK to refresh")
        location.reload()
    }
    
}

///////////////////
/// Main loop   ///
/// running 1Hz ///
///////////////////
var loop_interval = setInterval(loop_callback, 1000);

function loop_callback(){

    document.getElementById("rc_mode").innerHTML = rc_mode;
    document.getElementById("auto_nav_mode").innerHTML = auto_nav;
}

////////////////////////
/// Buttons function ///
////////////////////////
var from_press_up = false;
var from_press_down = false;
var from_press_left = false;
var from_press_right = false;

function press_up(){

    json_console_data.up = true;
    json_console_data.down = false;
    json_console_data.left = false;
    json_console_data.right = false;
    from_press_up = true;
    sendData();
}

function release_up(){
    if (from_press_up === true){
        json_console_data.up = false;
        from_press_up = false;
        sendData();
    }
}

function press_down(){

    json_console_data.up = false;
    json_console_data.down = true;
    json_console_data.left = false;
    json_console_data.right = false;
    from_press_down = true;
    sendData();
}

function release_down(){
    if (from_press_down === true){
        json_console_data.down = false;
        from_press_down = false;
        sendData();
    }
}

function press_left(){

    json_console_data.up = false;
    json_console_data.down = false;
    json_console_data.left = true;
    json_console_data.right = false;
    from_press_left = true;
    sendData();
}

function release_left(){
    if (from_press_left === true){
        json_console_data.left = false;
        from_press_left = false;
        sendData();
    }
}

function press_right(){

    json_console_data.up = false;
    json_console_data.down = false;
    json_console_data.left = false;
    json_console_data.right = true;
    from_press_right = true;
    sendData();
}

function release_right(){
    if (from_press_right === true){
        json_console_data.right = false;
        from_press_right = false;
        sendData();
    }
}

function send_enable_wf(){

    json_console_data.enable_nav = true;
    sendData()
}

function send_disable_wf(){

    json_console_data.enable_nav = false;
    sendData()
}

///////////////
/// Gamepad ///
//////////////
let gamepadIndex;
var total_buttons;
var gamepad;
var gp_up = false;
var prev_gp_up = gp_up;
var gp_down = false;
var prev_gp_down = gp_down;
var gp_left = false;
var prev_gp_left = gp_left;
var gp_right = false;
var prev_gp_right = gp_right;

window.addEventListener('gamepadconnected', (event) => {
    console.log("Gamepad is connected")
    gamepadIndex = event.gamepad.index;
});

var gamepad_interval = setInterval(gamepad_loop, 100)

function gamepad_loop(){
    if (gamepadIndex !== undefined){
        gamepad = navigator.getGamepads()[gamepadIndex];
        total_buttons =  gamepad.buttons.length

        gp_up = gamepad.buttons[12].pressed
        gp_down = gamepad.buttons[13].pressed
        gp_left = gamepad.buttons[14].pressed
        gp_right = gamepad.buttons[15].pressed

        if (gp_up !== prev_gp_up){
            if (gp_up === true){
                press_up()
            } else {
                release_up()
            }
        }

        if (gp_down !== prev_gp_down){
            if (gp_down === true){
                press_down()
            } else {
                release_down()
            }
        }

        if (gp_left !== prev_gp_left){
            if (gp_left === true){
                press_left()
            } else {
                release_left()
            }
        }

        if (gp_right !== prev_gp_right){
            if (gp_right === true){
                press_right()
            } else {
                release_right()
            }
        }

        prev_gp_up = gp_up
        prev_gp_down = gp_down
        prev_gp_left = gp_left
        prev_gp_right = gp_right

    }
}