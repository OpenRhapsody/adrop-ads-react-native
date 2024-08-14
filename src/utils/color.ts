export const toHexString = (color?: string) => {
    if (color?.includes('#')) return color
    if (color?.includes('rgb')) return rgbaToHex(color)
    return null
}

export const rgbaToHex = (rgbaString: string): string => {
    const result = rgbaString.match(
        /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([0-9.]+))?\)/
    )
    if (!result) return ''

    const r = result[1] ?? ''
    const g = result[2] ?? ''
    const b = result[3] ?? ''
    const alpha = result[4] ? parseFloat(result[4]) : 1
    const alphaHex = toHex(Math.ceil(alpha * 255))

    if (!(r && g && b)) return ''
    return `#${alphaHex}${toHex(parseInt(r, 10))}${toHex(
        parseInt(g, 10)
    )}${toHex(parseInt(b, 10))}`
}

const toHex = (n: number) => n.toString(16).padStart(2, '0')
