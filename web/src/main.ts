import init, { add, greet, calculate_crc, string_to_bytes } from '../public/wasm/pkg/wasm_ts_hello_world';

async function run() {
    await init();
    greet("TypeScript + Wasm");
    console.log("3 + 5 =", add(3, 5));
}

const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

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

                            const activate = string_to_bytes('sta?1');
                            const activateCrc = calculate_crc(activate)
                            const activatePacket = new Uint8Array([...activate, ...activateCrc]);
                            await rxCharacteristic.writeValue(activatePacket);
                            setTimeout(async () => {
                                const clearing = string_to_bytes('ssr?');
                                const clearingCrc = calculate_crc(clearing);
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
