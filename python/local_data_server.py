
import websockets
import asyncio
import threading
import socket
import pickle
import json
import time
import sys

# RECV_PORT = 6666
# recv_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# recv_sock.bind(("0.0.0.0", RECV_PORT)
# recv_sock.setblocking(0)

# global ws_client1, ws_client2, ws_js
global ws_js, ws_python
ws_js = None
ws_python = None

WS_PORT = 8888

print("Server is running on port {}".format(WS_PORT))

async def echo(websocket, path):

    global ws_js, ws_python

    print("New client connected as {}".format(path))

    if (path == "/python_client"):
        ws_python = websocket
        print("here")
    elif (path == "/js_client"):
        ws_js = websocket

    try:
        async for message in websocket:
            # print("Recv from client {}".format(message))
            # await websocket.send("From server!!!")
            # print("ws_js", ws_js)
            # print("ws_python", ws_python)
            if path == "/python_client":
                if ws_js != None:
                    await ws_js.send(message)
                # print(message)
            elif path == "/js_client":
                # await ws_js.send("FOR JS FROM SERVER")
                # print(type(message))
                print("Got console_data")
                if (ws_python != None) and message.startswith("{"):
                    await ws_python.send(message)
            else:
                await websocket.send("send to unknown..")
    except websockets.exceptions.ConnectionClosed as e:
        print("Client disconnected")
        sys.exit(0)


start_server = websockets.serve(echo, "localhost", WS_PORT)

# udp_recv_thread = threading.Thread(target=between_callback, daemon=True)
# udp_recv_thread.start()

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()