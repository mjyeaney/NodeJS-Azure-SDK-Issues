## Azure NodeJS SDK Issues Repro

This repo is setup as a repro of an issue I'm currently having with overlapping async (long-running) ARM calls. This issue is open [here](https://github.com/Azure/azure-sdk-for-node/issues/5072).

### Configuration

You'll need to drop an `.env` file in the root directory with the following settings:

```
TENANT_ID=
CLIENT_ID=
CLIENT_SECRET=
SUBSCRIPTION_ID=
REGION=eastus
RESOURCE_GROUP_NAME=some-resource-group-name
CONTAINER_IMAGE=microsoft/aci-helloworld
CONTAINER_PORT=80
CONTAINER_OS_TYPE=linux
CONTAINER_REGISTRY_HOST=
CONTAINER_REGISTRY_USERNAME=
CONTAINER_REGISTRY_PASSWORD=
```

Note that `TENANT_ID`, `CLIENT_ID`, and `CLIENT_SECRET` will be specific to the service-principal / AAD application you setup in your tenant. `REGION` and `RESOURCE_GROUP_NAME` can be adjusted to suit.

### Building

This repo is build leveraging tasks and build steps that call standard *NIX utilities, and on Windows this is enabled via WSL. To build, run the following command:

`npm run build`

After this completes, you can run the sample test cases with:

`npm run test`
