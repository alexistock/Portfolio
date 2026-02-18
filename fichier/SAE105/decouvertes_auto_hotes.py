from scapy.all import IP , sr1, ICMP, srp, send, Ether, ARP, sniff
import sys
import os
def decouverte_active(adresseIP):
    rep = sr1(IP(dst=adresseIP)/ ICMP (), timeout =0.5)  
    print(rep)
    if 'echo-reply 0' in str(rep):
        return True

def recherche_passive(adresse_IP):
    print(f'Rehcerhe passive de {adresse_IP} :')
    def pkt_callback(pkt, adresse_IP): #Packet que l'on recherche , adresse_IP cible
        if ARP in pkt and pkt[ARP].op in [1, 2]: #recherche si le packet est ARP et qu'il fait partit d'une operation 1 ou 2
            if pkt[ARP].psrc == adresse_IP or pkt[ARP].pdst == adresse_IP: # Si IP de destination trouver ou IP source  est égale a IP_adresse
                print(f"IP cible {adresse_IP} trouvée. Arrêt du programme.")
                sys.exit(0)
    # Utilisez la fonction sniff pour capturer les messages ARP
    try:
        sniff(prn=lambda x: pkt_callback(x, adresse_IP), filter="arp", store=0)
        """ 
        filter ='arp' indique de ne prendre quanq consideration les packet arp
        store = 0 ne pas stoquer en mémoire les packet arp  
        """
    except KeyboardInterrupt:
        print("\nCapture arrêtée par l'utilisateur.")
def exportation_en_txt(résultat, adresseIP):
    path = os.getcwd()
    chemin_acces = (str(os.path.realpath(path)) + str(sys.argv[4]))
    with open(chemin_acces, 'w') as fichier:
        fichier.write(f"L'adresse {adresseIP} est {résultat}")

                

def ensembles_des_hotes(adresse):
    lst = []
    adresse, boucle = adresse_du_reseau(adresse)
    for i in range(boucle):
        if decouverte_active(adresse[:(len(adresse))-1]+f'{i}'):
            lst.append(adresse[:(len(adresse))-1]+f'{i}')
    return lst, adresseIP
def adresse_du_reseau(adresseIP):
    for i in range(len(adresseIP)):
        if adresseIP[i] == '/':
            bit_host = 32-int(adresseIP[i+1:])
    longeure_boucle = 2**bit_host
    compteur = 0 
    compteur_de_point = 0
    if bit_host == 8:
        compteur_de_point = 3
    if bit_host == 16: 
        compteur_de_point = 2
    if bit_host == 24:
        compteur_de_point = 1
    #while compteur == compteur_de_point:
    for i in range(len(adresseIP)):
        if adresseIP[i]=='.':
            compteur +=1
        if compteur == compteur_de_point:
            adresse_reseau = adresseIP[:i]+'.0'*(4-compteur_de_point)
            break
    return(adresse_reseau,longeure_boucle)
#ensembles_des_hotes(adresseIP)

if __name__ == '__main__':
    adresseIP = sys.argv[2] 
    if len(sys.argv) < 1:
        print("Aucune option n'as étés séléctioner") 
    if len(sys.argv) == 1:
        print("Aucune IP a été donner en arguments")

    if str(sys.argv[1]) == '-a':
        if decouverte_active(str(adresseIP)):
            print(f"l'hote ayant l'adresse IP {adresseIP} est bien joignable")
            if len(sys.argv) >= 3:
                if str(sys.argv[3]) == '-x':
                    exportation_en_txt(True, adresseIP)
        else: 
            print(f"l'hote ayant l'adresse IP {adresseIP} n'est pas joignable")
            if len(sys.argv) >= 3:
                if str(sys.argv[3]) == '-x':
                    exportation_en_txt(False, adresseIP)
    if str(sys.argv[1]) == '-t':
        lst_IP,adresse_reseau = ensembles_des_hotes(adresseIP)
        if len(lst_IP) == 0:
            print(f"Aucun hotes du réseau {adresse_reseau}, n'est présent ou étectable dans le réseaux") 
        else:
            print(f"Les hotes suivants son présent dans le réseau {adresse_reseau} : \n")
            for i in range(len(lst_IP)):
                print(f'{i+1}): {lst_IP[i]}')
    if str(sys.argv[1]) == '-p':
        recherche_passive(str(adresseIP))
        