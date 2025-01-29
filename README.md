# Haltmann Works Company Internal Database System
The interactive website used as the information hub for the RE:SPH SiIvaGunner ARG.

## Environment Variables
For all website features to work properly, several env variables may need to be set and provided in an .env file in the root directory of the project

| Variable |  Required | Value | Description    |
| :---:   | :---: | :---: | :---: |
| NODE_ENV |  ❌   | `production` or `development`   | The current environment, only affects whether GET /debug/add-conditional is accessible|
| GROUP_CHALLENGE_CODE |  ✅   | `number`   | The solution to the group challenge used in X:/Noaka/The Prize/LockN'Key.exe |
| ORIGIN |  ✅ (production)  | `string`   | URL the website is being served from. [read more](https://svelte.dev/docs/kit/adapter-node#Environment-variables-ORIGIN-PROTOCOL_HEADER-HOST_HEADER-and-PORT_HEADER) |
| PORT |  ❌   | `number`   | The port the production server should run from |
| FILESYSTEM_PATH |  ❌   | `string`   | Filesystem definition file to use, defaults to `./filesystem.json` if none are provided |
| CANARY_WEBHOOK_URL |  ❌   | `string`   | Discord Webhook to post to when a file with the canary attribute is loaded or accessed for the first time (globally) |
| CANARY_MESSAGE |  ❌   | `string`   | Message to post to the webhook |
| PRERELEASE |  ❌   | `0` or `1`   | Shows a 404 screen unless the user has set a `preview` cookie to the value of `PRERELEASE_CODE`   |
| PRERELEASE_CODE |  ❌   | `0` or `1`   | The passcode to be used in conjunction with `PRERELEASE`   |
| WINTER_BREAK |  ❌   | `0` or `1`  | Prevents users from successfully submitting to the original oracle.exe and the password challenge, instead it tells them to touch grass |
| ARG_PEANUT_GALLERY_WEBHOOK_URL |  ❌   |`string`   | Discord Webhook where failed attempts to puzzles are posted (Applies to PasswordPrompt.svelte, oracle.exe, oracle2.exe, Problem_One.exe and Problem_Two.exe) |

For deployment behind a reverse proxy etc additional configuration options can be provided, these parameters can be found in the sveltekit [documentation](https://svelte.dev/docs/kit/adapter-node).

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

In production the website was managed using pm2, an ecosystem file is provided in the form of `ecosystem.config.cjs`
Once built, you can start the app with 
```bash
pm2 start ecosystem.config.cjs
```

To pull updates and restart the website run the command:
```bash
npm run deploy
```

### Sessions
As the website (currently) does not have a database to reduce the load on the relatively weak deployment server, sessions are stored in memory.
This means when the server is restarted (eg. via `npm run deploy`), all user sessions are lost. This was acceptable as they were not used in many places (prior to Arc 2 only rebirth.exe used them).

However, to avoid this happening when filesystem.json is updated, you can go to `/filesystem/reload` to reload the cached version of the filesystem file used by the server.
