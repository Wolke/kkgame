const { zh_singer_list, en_singer_list, kkbox_id, kkbox_secret } = require("./const")
// zh_singer_list.map(i => {
//     console.log(`"${i}","${i}"`)
// })
export const get3singer: any = (locale: string) => {
    let list = zh_singer_list;
    if (locale === "en") {
        list = en_singer_list;
    }

    let ans: Array<string> = [];
    while (true) {
        let n: number = Math.round(Math.random() * list.length) - 1;
        if (n < 0) n = 0;
        // console.log(n)
        if (list[n] === undefined) {
            continue;
        }
        if (!ans.includes(list[n])) {
            ans.push(list[n]);
            if (ans.length === 3) {
                break;
            }
        }
    }
    return ans;
};
// console.log(get3singer())
const { Auth, Api } = require('@kkbox/kkbox-js-sdk')


export const getRandomTrack = (singer: string) => {
    console.log(singer)
    const auth = new Auth(kkbox_id, kkbox_secret);

    return new Promise((resolve, reject) => {
        // Fetch your access token
        auth.clientCredentialsFlow
            .fetchAccessToken()
            .then((response: any) => {
                const access_token = response.data.access_token;

                // Create an API object with your access token
                const api = new Api(access_token);
                // Fetch content with various fetchers
                api.searchFetcher
                    .setSearchCriteria(singer, 'track')
                    .fetchSearchResult()
                    .then((response: any) => {

                        let song = response.data.tracks.data[Math.round(Math.random() * response.data.tracks.data.length) - 1]
                        // console.log(song)
                        resolve(song)

                    });
            });
    })
}

export const getArtistData = (singer: string) => {
    // console.log(singer)
    const auth = new Auth(kkbox_id, kkbox_secret);

    return new Promise((resolve, reject) => {
        // Fetch your access token
        auth.clientCredentialsFlow
            .fetchAccessToken()
            .then((response: any) => {
                const access_token = response.data.access_token;

                // Create an API object with your access token
                const api = new Api(access_token);
                // Fetch content with various fetchers
                api.searchFetcher
                    .setSearchCriteria(singer, 'artist')
                    .fetchSearchResult()
                    .then((response: any) => {
                        resolve(response.data.artists.data[0])

                    });
            });
    })
}

export const getMediaUrl = (song: { id: string }) => {
    return new Promise(async (resolve, reject) => {
        let url = `https://widget.kkbox.com/v1/?type=song&terr=TW&autoplay=false&loop=false&id=${song.id}`;
        let request = require("request");
        var rp = require('request-promise');

        console.log(url)
        for (let i in [0, 1, 2, 3]) {
            //1.request change to be promise 
            //2. when tmeout happen request again
            let body = await rp(url);
            // console.log(body)
            if (body) {
                let n = body.indexOf("https://fs-preview.kfs.io");
                let s = body.slice(n);
                let end = s.indexOf("&quot;,&quot;")

                let media_url: string = s.substr(0, end);
                resolve(media_url)
            }
        }
        reject(new Error("request fail"));
    })
}

let main = async () => {
    // let singers = get3singer("en");
    // console.log(singers)
    // let i = Math.round(Math.random() * singers.length) - 1
    // if (i < 0) i = 0;
    // console.log(singers[i])
    // let selected = singers[i]

    // let song: any = await getRandomTrack("Super 7");
    // console.log(song.album.images);

    // let media_url = await getMediaUrl(song);
    // console.log(media_url)
    // const { spawn } = require('child_process');
    // const ls = spawn('open', [media_url]);

}
main()