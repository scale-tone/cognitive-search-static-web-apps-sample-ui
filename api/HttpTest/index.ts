import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: req.headers['x-ms-client-principal']
    };

};

export default httpTrigger;