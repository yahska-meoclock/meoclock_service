import {Storage} from "@google-cloud/storage";
import Multer from "multer";
 
// //@ts-ignore
// //const storage = new Storage({keyFileName: process.env.STORAGE_KEY_LOCATION})

// export const createBucket = async (bucketName: string) => {
//     try {
//         const bucketResponse = await storage.createBucket(bucketName);
//         return bucketResponse
//         console.log(`Bucket ${bucketName} created.`);
//     } catch(e) {
//         throw e
//     }
// }