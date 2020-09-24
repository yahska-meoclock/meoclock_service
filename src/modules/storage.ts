import {Storage} from "@google-cloud/storage";
import Multer from "multer";
import express, { Request, Response } from 'express';
import { post, patch, patchAddToSet } from '../connections/nosql_crud' 
// //@ts-ignore
// const storage = new Storage({keyFileName: process.env.GOOGLE_APPLICATION_CREDENTIALS})

// const multer = Multer({
//     storage: Multer.memoryStorage(),
//     limits: {
//       fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
//     },
// });

// const createBucket = async (bucketName: string) => {
//     try {
//         await storage.createBucket(bucketName);
//         console.log(`Bucket ${bucketName} created.`);
//     } catch(e) {
//         throw e
//     }
// }



