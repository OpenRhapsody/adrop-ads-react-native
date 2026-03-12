import { nanoid } from '../../src/utils/id'

describe('nanoid', () => {
    test('default length is 21', () => {
        const id = nanoid()
        expect(id.length).toBeLessThanOrEqual(21)
        expect(id.length).toBeGreaterThan(0)
    })

    test('custom length 10', () => {
        const id = nanoid(10)
        expect(id.length).toBeLessThanOrEqual(10)
        expect(id.length).toBeGreaterThan(0)
    })

    test('returns alphanumeric characters', () => {
        const id = nanoid(100)
        expect(id).toMatch(/^[a-zA-Z0-9]*$/)
    })

    test('two calls produce different values', () => {
        const id1 = nanoid()
        const id2 = nanoid()
        expect(id1).not.toBe(id2)
    })
})
