import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from 'axios';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const searchApiUrl = `https://${process.env.SearchServiceName}.search.windows.net/indexes/${process.env.SearchIndexName}/docs/autocomplete?api-version=2019-05-06&`;
    const url = req.url.replace(/^http(s)?:\/\/[^/]+\/api\/autocomplete(\?)?/i, searchApiUrl);

    const searchApiResponse = await axios.get(url, {
        headers: {
            "api-key": process.env.SearchApiKey,
    } });
    
    context.res = {
        status: searchApiResponse.status,
        body: searchApiResponse.data,
    };
};

export default httpTrigger;