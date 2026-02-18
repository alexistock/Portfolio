import paho.mqtt.client as mqtt
import time

Brocker = "test.mosquitto.org"
topic = "IUT/Colmar2024/SAE2.04/Maison1"

def on_connect(client, userdata, flags, rc):
    print(f"Connecter avec le code {rc}")
    client.subscribe(topic)
    print(f"Souscrit au topic: {topic}")

def on_message(client, userdata, msg):
    message = msg.payload.decode()
    print(f"Messages recu sur {msg.topic} {message}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(Brocker, 1883, 60)
try:
    client.loop_start()
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    client.loop_stop()
    print("Arret script")