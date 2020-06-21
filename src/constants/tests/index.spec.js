import * as constants from '../index'

describe('constants', () => {
  it('apiVersion', () => {
    expect(typeof constants.apiVersion).toBe('string')
  })

  it('errorResponse', () => {
    expect(typeof constants.errorResponse).toBe('object')
  })

  it('userInputErrorResponse', () => {
    expect(typeof constants.userInputErrorResponse).toBe('object')
  })

  it('userType', () => {
    expect(typeof constants.userType).toBe('object')
  })

  it('sortType', () => {
    expect(typeof constants.sortType).toBe('object')
  })
})
