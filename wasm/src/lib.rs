// wasm-pack build wasm  --target web
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log_1(&format!("Hello, {}!", name).into());
}

#[wasm_bindgen]
pub fn calculate_crc(bytes: &[u8]) -> Vec<u8> {
    let mut crc: u16 = 0xFFFF;

    for &byte in bytes {
        crc ^= (byte as u16) << 8;
        for _ in 0..8 {
            if (crc & 0x8000) != 0 {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF; // 16비트 유지
        }
    }

    vec![(crc & 0xFF) as u8, (crc >> 8) as u8] // Vec<u8>로 반환
}

#[wasm_bindgen]
pub fn string_to_bytes(input: &str) -> Vec<u8> {
    input.as_bytes().to_vec()
}