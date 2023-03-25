// bugbugnow.net/2020/02/levenshtein-distance.html

const snake = function (k: number, y: number, str1: string, str2: string) {
  let x = y - k

  while (
    x < str1.length &&
    y < str2.length &&
    str1.charCodeAt(x) === str2.charCodeAt(y)
  ) {
    x++
    y++
  }

  return y
}

const editDistanceONP = function (str1: string, str2: string) {
  let s1: string
  let s2: string

  if (str1.length < str2.length) {
    s1 = str1
    s2 = str2
  } else {
    s1 = str2
    s2 = str1
  }

  const len1 = s1.length
  const len2 = s2.length
  const delta = len2 - len1
  const offset = len1 + 1
  const dd = delta + offset
  const dc = dd - 1
  const de = dd + 1
  const max = len1 + len2 + 3
  const fp = []

  for (let p = 0; p < max; p++) {
    fp.push(-1)
  }

  let c = 0
  for (let p = 0; fp[dd] !== len2; p++, c++) {
    for (let k = -p; k < delta; k++) {
      const kk = k + offset
      const v0 = fp[kk - 1] + 1
      const v1 = fp[kk + 1]
      fp[kk] = snake(k, v0 > v1 ? v0 : v1, s1, s2)
    }

    for (let k = delta + p; k > delta; k--) {
      const kk = k + offset
      const v0 = fp[kk - 1] + 1
      const v1 = fp[kk + 1]
      fp[kk] = snake(k, v0 > v1 ? v0 : v1, s1, s2)
    }

    {
      const v0 = fp[dc] + 1
      const v1 = fp[de]
      fp[dd] = snake(delta, v0 > v1 ? v0 : v1, s1, s2)
    }
  }

  return delta + (c - 1) * 2
}

/**
 * Calculate how long 2 strings differ from each other.
 * @param str1 string 1
 * @param str2 string 2
 * @returns The number from 0 to 1 meaning the distance between the 2 strings
 */
export default function (str1: string, str2: string) {
  const m = Math.max(str1.length, str2.length)
  const d = editDistanceONP(str1, str2)
  return d / m
}
