export function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function random4() {
    return 4;
}