import * as api from '../../../utils/gapi'

/**
 * Enable Google API.
 * This must be called from the user action.
 */
export default async function () {
    await api.init
    
    const tokenResponse = await api.signIn()
    if ('error' in tokenResponse) {
        const message = [
            tokenResponse.error,
            tokenResponse.error_description,
            tokenResponse.error_uri,
        ].join('\n')
        
        alert(message)
    }
}