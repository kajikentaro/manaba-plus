export {}

declare global {
  interface OptionNode {
    isSection?: boolean
    dependency?: string
  }

  interface OptionSection extends OptionNode {
    title: string
    children?: { key: string; node: OptionNode }[]
  }

  interface OptionItem extends OptionNode {
    hint: string
    description: string
    type: 'button' | 'checkbox' | 'collection' | 'number' | 'radio' | 'text'
    _value: unknown
  }

  interface OptionButtonItem extends OptionItem {
    value: string
  }

  interface OptionCheckboxItem extends OptionItem {
    value: boolean
  }

  interface OptionCollectionItem extends OptionItem {
    value: string[]
  }

  interface OptionNumberItem extends OptionItem {
    value: number
    min?: number
    max?: number
  }

  interface OptionRadioItem extends OptionItem {
    value: string
    choices: {
      key: string
      hint: string
      description: string
    }[]
  }

  interface OptionTextItem extends OptionItem {
    value: string
  }
}
