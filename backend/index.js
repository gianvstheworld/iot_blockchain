const mqtt = require('mqtt');
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configurações MQTT
const MQTT_BROKER = 'mqtt://mosquitto'; 
const MQTT_TOPIC_REGISTER = 'iot/device/register';
const MQTT_TOPIC_RESOURCE_REQUEST = 'iot/device/resource_request';

// Configurações Blockchain
const GANACHE_URL = process.env.RPC_URL || 'http://ganache:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 
const ABI_PATH = path.join(__dirname, 'abis', 'DeviceRegistry.json');

// Carregar ABI do contrato
let contractABI;
try {
    const contractData = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));
    contractABI = contractData.abi;
} catch (error) {
    console.error('Erro ao carregar o ABI do contrato:', error);
    process.exit(1);
}

// Configurar o provedor e o contrato
const provider = new ethers.providers.JsonRpcProvider(GANACHE_URL);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    console.error('Erro: A variável de ambiente PRIVATE_KEY não está definida.');
    process.exit(1);
}
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Armazena informações sobre dispositivos registrados e suas taxas de consumo
const registeredDevices = new Map();

const connectProvider = async (provider, retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const network = await provider.getNetwork();
            console.log(`Conectado à rede: ${network.name} (chainId: ${network.chainId})`);
            return;
        } catch (error) {
            console.error(`Tentativa ${i + 1} falhou: ${error.message}`);
            if (i < retries - 1) {
                console.log(`Aguardando ${delay / 1000} segundos antes da próxima tentativa...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('Não foi possível conectar ao provider após várias tentativas.');
                process.exit(1);
            }
        }
    }
};

// Chamar a função para conectar ao provider com retry logic
connectProvider(provider);

// Configurar o servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

// Rota para listar dispositivos registrados
app.get('/devices', async (req, res) => {
    try {
        const registeredDevicesList = [];

        // Para cada dispositivo registrado, são obtidos os detalhes e a taxa de consumo
        for (const [deviceId, info] of registeredDevices) {
            const isRegistered = await contract.isDeviceRegistered(deviceId);

            if (isRegistered) {
                const credit = await contract.getCredit(deviceId);
                registeredDevicesList.push({
                    deviceId: deviceId,
                    type: info.type,
                    importance: info.importance,
                    consumptionRate: info.consumptionRate,
                    owner: wallet.address,
                    credit: credit.toString(),
                    isRegistered: isRegistered
                });
            }
        }

        res.json(registeredDevicesList);
    } catch (error) {
        console.error('Erro ao listar dispositivos:', error);
        res.status(500).json({ error: 'Erro ao listar dispositivos' });
    }
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Conectar ao broker MQTT
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('Conectado ao broker MQTT');
    client.subscribe([MQTT_TOPIC_REGISTER, MQTT_TOPIC_RESOURCE_REQUEST], (err) => {
        if (!err) {
            console.log(`Subscreveu aos tópicos: ${MQTT_TOPIC_REGISTER}, ${MQTT_TOPIC_RESOURCE_REQUEST}`);
        } else {
            console.error('Erro ao subscrever aos tópicos MQTT:', err);
        }
    });
});

async function handleResourceRequest(deviceId) {
    try {
        const isRegistered = await contract.isDeviceRegistered(deviceId);

        if (!isRegistered) {
            console.log(`Dispositivo ${deviceId} não está registrado. Ignorando solicitação.`);
            return;
        }

        const currentCredit = await contract.getCredit(deviceId);

        // O custo é determinado pela função `allocateResources` no contrato com base no `consumptionRate`
        if (currentCredit < registeredDevices.get(deviceId).consumptionRate) {
            console.log(`Dispositivo ${deviceId} tem crédito insuficiente.`);
        } else {
            // Chama `allocateResources` com apenas o `deviceId`
            const tx = await contract.allocateResources(deviceId);
            await tx.wait();
            console.log(`Recursos alocados para o dispositivo ${deviceId}. Novo crédito: ${currentCredit - registeredDevices.get(deviceId).consumptionRate}`);
        }
    } catch (error) {
        console.error(`Erro ao processar solicitação de recurso para ${deviceId}:`, error.message);
    }
}

// Processa mensagens de registro e de requisição de recursos de dispositivos
client.on('message', async (topic, message) => {
    let deviceData;
    
    try {
        deviceData = JSON.parse(message.toString());
    } catch (error) {
        deviceData = { deviceId: message.toString() };
    }

    const { deviceId, type, importance, consumptionRate } = deviceData;
    
    if (topic === MQTT_TOPIC_REGISTER) {
        try {
            const isRegistered = await contract.isDeviceRegistered(deviceId);

            if (!isRegistered) {
                const rate = consumptionRate; // Define uma taxa padrão se não for fornecida
                const tx = await contract.registerDevice(deviceId, rate);
                await tx.wait();
                console.log(`Dispositivo ${deviceId} registrado no blockchain.`);

                // Adiciona o dispositivo e suas informações ao registro local
                registeredDevices.set(deviceId, { type, importance, consumptionRate: rate });
            } else {
                console.log(`Dispositivo ${deviceId} já está registrado.`);
            }
        } catch (error) {
            console.error(`Erro ao registrar dispositivo: ${error.message}`);
        }
    } else if (topic === MQTT_TOPIC_RESOURCE_REQUEST) {
        await handleResourceRequest(deviceId);
    }
});

client.on('error', (err) => {
    console.error('Erro no cliente MQTT:', err);
});
