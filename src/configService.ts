//
// Exposes methods for reading configuration
//

import { ConfigurationDetails } from "./commonTypes";

export interface IConfigurationService {
    GetConfiguration(): ConfigurationDetails;
}

export class ConfigurationService implements IConfigurationService {
    public GetConfiguration() {
        const config = new ConfigurationDetails();
        config.TenantId = process.env.TENANT_ID || "";
        config.SubscriptionId = process.env.SUBSCRIPTION_ID || "";
        config.ClientId = process.env.CLIENT_ID || "";
        config.ClientSecret = process.env.CLIENT_SECRET || "";
        config.Region = process.env.REGION || "";
        config.ResourceGroup = process.env.RESOURCE_GROUP_NAME || "";
        config.ContainerImage = process.env.CONTAINER_IMAGE || "";
        config.ContainerPort = parseInt(process.env.CONTAINER_PORT!);
        config.ContainerOs = process.env.CONTAINER_OS_TYPE || "";
        config.ContainerRegistryHost = process.env.CONTAINER_REGISTRY_HOST || "";
        config.ContainerRegistryUsername = process.env.CONTAINER_REGISTRY_USERNAME || "";
        config.ContainerRegistryPassword = process.env.CONTAINER_REGISTRY_PASSWORD || "";
        return config;
    }
}