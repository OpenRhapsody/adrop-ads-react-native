import { toHexString, rgbaToHex } from '../../src/utils/color'

describe('color utils', () => {
    describe('toHexString', () => {
        test('hex passthrough: #FF0000 -> #FF0000', () => {
            expect(toHexString('#FF0000')).toBe('#FF0000')
        })

        test('rgb -> hex: rgb(255,0,0)', () => {
            const result = toHexString('rgb(255, 0, 0)')
            expect(result).toBe('#ffff0000')
        })

        test('rgba -> hex with alpha: rgba(255,0,0,0.5)', () => {
            const result = toHexString('rgba(255, 0, 0, 0.5)')
            expect(result).toBe('#80ff0000')
        })

        test('undefined -> null', () => {
            expect(toHexString(undefined)).toBeNull()
        })

        test('invalid string -> null', () => {
            expect(toHexString('invalid')).toBeNull()
        })
    })

    describe('rgbaToHex', () => {
        test('rgba(0,0,0,1) -> #ff000000 (black fully opaque)', () => {
            expect(rgbaToHex('rgba(0, 0, 0, 1)')).toBe('#ff000000')
        })

        test('rgba(255,255,255,0) -> #00ffffff (white fully transparent)', () => {
            expect(rgbaToHex('rgba(255, 255, 255, 0)')).toBe('#00ffffff')
        })

        test('invalid input -> empty string', () => {
            expect(rgbaToHex('invalid')).toBe('')
        })
    })
})
