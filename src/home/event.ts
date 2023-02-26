import Assignment from './assignment'

const setRemainingTime = (deadline: Date, node: Node) => {
  const delta = deadline.getTime() - Date.now()
  const dayCount = delta / (24 * 60 * 60 * 1000)

  if (dayCount < 2) {
    const hours = delta / (60 * 60 * 1000)
    const minutes = (delta / (60 * 1000)) % 60
    const seconds = (delta / 1000) % 60

    node.textContent = [hours, minutes, seconds]
      .filter((value) => value > 1)
      .map((value, index) => {
        const chars = Math.floor(value).toString()
        if (index === 0) {
          return chars
        } else {
          return chars.padStart(2, '0')
        }
      })
      .join(':')
  } else {
    node.textContent = Math.floor(dayCount).toString()
  }
}

export default () => {
  // let isAssignmentListOpen = false
  // document.querySelector('#assignment-list-container')?.addEventListener("toggle", (event) => {
  //     const element = event.target as HTMLDetailsElement
  //     isAssignmentListOpen = element.open
  // })

  const holder = document.querySelector<HTMLElement>('#assignment-list-holder')
  const rows = document.querySelectorAll<HTMLInputElement>(
    '#assignment-list-holder>tr'
  )

  document.querySelectorAll('#assignment-list-holder th').forEach((element) => {
    element.addEventListener('click', (event) => {
      Array.from(rows)
        .sort((a, b) => {
          if (
            'assignment' in a &&
            a.assignment instanceof Assignment &&
            'assignment' in b &&
            b.assignment instanceof Assignment
          ) {
            return (
              a.assignment.deadline.getTime() - b.assignment.deadline.getTime()
            )
          }

          return 0
        })
        .forEach((row) => {
          holder.appendChild(row)
        })
      console.info('Not Implementation')
    })
  })

  document
    .querySelector('#assignments-visibility-input')
    ?.addEventListener('input', (event) => {
      const element = event.target as HTMLInputElement
      if (element.checked) {
        for (const row of rows) {
          if ('isShown' in row && '_isShown' in row) {
            row._isShown = row.isShown
            row.isShown = true
          }
        }
      } else {
        for (const row of rows) {
          if ('isShown' in row && '_isShown' in row) {
            row.isShown = row._isShown
            row._isShown = undefined
          }
        }
      }
    })

  for (const row of rows) {
    row.querySelector('input')?.addEventListener('input', (event) => {
      const element = event.target as HTMLInputElement

      if ('assignment' in row && row.assignment instanceof Assignment) {
        row.assignment.isShown = element.checked
      }

      if ('isShown' in row && '_isShown' in row) {
        if (row._isShown === undefined) {
          row.isShown = element.checked
        } else {
          row._isShown = element.checked
        }
      }
    })

    // Update remaining time per 1000 ms.
    const remainingTimeSpan = row.querySelector('.remaining-time')
    if (remainingTimeSpan !== null) {
      if ('assignment' in row && row.assignment instanceof Assignment) {
        const deadline = row.assignment.deadline
        if (deadline !== undefined) {
          setRemainingTime(deadline, remainingTimeSpan)
          setInterval(setRemainingTime, 1000, deadline, remainingTimeSpan)
        }
      }
    }
  }
}
