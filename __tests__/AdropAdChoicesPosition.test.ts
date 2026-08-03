import { AdropAdChoicesPosition } from '../src'

describe('AdropAdChoicesPosition', () => {
    test('enum integer contract is stable for the native bridge', () => {
        // The RN bridge passes this enum as an integer (iOS @objc Int, Android Int),
        // so changing these numbers breaks native compatibility. Pinned on purpose.
        expect(AdropAdChoicesPosition.topLeft).toBe(0)
        expect(AdropAdChoicesPosition.topRight).toBe(1)
        expect(AdropAdChoicesPosition.bottomLeft).toBe(2)
        expect(AdropAdChoicesPosition.bottomRight).toBe(3)
    })

    test('enum has exactly four cases', () => {
        // Numeric enums also hold reverse mappings (8 entries); assert the 4 cases.
        const cases = Object.values(AdropAdChoicesPosition).filter(
            (v) => typeof v === 'number'
        )
        expect(cases).toHaveLength(4)
    })
})
