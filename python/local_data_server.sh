#!/bin/bash

#cd /home/ubuntu/web_dev/museum_bot_v3/python

while true
do
    echo "Start local_data_server.py"
    python3 -u local_data_server.py
    echo "---- program crashed ----"
    sleep 1
done