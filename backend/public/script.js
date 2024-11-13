async function fetchDevices() {
    try {
        const response = await fetch('/devices');
        const devices = await response.json();

        const devicesBody = document.getElementById('devicesBody');
        devicesBody.innerHTML = ''; 

        devices.forEach(device => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${device.deviceId}</td>
                <td>${device.owner}</td>
                <td>${device.credit}</td>
                <td>${device.isRegistered ? 'Registered' : 'Not Registered'}</td>
            `;
            devicesBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error);
    }
}

window.onload = fetchDevices;
