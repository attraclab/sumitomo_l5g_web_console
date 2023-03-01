import rospy
from std_msgs.msg import Bool, Int8MultiArray, UInt8, String
import socket
import pickle
import time
import numpy as np
import json
import codecs

SEND_PORT = 6666
RECV_PORT = 7777
IP = "127.0.0.1"
send_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
send_packets = {
			'rc_mode': "HOLD",
			'wf_status': "Disable"
		 
		}

recv_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
recv_sock.bind(("0.0.0.0", RECV_PORT))
recv_sock.setblocking(0)

class JsonRosConverter:

	def __init__(self):

		rospy.init_node("json_ros_converter_node", anonymous=True)

		self.control_button_pub = rospy.Publisher("/nav/control_button", Int8MultiArray, queue_size=1)
		self.control_button_msg = Int8MultiArray()

		self.nav_enable_pub = rospy.Publisher("/nav/enable", Bool, queue_size=1)
		self.nav_enable_msg = Bool()

		self.nav_enable = False
		self.prev_nav_enable = False

		rospy.Subscriber("/jmoab/cart_mode", UInt8, self.cart_mode_callback)
		rospy.Subscriber("/nav/wf_status", String, self.wf_status_callback)

		self.loop()

		rospy.spin()

	def cart_mode_callback(self, msg):

		if msg.data == 0:
			send_packets['rc_mode'] = "RC HOLD"
		elif msg.data == 1:
			send_packets['rc_mode'] = "RC MANUAL"
		elif msg.data == 2:
			send_packets['rc_mode'] = "WEBRTC"
		else:
			send_packets['rc_mode'] = "RC UNKNOWN"

	def wf_status_callback(self, msg):

		send_packets['wf_status'] = msg.data

	def loop(self):

		rate = rospy.Rate(20)
		from_pressed = False
		
		print("Start json_ros_converter")
		while not rospy.is_shutdown():

			try:
				data, addr = recv_sock.recvfrom(10000)
				parse_data = pickle.loads(data)
				# print(parse_data)
			except socket.error:
				pass
			else:
				parse_data = json.loads(parse_data)

				## Cart control
				if ((parse_data['up'] == False) or (parse_data['left'] == False) or (parse_data['right'] == False) or (parse_data['down'] == False)) and from_pressed:
					self.control_button_msg.data = [0,0,0,0]
					self.control_button_pub.publish(self.control_button_msg)

					from_pressed = False

				elif ((parse_data['up'] == True) or (parse_data['left'] == True) or (parse_data['right'] == True) or (parse_data['down'] == True)):
					if parse_data['up'] == True:
						print("up")
						self.control_button_msg.data = [1,0,0,0]
						self.control_button_pub.publish(self.control_button_msg)
					elif parse_data['left'] == True:
						print("left")
						self.control_button_msg.data = [0,1,0,0]
						self.control_button_pub.publish(self.control_button_msg)
					elif parse_data['right'] == True:
						print("right")
						self.control_button_msg.data = [0,0,1,0]
						self.control_button_pub.publish(self.control_button_msg)
					elif parse_data['down'] == True:
						print("down")
						self.control_button_msg.data = [0,0,0,1]
						self.control_button_pub.publish(self.control_button_msg)

					from_pressed = True

				elif ((parse_data['enable_nav'] == True) or (parse_data['enable_nav'] == False)):

					# if self.prev_nav_enable != parse_data['enable_nav']:
					print("enable_nav {}".format(parse_data['enable_nav']))
					self.nav_enable = parse_data['enable_nav']

					self.nav_enable_msg.data = parse_data['enable_nav']
					self.nav_enable_pub.publish(self.nav_enable_msg)

					self.prev_nav_enable = parse_data['enable_nav']
					
				else:
					print("control buttons didn't get pressed..")


			dump_packets = pickle.dumps(send_packets)
			send_sock.sendto(dump_packets,(IP, SEND_PORT))


			rate.sleep()

if __name__ == "__main__":

	JsonRosConverter()