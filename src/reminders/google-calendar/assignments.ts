import Assignment from '../../main-panel/assignment'

/**
 * Encode an assignment array into a string.
 * @param assignments The assignment array to be encoded
 * @returns The encoded string
 */
export const encode = function (assignments: Assignment[]) {
  return JSON.stringify(assignments.map((assignment) => assignment.toString()))
}

/**
 * Decode a string into an assignment array.
 * @param str The string to be decoded
 * @returns The decoded assignment array
 */
export const decode = function (str: string) {
  const assignmentStrings: string[] = JSON.parse(str)
  return assignmentStrings.map((assignmentStr) =>
    Assignment.from(assignmentStr)
  )
}
