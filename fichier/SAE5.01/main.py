import time
import pycom
import ubinascii
import machine                  # <- ajouté pour éviter NameError
from machine import Pin, deepsleep
from network import LoRa
import socket
from L76GNSS import L76GNSS
from LIS2HH12 import LIS2HH12

# --- Paramètres LoRa/OTAA ---
APP_EUI = ubinascii.unhexlify('0000000000000000')
DEV_EUI = ubinascii.unhexlify('F008D1FFFECD11EC')
APP_KEY = ubinascii.unhexlify('9344383E2926AEC0E261B8479540F512')

# --- LED ---
pycom.heartbeat(False)
pycom.rgbled(0x000000)

# --- Hardware init ---
acc = LIS2HH12()
l76 = L76GNSS(timeout=30)

# --- Config wake pin (INT du LIS2HH12) ---
WAKE_PIN = 'P13'
pin_wake = Pin(WAKE_PIN, mode=Pin.IN, pull=Pin.PULL_DOWN)

# Configure hardware wake-up pour deep sleep
if hasattr(machine, 'pin_deepsleep_wakeup'):
    machine.pin_deepsleep_wakeup([pin_wake], machine.WAKEUP_ANY_HIGH, True)
else:
    print("Wake-up hardware non supporté sur ce firmware")

# Configure LIS2HH12 pour générer l'interrupt sur activité
acc.enable_activity_interrupt(threshold=300, duration=200, handler=None)

# --- LoRa join ---
def lora_join_otaa(dev_eui, app_eui, app_key):
    pycom.rgbled(0x101000)
    lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
    for i in range(3, 16):
        try: lora.remove_channel(i)
        except: pass
    try:
        lora.add_channel(0, frequency=868100000, dr_min=0, dr_max=5)
        lora.add_channel(1, frequency=868300000, dr_min=0, dr_max=5)
        lora.add_channel(2, frequency=868500000, dr_min=0, dr_max=5)
    except Exception as e:
        print("Warning config channels:", e)
    while not lora.has_joined():
        try:
            lora.join(activation=LoRa.OTAA, auth=(dev_eui, app_eui, app_key))
        except: pass
        print("En attente de join...")
        time.sleep(2)
    pycom.rgbled(0x00FF00)
    try: lora.nvram_save()
    except: pass
    return lora

# --- Encode GPS lat/lon en 6 octets ---
def encode_latlon_3bytes(lat, lon):
    MAX24 = 16777215
    lat_norm = int((lat + 90.0) / 180.0 * MAX24)
    lon_norm = int((lon + 180.0) / 360.0 * MAX24)
    return bytearray([
        (lat_norm >> 16) & 0xFF, (lat_norm >> 8) & 0xFF, lat_norm & 0xFF,
        (lon_norm >> 16) & 0xFF, (lon_norm >> 8) & 0xFF, lon_norm & 0xFF
    ])

# --- Main ---
def main():
    print("Démarrage normal ou après wake-up hardware.")
    pycom.rgbled(0x00AA00)

    lora = lora_join_otaa(DEV_EUI, APP_EUI, APP_KEY)
    s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
    s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)
    s.setblocking(True)

    compteur = 0
    while True:
        compteur += 1
        print("=== Iteration %d ===" % compteur)
        pycom.rgbled(0x0000AA)

        lat_lon = l76.coordinates()
        if lat_lon and lat_lon[0] is not None:
            lat, lon = lat_lon[0], lat_lon[1]
            payload = encode_latlon_3bytes(lat, lon)
            print("GPS -> lat:", lat, "lon:", lon)
            print("Payload hex:", ubinascii.hexlify(payload))
            try:
                s.setblocking(True)
                s.send(bytes(payload))
                print("Uplink envoyé")
            except Exception as e:
                print("Erreur envoi LoRa:", e)
        else:
            print("Pas de fix GPS, envoi PING")
            try:
                s.setblocking(True)
                s.send(b'PING')
            except Exception as e:
                print("Erreur envoi PING:", e)

        # Downlink check
        s.setblocking(False)
        time.sleep(1)
        try:
            data = s.recv(64)
            if data:
                print("Downlink reçu:", data)
                if data == b"STOP" or data == b'\x01':
                    print(">>> STOP reçu -> deep sleep avec wake-up hardware")
                    pycom.rgbled(0x000022)
                    time.sleep(0.2)
                    deepsleep()
        except Exception as e:
            print("Erreur lecture downlink:", e)

        print("Attente 10 secondes avant prochaine itération...\n")
        time.sleep(10)

if __name__ == "__main__":
    try:
        main()
    except Exception as ex:
        print("Exception:", ex)
        time.sleep(5)
