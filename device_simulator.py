import paho.mqtt.client as mqtt
import time
import uuid
import json

# Configurações do broker MQTT
BROKER = "localhost"
PORT = 1883
TOPIC_REGISTER = "iot/device/register"
TOPIC_RESOURCE_REQUEST = "iot/device/resource_request"

# Dicionário de tipos de dispositivo e seus pesos
DEVICE_TYPE_WEIGHTS = {
    "Sensor de Temperatura": 1,
    "Atuador": 2,
    "Câmera": 5,
    "Sensor de Movimento": 3,
    "Controlador": 4
}

# Armazena informações dos dispositivos criados
devices = {}

def calculate_consumption_rate(device_type, importance):
    # Obtém o peso do tipo de dispositivo e calcula a taxa com base na importância
    base_rate = DEVICE_TYPE_WEIGHTS.get(device_type, 1) 
    consumption_rate = base_rate * importance
    return consumption_rate

def register_device(client):
    device_id = str(uuid.uuid4())  # Gera um ID único
    print("Tipos de dispositivos disponíveis:")
    for device_type in DEVICE_TYPE_WEIGHTS:
        print(f"- {device_type}")
    device_type = input("Escolha o tipo de dispositivo: ")
    importance = int(input("Digite a importância do dispositivo (1 a 5, onde 5 é mais importante): "))
    
    # Calcula a taxa de consumo automaticamente
    consumption_rate = calculate_consumption_rate(device_type, importance)
    
    # Salva o dispositivo no dicionário com as informações
    devices[device_id] = {
        "type": device_type,
        "importance": importance,
        "consumption_rate": consumption_rate
    }
    
    # Publica o registro do dispositivo como JSON
    device_data = {
        "deviceId": device_id,
        "type": device_type,
        "importance": importance,
        "consumptionRate": consumption_rate
    }
    print(f"Registrando dispositivo com ID: {device_id}, tipo: {device_type}, importância: {importance}, taxa de consumo: {consumption_rate}")
    client.publish(TOPIC_REGISTER, json.dumps(device_data))
    return device_id

def request_resource(client, device_id):
    device = devices.get(device_id)
    if device:
        print(f"Dispositivo {device_id} ({device['type']}) solicitando recursos com taxa de consumo {device['consumption_rate']}...")
        client.publish(TOPIC_RESOURCE_REQUEST, device_id)
    else:
        print("Dispositivo não encontrado!")

def main():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)

    while True:
        print("\n==== Simulador de Dispositivos IoT ====")
        print("1. Registrar novo dispositivo")
        print("2. Solicitar recursos para dispositivo")
        print("3. Listar dispositivos registrados")
        print("4. Sair")
        choice = input("Escolha uma opção: ")
        
        if choice == "1":
            # Registra um novo dispositivo
            device_id = register_device(client)
            time.sleep(1)  
        elif choice == "2":
            # Solicita recursos para um dispositivo
            if not devices:
                print("Nenhum dispositivo registrado. Por favor, registre um dispositivo primeiro.")
            else:
                print("Dispositivos disponíveis:")
                for device_id, info in devices.items():
                    print(f"{device_id} - Tipo: {info['type']} | Taxa de consumo: {info['consumption_rate']}")
                selected_id = input("Digite o ID do dispositivo para solicitar recursos: ")
                if selected_id in devices:
                    request_resource(client, selected_id)
                    time.sleep(2)
                else:
                    print("ID do dispositivo não encontrado.")
        elif choice == "3":
            # Lista todos os dispositivos registrados
            if not devices:
                print("Nenhum dispositivo registrado.")
            else:
                print("Dispositivos Registrados:")
                for device_id, info in devices.items():
                    print(f"ID: {device_id} | Tipo: {info['type']} | Importância: {info['importance']} | Taxa de consumo: {info['consumption_rate']}")
        elif choice == "4":
            print("Saindo...")
            break
        else:
            print("Opção inválida. Tente novamente.")
    
    client.disconnect()

if __name__ == "__main__":
    main()
