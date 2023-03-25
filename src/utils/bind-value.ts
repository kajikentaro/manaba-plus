/**
 * Replace placeholders in a string with specific values.
 * Placeholders are surrounded with `$`.
 *
 * sample:
 * ```
 * import bindValue from './bind-value'
 * bindValue('This is $name$, $age$ years old.', { name: 'Tom', age: 8 })
 * // Return 'This is Tom, 8 years old.'
 * ```
 * @param text The string including placeholders
 * @param object The object including values
 * @returns The replaced string
 */
export default function <T>(text: string, object: T) {
  return text.replaceAll(
    /\$(\w+)\$/g,
    (...args: string[]) => object[args[1]] as string
  )
}
