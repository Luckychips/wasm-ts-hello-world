import init, { add, greet } from '../public/wasm/pkg/wasm_ts_hello_world';

async function run() {
    await init();
    greet("TypeScript + Wasm");
    console.log("3 + 5 =", add(3, 5));
}

const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

function calculateCRC(bytes: any) {
    let crc = 0xFFFF;
    for (let byte of bytes) {
        crc ^= (byte << 8);
        for (let i = 0; i < 8; i++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF; // 16비트 유지
        }
    }

    return new Uint8Array([crc & 0xFF, (crc >> 8) & 0xFF]);
}

async function connectToBLEDevice() {
    if (navigator.bluetooth) {
        const button = document.getElementById('scanBtn');
        if (button) {
            button.addEventListener('click', async () => {
                try {
                    const options = {
                        filters: [{ services: [NORDIC_UART_SERVICE_UUID] }],
                        optionalServices: [NORDIC_UART_SERVICE_UUID],
                    };
                    const device = await navigator.bluetooth.requestDevice(options);
                    if (device) {
                        const server = await device.gatt.connect();
                        if (server.connected) {
                            const service = await server.getPrimaryService(NORDIC_UART_SERVICE_UUID);
                            const txCharacteristic = await service.getCharacteristic(TX_CHARACTERISTIC_UUID);
                            const rxCharacteristic = await service.getCharacteristic(RX_CHARACTERISTIC_UUID);
                            txCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                                const value = new TextDecoder().decode(event.target.value);
                                console.log('Received:', value);
                                console.log(event.target.value);
                            });
                            await txCharacteristic.startNotifications();

                            const activate = new TextEncoder().encode('');
                            const activateCrc = calculateCRC(activate);
                            const activatePacket = new Uint8Array([...activate, ...activateCrc]);
                            await rxCharacteristic.writeValue(activatePacket);
                            setTimeout(async () => {
                                const clearing = new TextEncoder().encode('');
                                const clearingCrc = calculateCRC(clearing);
                                const clearingPacket = new Uint8Array([...clearing, ...clearingCrc]);
                                await rxCharacteristic.writeValue(clearingPacket);
                            }, 2000);
                        }
                    }
                } catch (error) {
                    console.error('Error connecting to BLE device:', error);
                }
            });
        }
    } else {
        console.log("Web Bluetooth is not supported in this browser.");
    }
}

run();
connectToBLEDevice();
