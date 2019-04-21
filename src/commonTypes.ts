//
// Common type definitions shared between client and server.
// Mostly used for REST api contracts.
//

import { ContainerGroup } from "azure-arm-containerinstance/lib/models";

export interface ILogger {
    Write(message: string): void;
}

export interface IContainerService {
    CreateNewDeployment(numCpu: number, memoryInGB: number, tag: string | undefined): Promise<ContainerGroup>;
    CreateNewDeploymentSync(numCpu: number, memoryInGB: number, tag: string | undefined): Promise<ContainerGroup>;
    UpdateDeploymentTag(deploymentResourceId: string, tagName: string, tagValue: string): Promise<void>;
}

export class ConfigurationDetails {
    TenantId: string = "";
    SubscriptionId: string = "";
    ClientId: string = "";
    ClientSecret: string = "";
    Region: string = "";
    ResourceGroup: string = "";
    ContainerImage: string = "";
    ContainerPort: number = 0;
    ContainerOs: string = "";
    ReportingRefreshInterval: string = "";
    ContainerRegistryHost: string = "";
    ContainerRegistryUsername: string = "";
    ContainerRegistryPassword: string = "";
    PoolMinimumSize: number = 0;
}