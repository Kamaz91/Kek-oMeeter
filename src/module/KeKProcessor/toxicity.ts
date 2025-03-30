import * as toxicity from '@tensorflow-models/toxicity';
import translate from "translate";

// The minimum prediction confidence.
const threshold = 0.7;

// Which toxicity labels to return.

translate.engine = "google";

// toxicity | severe_toxicity | identity_attack | insult | threat | sexual_explicit | obscene
const labelsToInclude = ["identity_attack", "insult", "threat", "toxicity", "severe_toxicity"];

async function ProcessTextToxicty(text: string) {
    let model = await toxicity.load(threshold, labelsToInclude);
    return model.classify(text);
}

async function translateText(text: string, from: string, to: string): Promise<string> {
    return await translate(text, { from: from, to: to });
}

export async function isToxic(message: string): Promise<boolean> {
    let translated = await translateText(message, "pl", "en");
    console.log("translated:", translated);
    let predictions = await ProcessTextToxicty(translated);

    let isToxic = false;
    for (const prediction of predictions) {
        if (prediction.label == "toxicity" && prediction.results[0].match) {
            isToxic = true;
            break;
        }
    }
    return isToxic;
}