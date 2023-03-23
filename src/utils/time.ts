export const dayCount = function (totalMilliseconds: number) {
  return totalMilliseconds / (1000 * 60 * 60 * 24)
}

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
