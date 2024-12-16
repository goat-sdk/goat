export async function convertToBaseUnit(amount: number, decimals: number) {
    const baseUnit = amount * 10 ** decimals;
    return baseUnit;
}
