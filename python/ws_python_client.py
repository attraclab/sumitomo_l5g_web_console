
import websocket as ws
import rel
import signal, sys
import json
import time
import threading
import socket
import pickle

SEND_PORT = 7777
RECV_PORT = 6666
IP = "127.0.0.1"
send_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

recv_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
recv_sock.bind(("0.0.0.0", RECV_PORT))
recv_sock.setblocking(0)


wsurl = "ws://" + server_ip + ":8888/python_client"

start_once = True

def sigint_handler(signal, frame):
    print("Keyboard interrupt")
    sys.exit(0)

def on_message(wsapp, msg):
    # recv_data = json.loads(msg)
    print(msg)
    # print(recv_data)
    dump_packets = pickle.dumps(msg, protocol=2) ## we run json_ros_converter on python2
    send_sock.sendto(dump_packets,(IP, SEND_PORT))

def on_error(wsapp, error):
    global sender_thread
    sys.exit(0)
    print("ERROR", error)


def on_close(wsapp, close_status_code, close_msg):
    print("### closed ###")

def on_open(wsapp):
    global sender_thread, start_once
    print("Opened connection")
    if start_once:
        sender_thread.start()
        start_once = False

def sender_worker(wsapp):

    count = 0
    time.sleep(1)
    print("Start sender thread")
    while True:
        # count += 1
        # obj_data = {"count": count}
        # json_data = json.dumps(obj_data)
        # wsapp.send(json_data)
        # time.sleep(1)

        try:
            data, addr = recv_sock.recvfrom(60000)
            parse_data = pickle.loads(data)
        except socket.error:
            pass
        else:
            json_data = json.dumps(parse_data)
            try:
                wsapp.send(json_data)
            except Exception as e:
                print("Error in sender_worker")
                print(e)
                break
                sys.exit(0)

        time.sleep(0.001)

    

if __name__ == "__main__":
    # ws.enableTrace(True)
    global sender_thread

    signal.signal(signal.SIGINT, sigint_handler)

    wsapp = ws.WebSocketApp(wsurl, 
                            on_message=on_message,
                            on_open=on_open,
                            on_error=on_error,
                            on_close=on_close)

    sender_thread = threading.Thread(target=sender_worker, args=(wsapp,), daemon=True)

    wsapp.run_forever(dispatcher=rel) ## on Jetson nano ubuntu18.04 there is no reconnect keyword
    rel.signal(2, rel.abort)  # Keyboard Interrupt
    rel.dispatch()