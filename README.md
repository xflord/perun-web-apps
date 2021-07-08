# PerunWebApps

This repository contains Perun web applications.
## How to contribute
1) You need to have the Nodejs installed
2) You need to have the Angular CLI installed
3) Fork and clone this repository
4) Run `npm install`

## How to serve the AdminGUI

First, you need to create a file `apps/admin-gui/src/assets/config/instanceConfig.json` with the following content:
```json
{
  "api_url": "https://cloud8.perun-aai.org/ba/rpc/",
  "skip_oidc": true
}
```
Then you can serve the admin gui with the following command:
```shell script
ng serve admin-gui
```
