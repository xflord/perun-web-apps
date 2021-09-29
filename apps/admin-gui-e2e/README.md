### Prerequisites

* Installed Nodejs
* Installed project dependencies `npm install`
* To run the e2e, one has to have the perun-rpc running locally on the port 8081. To do so, you can use the [perun-rpc-docker-compose](https://gitlab.ics.muni.cz/perun/perun-rpc-docker-compose) repository.
* Make sure you don't have any `instanceConfig.json` file in the `admin-gui` project. If you have, it is possible the tests will fail, because the admin-gui might be wrongly configured.
### How to run the tests

To run the tests with watching them, use:
```
ng e2e admin-gui-e2e --watch
```

To run the tests on the background, use:
```
ng e2e admin-gui-e2e
```
