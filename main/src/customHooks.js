import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const apiBaseUrl = "http://127.0.0.1:8000/api/";

export const useBackend = ({model, id=null, makeInfinate=false}) => {
    const formattedUrl = new URL(`${apiBaseUrl}${model}/${id ? id + "/" : ""}`);
    const defaultStaleTime = 1000 * 60 * 15;
    const queryKey = [model, id];

    if (makeInfinate) {
        return useInfiniteQuery({
            queryKey: queryKey + "infinate",
            queryFn: async ({pageParam = 1}) => {
                formattedUrl.searchParams.set('page', pageParam)
                const res  = await fetch(formattedUrl);
                const data = await res.json()
                return data;
            },
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.next) {
                    const nextPage = new URL(lastPage.next);
                    return nextPage.searchParams.get('page');
                }
                return undefined;
            },
            hasNextPage: (lastPage, pages) => new Boolean(lastPage.next),
            staleTime : defaultStaleTime,
        })
    }

    return useQuery({
        queryKey : queryKey,
        queryFn : async () => {
            const res = await fetch(formattedUrl);
            const data = await res.json()
            return data;
        },
        staleTime : defaultStaleTime,
    })
}

export const useRichQuery = ({model,id}) => {
    // Queries on certain models may need more than one query to retrieve data for related models.
    // This hook returns an object containing the initial query as well as any related queries.

    let initialQuery = {};

    // Query initial data
    Object.defineProperty(initialQuery, 'query', {
        value: useQuery({
            queryKey:[model.modelName,id],
        }),
        writable: true,
        enumerable: true
    })

    const initialQueryLoaded = !!initialQuery.query.data;

    let relatedQueries = {};
    
    // Query related fields
    model.fields.forEach(field => {
        if ( field.related ){ // This field requires an additional fetch.

            let relatedObjectId = initialQuery.query.data?.[field.name]

            Object.defineProperty(relatedQueries, field.name, {
                value: useQuery({
                    queryKey : [field.related.modelName, relatedObjectId],
                    enabled : initialQueryLoaded && !!relatedObjectId
                }),
                writable: true,
                enumerable: true
            });

        }
    })

    // Get holistic loading status
    const isLoading = [
        initialQuery.query.isLoading, // Initial query's loading status.
        ...(Object.values(relatedQueries).map(Q => Q.isLoading)) // Related query loading statuses.
    ].includes(true)

    // Get drilled query data
    let value = null;
    if (!isLoading) {
        value = Object.assign({}, initialQuery.query.data)
        Object.entries(relatedQueries).forEach(([model, Q]) => {
            value[model] = Q.data
        })
    }

    // Return initial query reponse, related query reponses, and holistic loading state.
    return {value, isLoading, initialQuery, relatedQueries};
}