/**
 * Calculate the day count from milliseconds.
 * @param totalMilliseconds The total milliseconds
 * @returns The day count
 */
export const dayCount = function (totalMilliseconds: number) {
  return totalMilliseconds / (1000 * 60 * 60 * 24)
}

/**
 * Convert milliseconds to a string.
 * @param totalMilliseconds The total milliseconds
 * @param includeMilliseconds True if the result should include under seconds, otherwise false
 * @returns The string expression of the time
 */
export const toString = function (
  totalMilliseconds: number,
  includeMilliseconds = true
) {
  const milliseconds = totalMilliseconds % 1000
  const seconds = (totalMilliseconds / 1000) % 60
  const minutes = (totalMilliseconds / (1000 * 60)) % 60
  const hours = totalMilliseconds / (1000 * 60 * 60)

  const values = [hours, minutes, seconds]
  while (values.length > 1 && values[0] < 1) {
    values.shift()
  }

  const result = values
    .map(function (value, index) {
      const chars = Math.floor(value).toString()
      if (index === 0) {
        return chars
      } else {
        return chars.padStart(2, '0')
      }
    })
    .join(':')

  if (includeMilliseconds) {
    return `${result}.${Math.floor(milliseconds).toString().padStart(4, '0')}`
  } else {
    return result
  }
}
