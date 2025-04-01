import fs from 'fs';
import tf, { Tensor3D } from "@tensorflow/tfjs-core";
import { node } from '@tensorflow/tfjs-node';

export async function downloadFile(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}

export function FromBufferToImageData(imageBuffer: Buffer, width: number, height: number): ImageData | undefined {

    const a = new Uint8Array([1, 2, 3]);
    const t = tf.tensor(a);

    let imageData = new ImageData(new Uint8ClampedArray(imageBuffer), width, height);

    // testing
    if (imageData?.data) {
        fs.writeFileSync('./image.png', Buffer.from(imageData.data)); // Save the image buffer to a file for debugging
    }

    return imageData;
}

export function bufferToUint32Array(imageBuffer: Buffer, width: number, height: number): { Uint32Array: Uint32Array, width: number, height: number } {
    const arrayBuffer = new ArrayBuffer(width * height * 4); // 4 bytes per pixel (RGBA)
    const uint32Array = new Uint32Array(arrayBuffer);

    for (let i = 0; i < imageBuffer.length; i += 4) {
        const r = imageBuffer[i];
        const g = imageBuffer[i + 1];
        const b = imageBuffer[i + 2];
        const a = imageBuffer[i + 3];

        // Combine RGBA values into a single UInt32 value
        uint32Array[i / 4] = (r << 24) | (g << 16) | (b << 8) | a;
    }

    return { Uint32Array: uint32Array, width: width, height: height };
}

export async function bufferToUint8Array(imageBuffer: Buffer) {
    return node.decodeImage(imageBuffer, 3, "int32", false) as Tensor3D;
}

export function getHighestProbability(results: { className: string; probability: number }[]): number {
    if (results.length === 0) {
        return 0;
    }
    let reduced = results.reduce((highest, current) => current.probability > highest.probability ? current : highest);
    return reduced.probability;
}