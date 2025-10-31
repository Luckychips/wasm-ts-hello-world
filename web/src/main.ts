import init, { add, greet } from '../public/wasm/pkg/wasm_ts_hello_world';

async function run() {
    await init();
    greet("TypeScript + Wasm");
    console.log("3 + 5 =", add(3, 5));
}

run();
