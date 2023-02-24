import getOptions from "./models"

getOptions().then((options) => {
  // Get the holder to insert option sections and items to.
  const holder = document.querySelector("#options-holder")

  // Add option sections.
  const sectionQueue = [[options, holder]]
  while (sectionQueue.length) {
    const [section, parent] = sectionQueue.pop()

    const keys = Object.keys(section).slice(1)

    keys.forEach((key) => {
      const item = section[key]

      const child = document.createElement("div")

      const title = item.title
      if (title === undefined) {
        // If `item` is a item, add item element.
        child.className = "item"

        const itemLabel = document.createElement("label")
        itemLabel.className = " "
        itemLabel.innerHTML = item.hint
        child.appendChild(itemLabel)

        const itemInput = document.createElement("input")
        itemInput.id = key
        itemInput.placeholder = item.hint
        itemInput.title = item.description
        const type = (itemInput.type = item.type)
        if (type === "checkbox") {
          itemInput.checked = item.value
          itemInput.addEventListener("input", (e) => {
            item.value = (e.target as HTMLInputElement).checked
          })
        } else {
          itemInput.value = item.value
          itemInput.addEventListener("input", (e) => {
            item.value = (e.target as HTMLInputElement).value
          })
        }
        child.appendChild(itemInput)

        const descriptionDiv = document.createElement("div")
        descriptionDiv.innerHTML = item.description
        child.appendChild(descriptionDiv)
      } else {
        // If `item` is a section, add section element.
        child.className = "section"

        const titleH1 = document.createElement("h1")
        titleH1.innerHTML = title
        child.appendChild(titleH1)

        sectionQueue.push([item, child])
      }

      ;(parent as Element).appendChild(child)
    })
  }

  // Add button actions.
  console.error("Not Implementation")
})
