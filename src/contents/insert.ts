const progressBarHolder = document.querySelector('#progress-bars-holder')

const createProgress = function (trace: ScrapingTrace, child?: Element) {
  const container = document.createElement('div')
  container.className = 'progress-container'

  const itemNameDiv = document.createElement('div')
  itemNameDiv.className = 'item-name'
  itemNameDiv.innerText = trace.token
  container.appendChild(itemNameDiv)

  const progress = document.createElement('progress')
  progress.max = trace.max
  progress.value = trace.index
  container.appendChild(progress)

  const subHolder = document.createElement('div')
  subHolder.className = 'sub-holder'
  if (typeof child !== 'undefined') {
    subHolder.appendChild(child)
  }
  container.appendChild(subHolder)

  return container
}

export const updateProgress = function (traces: ScrapingTrace[]) {
  if (traces === null || traces.length === 0) {
    return
  }

  let lastProgress: Element
  for (const trace of traces) {
    lastProgress = createProgress(trace, lastProgress)
  }

  progressBarHolder.replaceChildren(lastProgress)
}

export const clearProgress = function () {
  progressBarHolder.replaceChildren()
}

const interruptedContentsHolder = document.querySelector(
  '#interrupted-contents-holder'
)
const completedContentsHolder = document.querySelector(
  '#completed-contents-holder'
)

const createCompleted = function (context: DownloadContext) {
  const row = document.createElement('div')
  row.className = 'content-row'

  const tokensDiv = document.createElement('div')
  tokensDiv.className = 'tokens'

  const tokensFragment = document.createDocumentFragment()
  for (const token of context.tokens) {
    const tokenDiv = document.createElement('div')
    tokenDiv.innerText = token
    tokensFragment.appendChild(tokenDiv)
  }
  tokensDiv.appendChild(tokensFragment)

  row.appendChild(tokensDiv)

  return row
}

const createInterrupted = function (context: DownloadContext, message: string) {
  const row = createCompleted(context)

  const messageDiv = document.createElement('div')
  messageDiv.className = 'message'
  messageDiv.innerText = message
  row.appendChild(messageDiv)

  return row
}

export const appendFinished = function (
  interrupted: [DownloadContext, string][],
  completed: DownloadContext[]
) {
  if (interrupted.length > 0) {
    const interruptedFragment = document.createDocumentFragment()
    for (const [context, message] of interrupted) {
      const element = createInterrupted(context, message)
      interruptedFragment.appendChild(element)
    }

    interruptedContentsHolder.appendChild(interruptedFragment)
  }

  if (completed.length > 0) {
    const completedFragment = document.createDocumentFragment()
    for (const context of completed) {
      const element = createCompleted(context)
      completedFragment.appendChild(element)
    }

    completedContentsHolder.appendChild(completedFragment)
  }
}
