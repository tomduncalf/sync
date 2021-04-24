# Synced DJ

## Prerequisites

Copy the `.env.local.example` file to `.env.local` and follow the rest of this section to complete the required configuration.

### TURN server

The app is configured to use Google's STUN server, but a TURN server can also be necessary in some circumstances, to operate as a relay in order to ensure connectivity between two peers. You can use the free TURN server provided by Viagenie for development purposes:

1. Sign up for an account at https://numb.viagenie.ca/
2. Add your account details to the `REACT_APP_VIAGENIE_USERNAME` and `REACT_APP_VIAGENIE_PASSWORD` environment variables in the `.env.local` file

Or you can supply an alternative TURN server:

1. Add the URL, username and password to the `REACT_APP_TURN_SERVER_URL`, `REACT_APP_TURN_SERVER_USERNAME` and `REACT_APP_TURN_SERVER_PASSWORD` environment variables in the `.env` file

If you wish to change other aspects of the WebRTC configuration, you can modify `config/webRtcConfig.ts` directly.

### Agora account

The app uses Agora's RTM (real time messaging) service to send the initial signalling messages for negotiating the WebRTC connection between peers. You will need to sign up for an account and provide an app ID:

1. Sign up for an account at https://agora.io (a free account is fine for development so you don't need to enter card details)
2. Do not follow the instructions to creata new Agora project if they show (as it will create a project with token authentication), but instead click "New Project" once you have dismissed the instructions.
3. Leave your project authentication mechanism as "Testing mode: APP ID" – this allows you to login without a token (which would require setting up a token server). Obviously for a production deployment you would want to implement this extra security!
4. Copy the App ID from the project details page and add it to the `REACT_APP_AGORA_APP_ID` environment variable in `.env.local`
