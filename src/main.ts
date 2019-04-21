import * as dotenv from "dotenv";
import { ILogger, IContainerService } from "./commonTypes";
import { ConsoleLogger } from "./logging";
import { ConfigurationService, IConfigurationService } from "./configService";
import { ContainerService }  from "./containerService";

// Init environment
dotenv.config();

// Setup services
const logger: ILogger = new ConsoleLogger();
const config: IConfigurationService = new ConfigurationService();
const aci: IContainerService = new ContainerService(logger, config);

// Sample cases
(async () => {
    //
    // FAILURE CASE - note that the call to "CreateNewDeployment" is a long-running 
    // operation.
    //
    try {
        logger.Write("Staring FAILURE case...");
        let aciDeployment1 = await aci.CreateNewDeployment(2, 2, undefined);
        await aci.UpdateDeploymentTag(aciDeployment1.id!, "Test", "Failure");
        logger.Write("FAILURE case finished.");
    } catch (err) {
        logger.Write(`ERROR: ${JSON.stringify(err)}`);
    }

    //
    // SUCCESSFUL CASE - note the call to "CreateNewDeploymentSync" no longer uses the long-running 
    // call.
    //
    try {
        logger.Write("Staring SUCCESSFUL case...");
        let aciDeployment2 = await aci.CreateNewDeploymentSync(2, 2, undefined);
        await aci.UpdateDeploymentTag(aciDeployment2.id!, "Test", "Success");
        logger.Write("SUCCESSFUL case finished.");
    } catch (err) {
        logger.Write(`ERROR: ${JSON.stringify(err)}`);
    }
})();