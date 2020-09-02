import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { env } from "process";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('HTTP trigger function processed a request.');

    context.res = {
        body: {
            SearchServiceName: process.env.SearchServiceName,
            SearchIndexName: process.env.SearchIndexName
        }
    };

};

export default httpTrigger;