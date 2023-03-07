import './content.type'
import errors from './errors.json'

// #region Progress
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

  if (typeof child !== 'undefined') {
    const subHolder = document.createElement('div')
    subHolder.className = 'sub-holder'
    subHolder.appendChild(child)

    container.appendChild(subHolder)
  }

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
// #endregion

// #region Contents
const contentsHolder = document.querySelector('#contents-holder')

const createContentBody = function (context: ContentContext) {
  const body = document.createElement('div')
  body.className = 'body'

  const titleDiv = document.createElement('div')
  titleDiv.className = 'title'
  titleDiv.innerText = context.tokens[0]
  body.appendChild(titleDiv)

  const parentAnchor = document.createElement('a')
  parentAnchor.className = 'parent'
  parentAnchor.href = context.parentUrl
  parentAnchor.target = '_blank'
  body.appendChild(parentAnchor)

  const statusDiv = document.createElement('div')
  statusDiv.id = context.hash
  statusDiv.className = 'status'
  if (context.excluded) {
    statusDiv.classList.add('excluded')
  } else {
    statusDiv.classList.add('pending')
  }
  body.appendChild(statusDiv)

  return body
}

const createContentNode = function (token: string, child?: Element) {
  const node = document.createElement('details')
  node.setAttribute('open', '')
  node.setAttribute('token', token)

  const summary = document.createElement('summary')
  summary.innerText = token
  node.appendChild(summary)

  if (typeof child !== 'undefined') {
    node.appendChild(child)
  }

  return node
}

export const appendContent = function (context: ContentContext) {
  const tokens = [...context.tokens]

  let existingNode = contentsHolder
  while (tokens.length > 0) {
    const token = tokens.pop()
    const node = existingNode.querySelector(`:scope > [token="${token}"]`)

    if (node === null) {
      tokens.push(token)
      break
    } else {
      existingNode = node
    }
  }

  let lastNode: Element = createContentBody(context)
  for (const token of tokens.slice(1)) {
    lastNode = createContentNode(token, lastNode)
  }

  existingNode.appendChild(lastNode)
}

export const updateContents = function (stacks: {
  downloading: DownloadContext[]
  interrupted: [DownloadContext, string][]
  completed: DownloadContext[]
}) {
  // Use getElementById because the hash can start with a number and it cannot adapt to the CSS3 selector.

  stacks.downloading.forEach(function (context: ContentContext) {
    const statusDiv = document.getElementById(context.hash)
    statusDiv.classList.remove('pending')
    statusDiv.classList.add('downloading')
  })

  stacks.interrupted.forEach(function ([context, error]: [
    ContentContext,
    string
  ]) {
    const statusDiv = document.getElementById(context.hash)
    statusDiv.classList.remove('downloading')
    statusDiv.classList.add('interrupted')

    const message = errors[error] ?? error
    statusDiv.innerText = message
  })

  stacks.completed.forEach(function (context: ContentContext) {
    const statusDiv = document.getElementById(context.hash)
    statusDiv.classList.remove('downloading')
    statusDiv.classList.add('completed')
  })
}

export const clearContents = function () {
  contentsHolder.replaceChildren()
}
// #endregion
