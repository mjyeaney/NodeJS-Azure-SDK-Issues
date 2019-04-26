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

### The Issue

Specifically in the failure case, we are calling the `beginCreateOrUpdate` method on the Azure Container Instance API. This returns a long-running opertion reponse (HTTP 201) with the appropriate `Azure-AsyncOperation` header set. However, in this case we're specifically *not* polling for status, and just continue on. This request trace looks like the following:

```
PUT https://management.azure.com/subscriptions/{REDACTED}/resourceGroups/aci-api-testing/providers/Microsoft.ContainerInstance/containerGroups/aci-inst-f464045a6dc0?api-version=2018-10-01 HTTP/1.1
Content-Type: application/json; charset=utf-8
x-ms-client-request-id: c1b53f0d-5282-4ffd-8486-d68b965e5415
accept-language: en-US
authorization: {REDACTED}
host: management.azure.com
content-length: 334
Connection: close

{"location":"eastus","properties":{"containers":[{"name":"default-container","properties":{"image":"microsoft/aci-helloworld","ports":[{"port":80}],"resources":{"requests":{"memoryInGB":2,"cpu":2}}}}],"restartPolicy":"Never","ipAddress":{"ports":[{"port":80}],"type":"public","dnsNameLabel":"aci-inst-f464045a6dc0"},"osType":"linux"}}

HTTP/1.1 201 Created
Cache-Control: no-cache
Pragma: no-cache
Content-Length: 766
Content-Type: application/json; charset=utf-8
Expires: -1
Azure-AsyncOperation: https://management.azure.com/subscriptions/{REDACTED}/providers/Microsoft.ContainerInstance/locations/eastus/operations/e8ac0695-3552-4ab3-99a5-aa719a92b522?api-version=2018-06-01
x-ms-ratelimit-remaining-subscription-resource-requests-pt5m: 99
x-ms-ratelimit-remaining-subscription-resource-requests-pt1h: 296
x-ms-request-id: eastus:e8ac0695-3552-4ab3-99a5-aa719a92b522
x-ms-ratelimit-remaining-subscription-writes: 1199
x-ms-correlation-request-id: f29d9c89-4de2-492e-9d60-cfc29cd47efa
x-ms-routing-request-id: EASTUS:20190426T114632Z:f29d9c89-4de2-492e-9d60-cfc29cd47efa
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Date: Fri, 26 Apr 2019 11:46:31 GMT
Connection: close

{"properties":{"provisioningState":"Pending","containers":[{"name":"default-container","properties":{"image":"microsoft/aci-helloworld","ports":[{"port":80}],"environmentVariables":[],"resources":{"requests":{"memoryInGB":2.0,"cpu":2.0}}}}],"restartPolicy":"Never","ipAddress":{"ports":[{"port":80}],"ip":"20.42.26.45","type":"Public","dnsNameLabel":"aci-inst-f464045a6dc0","fqdn":"aci-inst-f464045a6dc0.eastus.azurecontainer.io"},"osType":"Linux","instanceView":{"events":[],"state":"Pending"}},"id":"/subscriptions/--REDACTED--/resourceGroups/aci-api-testing/providers/Microsoft.ContainerInstance/containerGroups/aci-inst-f464045a6dc0","name":"aci-inst-f464045a6dc0","type":"Microsoft.ContainerInstance/containerGroups","location":"eastus"}

```

The next call is a method to update the tags on the just created Azure resource, which succeeds just fine - the HTTP trace looks like this:

```
PATCH https://management.azure.com//subscriptions/{REDACTED}/resourceGroups/aci-api-testing/providers/Microsoft.ContainerInstance/containerGroups/aci-inst-f464045a6dc0?api-version=2018-10-01 HTTP/1.1
Content-Type: application/json; charset=utf-8
x-ms-client-request-id: a5fb28e7-8dde-486e-b1db-5178862f89aa
accept-language: en-US
authorization: {REDACTED}
host: management.azure.com
content-length: 27
Connection: close

{"tags":{"Test":"Failure"}}

HTTP/1.1 200 OK
Cache-Control: no-cache
Pragma: no-cache
Content-Length: 792
Content-Type: application/json; charset=utf-8
Expires: -1
Vary: Accept-Encoding
x-ms-request-id: eastus:f71ca8c2-f3bf-42eb-9f51-5ebae9586b1b
x-ms-ratelimit-remaining-subscription-writes: 1199
x-ms-correlation-request-id: 63609617-f9f4-4da8-a196-0e65cee3da0c
x-ms-routing-request-id: EASTUS:20190426T114633Z:63609617-f9f4-4da8-a196-0e65cee3da0c
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Date: Fri, 26 Apr 2019 11:46:32 GMT
Connection: close

{"properties":{"provisioningState":"Pending","containers":[{"name":"default-container","properties":{"image":"microsoft/aci-helloworld","ports":[{"port":80}],"environmentVariables":[],"resources":{"requests":{"memoryInGB":2.0,"cpu":2.0}}}}],"restartPolicy":"Never","ipAddress":{"ports":[{"port":80}],"ip":"20.42.26.45","type":"Public","dnsNameLabel":"aci-inst-f464045a6dc0","fqdn":"aci-inst-f464045a6dc0.eastus.azurecontainer.io"},"osType":"Linux","instanceView":{"events":[],"state":"Pending"}},"id":"/subscriptions/--REDACTED--/resourceGroups/aci-api-testing/providers/Microsoft.ContainerInstance/containerGroups/aci-inst-f464045a6dc0","name":"aci-inst-f464045a6dc0","type":"Microsoft.ContainerInstance/containerGroups","location":"eastus","tags":{"Test":"Failure"}}

```

So - the response looks like the tags were update and all is well. Except the current NodeJS SDK gives the following error:

```
Error: Long running operation failed with error: "Location header is missing from long running operation.".
    at PollingState.getCloudError (/mnt/c/Projects/nodesdk-issues/node_modules/ms-rest-azure/lib/pollingState.js:127:17)
    at /mnt/c/Projects/nodesdk-issues/node_modules/ms-rest-azure/lib/azureServiceClient.js:156:38
    at /mnt/c/Projects/nodesdk-issues/node_modules/async/dist/async.js:958:16
    at next (/mnt/c/Projects/nodesdk-issues/node_modules/async/dist/async.js:5208:25)
    at Timeout._onTimeout (/mnt/c/Projects/nodesdk-issues/node_modules/ms-rest-azure/lib/azureServiceClient.js:140:18)
    at ontimeout (timers.js:436:11)
    at tryOnTimeout (timers.js:300:5)
    at listOnTimeout (timers.js:263:5)
    at Timer.processTimers (timers.js:223:10)
```

Alternatively, if we _do_ in fact wait for the initial ACI creation to succeed, all is well - there are no subsequent errors, leading me to believe there are some incorrect assumptions build into the `ms-rest-azure` lib and/or it's being used incorrectly either by the Azure SDK modules or myself.