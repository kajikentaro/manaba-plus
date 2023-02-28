export {}

declare global {
  interface OptionSection {
    title: string
  }

  interface OptionItem {
    hint: string
    description: string
    type: 'button' | 'checkbox' | 'collection'
    _value: unknown
  }

  interface OptionButtonItem extends OptionItem {
    value: string
    message: string
  }

  interface OptionCheckboxItem extends OptionItem {
    value: boolean
  }

  interface OptionCollectionItem extends OptionItem {
    value: string[]
  }
}
