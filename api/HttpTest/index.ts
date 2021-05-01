import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    for (var h in req.headers) {
        
        context.log('>>>' + h);
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {}
    };

};

export default httpTrigger;