# Integração de Segurança em IoT Utilizando Blockchain

Este repositório contém o código-fonte e a documentação do projeto **Segurança em IoT com Blockchain**, que explora a aplicação da tecnologia blockchain para aprimorar a segurança em dispositivos de Internet das Coisas (IoT).

## Descrição

O projeto tem como objetivo desenvolver uma solução que integra blockchain com IoT para resolver desafios de segurança comuns nesse campo. Utilizando a plataforma Ethereum e contratos inteligentes escritos em Solidity, o sistema permite:

- Registro seguro de dispositivos IoT na blockchain.
- Gerenciamento de alocação de recursos e controle de crédito para dispositivos.
- Interação entre dispositivos, backend e blockchain de forma segura e transparente.

## Motivação

Com a expansão da IoT, problemas de segurança como autenticação fraca, criptografia deficiente e falta de atualizações tornaram-se críticos. Este projeto busca abordar esses desafios ao:

- Implementar mecanismos de autenticação robustos.
- Garantir a integridade e a imutabilidade dos dados através da blockchain.
- Proporcionar uma infraestrutura descentralizada que reduz pontos únicos de falha.

## Arquitetura do Sistema

A arquitetura é composta por três camadas principais:

1. **Camada IoT**: Dispositivos físicos ou simulados que coletam dados e interagem com o ambiente.
2. **Backend/API**: Desenvolvido em Node.js e Express, processa solicitações e comunica-se com a blockchain.
3. **Blockchain (Ethereum)**: Gerencia autenticação, registro e controle dos dispositivos via contratos inteligentes.

## Funcionalidades

- **Registro de Dispositivos**: Contrato inteligente para registro seguro na blockchain.
- **Gerenciamento de Recursos**: Contrato inteligente para alocação de recursos e controle de créditos.
- **Simulador de Dispositivos**: Script em Python que simula dispositivos IoT para testes e demonstrações.
- **Monitoramento em Tempo Real**: Logs que exibem interações e estados dos contratos inteligentes.

## Tecnologias Utilizadas

- **Blockchain e Smart Contracts**:
  - Ethereum
  - Solidity
  - Hardhat
  - Ganache

- **Backend**:
  - Node.js
  - Express

- **DevOps e Containerização**:
  - Docker
  - Docker Compose

- **Simulação e Testes**:
  - Python
  - Scripts de simulação de dispositivos

## Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. **Clone o repositório**:

    ```bash
    git clone https://github.com/gianvstheworld/iot_blockchain
    cd iot_blockchain
    ```

2. **No diretório principal, execute o seguinte**:

    ```bash
    docker compose up --build
    ```

3. **Em outro terminal, finalize com os seguintes comandos**:

    ```bash
    docker compose restart hardhat 
    python3 device_simulator.py
    ```

Por fim, basta verificar os dispositivos no [link](http://localhost:3001/).