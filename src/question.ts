const { Auth, Api } = require('@kkbox/kkbox-js-sdk')

const auth = new Auth("50aa1b87a2cf80cec4c60d1cef447199", "3ecefdc490b9398f03fca9ebe9872b09");

// Fetch your access token
auth.clientCredentialsFlow
    .fetchAccessToken()
    .then((response: any) => {
        const access_token = response.data.access_token;

        // Create an API object with your access token
        const api = new Api(access_token);

        // Fetch content with various fetchers
        api.searchFetcher
            .setSearchCriteria('A-Lin', 'track')
            .fetchSearchResult()
            .then((response: any) => {

                // console.log(response.data);
                // Continue to the next page
                console.log(response.data.tracks.data)

                // api.searchFetcher.fetchNextPage(response).then((response: any) => {
                //     console.log(response.data);
                // });

            });
    });


    //singer list