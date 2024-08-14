export const nanoid = (t = 21) => {
    const randomNumberList = []
    for (let i = 0; i < t; i++) {
        const randomNumber = Math.floor(Math.random() * 61) + 1
        randomNumberList.push(randomNumber)
    }

    /* eslint-disable no-bitwise */
    return Array.from(new Uint8Array(randomNumberList))
        .map((e) => {
            e &= 63
            return e < 36
                ? e.toString(36)
                : e < 62
                ? (e - 26).toString(36).toUpperCase()
                : ''
        })
        .join('')
    /* eslint-enable no-bitwise */
}
