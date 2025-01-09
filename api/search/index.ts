import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from 'axios';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const searchApiUrl = `https://${process.env.SearchServiceName}.search.windows.net/indexes/${process.env.SearchIndexName}/docs?api-version=2019-05-06&`;
    const url = req.url.replace(/^http(s)?:\/\/[^/]+\/api\/search(\?)?/i, searchApiUrl);

    try {

        const response = await axios.get(url, {
            headers: {
                "api-key": process.env.SearchApiKey,
        } });
        
        context.res = {
            status: response.status,
            body: response.data,
        };

    } catch (err) {
        context.res = {
            status: err.response?.status ?? 500
        };
    }
};

export default httpTrigger;