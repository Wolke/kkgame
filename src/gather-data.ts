// const { zh_singer_list, en_singer_list } = require("./const")
import { MongoClient, DBRef, MongoError, Db, Collection, Timestamp } from "mongodb";
import { get3singer, getMediaUrl, getRandomTrack, getArtistData } from "./utils"
import { resolve } from "path";
const { dbName, mongodb_url } = require("./const")
const limit_stored_songs = 100;
export const gather_songs = async (locale: string) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodb_url, async (err: MongoError, client: MongoClient) => {
            if (err) {
                console.log(err)
                return;
            }
            console.log("Connected successfully to server");
            let db = client.db(dbName);
            let questions = db.collection('questions');
            let artist = db.collection('artist');

            await questions.deleteMany({
                "createtime": {
                    $lt: new Date(new Date().setHours(new Date().getHours() - 4))           //     $gte: new Date(new Date().setHours(new Date().getHours() - 2))
                }
            })

            let c = await questions.countDocuments({ locale });

            console.log("countDocuments", c);
            if (c > limit_stored_songs) {
                client.close()
                return
            }
            //get songs
            for (let j = c; j < limit_stored_songs; j++) {
                let singers = get3singer(locale);
                // console.log(singers)
                let i = Math.round(Math.random() * singers.length) - 1
                if (i < 0) i = 0;
                // console.log(singers[i])
                let selected = singers[i].name;

                let song: any = await getRandomTrack(selected);
                // console.log(song);
                if (song === undefined) {
                    continue;
                }

                let media_url = await getMediaUrl(song);
                // console.log(media_url)
                if (media_url === "") {
                    // client.close();
                    continue
                }
                // console.log(singers)
                questions.insertOne({
                    locale,
                    singers,
                    selected,
                    song,
                    media_url,
                    "createtime": new Date()

                }, (err: MongoError, result: any) => {
                    //
                    if (err) {
                        console.error("err:" + err)
                    }
                    console.log("question insert")
                })
            }

            client.close();
            resolve(true)

        });
    })


}

// gather_songs("zh");
export const get_question: any = (locale: string) => {
    return new Promise((reslove, reject) => {

        MongoClient.connect(mongodb_url, async (err: MongoError, client: MongoClient) => {
            if (err) {
                console.log(err)
                return;
            }
            // console.log("Connected successfully to server");
            let db = client.db(dbName);
            let questions = db.collection('questions');

            let q = await questions.findOne({ locale });
            // console.log(q);
            if (q === null) {
                gather_songs(locale);
                client.close()
                reject(new Error("no song"))
                return;
            }
            reslove(q)
            await questions.deleteOne({
                _id: q._id
            })
            client.close()

            // gather_songs(locale);

        });
    })
}

// export const stored_artist_data = () => {
//     MongoClient.connect(mongodb_url, async (err: MongoError, client: MongoClient) => {
//         if (err) {
//             console.log(err)
//             return;
//         }
//         // console.log("Connected successfully to server");
//         let db = client.db(dbName);
//         let artist = db.collection('artist');

//         [en_singer_list].map(list => {
//             list.map(async (i: string) => {
//                 let a: any = await getArtistData(i)
//                 // if(a.id)
//                 console.log(`{"name":"${i}","image_url":"${a.images[0].url}"},`)
//                 // let d = await artist.findOne({ id: a.id })
//                 // if (d) {
//                 //     console.log("artist get data " + i)
//                 // } else {
//                 //     a.name = i;
//                 //     await artist.insertOne(a)
//                 //     console.log("insert artist " + i)
//                 // }
//             })
//         })
//     })
// }

let m = async () => {
    await gather_songs("en");
    await gather_songs("zh");
    // let q = await get_question("zh");
    // console.log(q);
    console.log("end")
    const { spawn } = require('child_process');
    const ls = spawn('pkill', ['-f', 'node']);
}
m()

