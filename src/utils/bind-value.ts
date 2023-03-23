export default function <T>(text: string, object: T) {
  return text.replaceAll(
    /\$(\w+)\$/g,
    (...args: string[]) => object[args[1]] as string
  )
}
