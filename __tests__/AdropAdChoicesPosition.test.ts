import { AdropAdChoicesPosition } from '../src'

describe('AdropAdChoicesPosition', () => {
    test('enum integer contract is stable for the native bridge', () => {
        // The RN bridge passes the enum as an integer (iOS @objc Int, Android Int),
        // so changing these integers breaks native compatibility. Pinned intentionally.
        expect(AdropAdChoicesPosition.topLeft).toBe(0)
        expect(AdropAdChoicesPosition.topRight).toBe(1)
        expect(AdropAdChoicesPosition.bottomLeft).toBe(2)
        expect(AdropAdChoicesPosition.bottomRight).toBe(3)
    })

    test('enum has exactly four cases', () => {
        // A numeric enum has 8 entries including the reverse mapping; assert the 4 cases.
        const cases = Object.values(AdropAdChoicesPosition).filter(
            (v) => typeof v === 'number'
        )
        expect(cases).toHaveLength(4)
    })
})
