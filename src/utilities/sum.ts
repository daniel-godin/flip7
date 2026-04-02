export function sumArray(arr: string[]): number {
    const numArr: number[] = [];

    arr.forEach((element) => {
        if (isNaN(Number(element))) { return }; // If NaN after Number(), it is "+2", "+10", "FREEZE", etc.
        numArr.push(Number(element));
    })

    return numArr.reduce((sum, card) => sum + Number(card), 0);
}