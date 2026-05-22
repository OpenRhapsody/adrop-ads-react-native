import { AdropAdChoicesPosition } from '../src'

describe('AdropAdChoicesPosition', () => {
    test('enum integer contract is stable for the native bridge', () => {
        expect(AdropAdChoicesPosition.topLeft).toBe(0)
        expect(AdropAdChoicesPosition.topRight).toBe(1)
        expect(AdropAdChoicesPosition.bottomLeft).toBe(2)
        expect(AdropAdChoicesPosition.bottomRight).toBe(3)
    })

    test('enum has exactly four cases', () => {
        const cases = Object.values(AdropAdChoicesPosition).filter(
            (v) => typeof v === 'number'
        )
        expect(cases).toHaveLength(4)
    })
})
