import { Tensor3D } from "@tensorflow/tfjs-core";
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