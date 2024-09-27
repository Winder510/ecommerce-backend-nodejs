import {
    BadRequestError
} from "../core/error.response.js";
import {
    SuccessResponse
} from "../core/success.response.js";
import {
    uploadImageFromLocal,
    uploadImageFromUrl,
    uploadListImageFromLocal
} from "../services/upload.service.js";
class UploadController {
    uploadFileImage = async (req, res, next) => {
        new SuccessResponse({
            message: "upload success",
            metadata: await uploadImageFromUrl()
        }).send(res)
    }
    uploadFileThumb = async (req, res, next) => {
        const {
            file
        } = req;
        if (!file) throw new BadRequestError("File missing")
        new SuccessResponse({
            message: "upload success",
            metadata: await uploadImageFromLocal({
                path: file.path
            })
        }).send(res)
    }
    uploadListImageFiles = async (req, res, next) => {
        const {
            files
        } = req;
        if (!files.length) throw new BadRequestError("File missing")

        new SuccessResponse({
            message: "upload many success",
            metadata: await uploadListImageFromLocal({
                files,

            })
        }).send(res)
    }
}
export default new UploadController();