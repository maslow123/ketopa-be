const fs = require("fs");
const response = require("../helpers/response");

const path = require("path");
const multer = require("multer");
const moment = require("moment");

const storage = multer.diskStorage({
    destination: (req, res, callback) => {
        const path = req.params.category;
        if (!['evidence', 'product', 'user'].includes(path)) {
            callback('parameter', null);
        }
        callback(null, `uploads/${path}`);
    },
    filename: async (req, file, callback) => {
        const ext = file.mimetype.split("/")[1];
        const uniqueID = moment(new Date()).format("YYYYMMDD") + new Date().getTime();
        callback(null, `${uniqueID}.${ext}`);
    },
});

let upload = multer({
    storage: storage,
}).array("files");

const uploadEvidence = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return response.falseRequirement(res, err);
            }

            const files = req.files;
            const filename = files[0].filename;

            if (files && files.length < 1) {
                return response.falseRequirement(res, "file must uploaded..");
            }

            return response.upsert(res, { filename: filename }, "created");
        });
    } catch (error) {
        response.internalError(res, error.message);
    }
};

const getImage = async (req, res) => {
    try {
        const { category, filename } = req.params;

        if (!filename) {
            return response.falseRequirement(res, "Filename");
        }
        if (!category) {
            return response.falseRequirement(res, "Category");
        }

        res.sendFile(
            path.join(__dirname, `../uploads/${category}/${filename}`)
        );
    } catch (error) {
        response.internalError(res, error.message);
    }
};

module.exports = {
    uploadEvidence,
    getImage,
};
