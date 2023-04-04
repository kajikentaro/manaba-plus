import constants from './gapi.json'

/**
 * Initialize the Google API interface.
 */
export const init = new Promise<void>(function (resolve) {
  gapi.load('client', async function () {
    await gapi.client.init({
      apiKey: constants['api-key'],
      discoveryDocs: constants['discovery-documents'],
    })

    resolve()
  })
})

let authCallback: (tokenResponse: google.accounts.oauth2.TokenResponse) => void

const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: constants['client-id'],
  scope: constants.scopes.join(' '),
  callback: (response) => authCallback(response),
})

/**
 * Sign in to Google and enable to use of Google API.
 * @returns The response of the operation
 */
export const signIn = async function () {
  return new Promise<google.accounts.oauth2.TokenResponse>(function (resolve) {
    authCallback = resolve

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  })
}

/**
 * Sign out from Google and disable to use of Google API.
 * @returns A promise to await
 */
export const signOut = function () {
  return new Promise<void>(function (resolve) {
    const token = gapi.client.getToken()
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, resolve)
      gapi.client.setToken(null)
    } else {
      resolve()
    }
  })
}
