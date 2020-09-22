import {Storage} from "@google-cloud/storage";
import Multer from "multer";
import express, { Request, Response } from 'express';
import { post, patch, patchAddToSet } from '../connections/nosql_crud' 
//@ts-ignore
const storage = new Storage({keyFileName: process.env.STORAGE_KEY_LOCATION})

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

