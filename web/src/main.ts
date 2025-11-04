import init, { calculate_crc, string_to_bytes } from '../public/wasm/pkg';

const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

async function main() {
    await init();
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', async () => {
            await toConnect();
        });
    }
}

async function getRxCharacteristic(server: any) {
    const service = await server.getPrimaryService(NORDIC_UART_SERVICE_UUID);
    const tx = await service.getCharacteristic(TX_CHARACTERISTIC_UUID);
    const rx = await service.getCharacteristic(RX_CHARACTERISTIC_UUID);
    tx.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Received:', value);
        console.log(event.target.value);
    });
    await tx.startNotifications();
    return rx;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(rx: any, input: string) {
    const bytes = string_to_bytes(input);
    const crc = calculate_crc(bytes)
    const packet = new Uint8Array([...bytes, ...crc]);
    await rx.writeValue(packet);
}

async function toConnect() {
    if (navigator.bluetooth) {
        try {
            const options = {
                filters: [{ services: [NORDIC_UART_SERVICE_UUID] }],
                optionalServices: [NORDIC_UART_SERVICE_UUID],
            };
            const device = await navigator.bluetooth.requestDevice(options);
            if (device) {
                const server = await device.gatt.connect();
                if (server.connected) {
                    const rxCharacteristic = await getRxCharacteristic(server);
                    // await sendMessage(rxCharacteristic, '');
                    // await delay(500);
                    // await sendMessage(rxCharacteristic, '');
                    // await delay(500);
                    // await sendMessage(rxCharacteristic, '');
                    // await delay(500);
                    // for (let i = 0; i < 24; i++) {
                    //     await sendMessage(rxCharacteristic, ``);
                    //     await delay(1000);
                    // }
                    //
                    // await sendMessage(rxCharacteristic, '');
                    // await delay(3000);
                    // await sendMessage(rxCharacteristic, '');
                }
            }
        } catch (error) {
            console.error('Error connecting to BLE device:', error);
        }
    } else {
        console.log("Web Bluetooth is not supported in this browser.");
    }
}

await main();