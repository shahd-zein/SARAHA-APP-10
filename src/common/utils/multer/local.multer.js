import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import multer from "multer";
import { mkdir, mkdirSync } from "node:fs";
import { existsSync } from "node:fs";
import { fileFilter } from "./validation.multer.js";
import { validation } from "../../../middlewere/validation.middleware.js";

export const localFileUpload = ({
    custumPath = "general",
    validation = [],
    maxSize = 5
} = {} ) => {
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fullPath = resolve(`../uploads/${custumPath}`);
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, {recursive: true})
            }
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const unequeFileName = randomUUID() + "-" + file.originalname;
            file.finalPath = `uploads/${custumPath}/${unequeFileName}`
            cb(null, unequeFileName);
        },
    });
    return multer({ fileFilter: fileFilter(validation),storage, limits:{fileSize: maxSize * 124 * 124} });
};