import mobilenet from '@tensorflow-models/mobilenet';
import { Tensor3D } from '@tensorflow/tfjs-core';

export async function classifyImage(imageData: Tensor3D) {

    // Load the model.
    const model = await mobilenet.load({
        version: 2,
        alpha: 0.75,
        // modelUrl: 'https://www.kaggle.com/api/v1/models/google/mobilenet-v2/tensorFlow2/140-224-classification/2/download'
    });

    // Classify the image.
    const predictions = await model.classify(imageData);

    console.log('Predictions: ');
    console.log(predictions);
    return predictions;
}