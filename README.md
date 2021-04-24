# Synced DJ

## Setup

### TURN server

The app is configured to use Google's STUN server, but a TURN server can also be necessary in some circumstances, to operate as a relay in order to ensure connectivity between two peers. You can use the free TURN server provided by Viagenie for development purposes:

0. Sign up for an account at https://numb.viagenie.ca/
1. Copy the `.env.example` to `.env` and add your account details to the `VIAGENIE_USERNAME` and `VIAGENIE_PASSWORD` environment variables.
