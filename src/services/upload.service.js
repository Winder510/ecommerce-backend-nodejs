import {
    cloudinary
} from "../configs/cloudinary.config.js";

const uploadImageFromUrl = async () => {
    try {
        const urlImage = 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0i5vom5u86lac@resize_w900_nl.webp';
        const folderName = 'product',
            newFileName = 'testdemo'

        const result = await cloudinary.uploader.upload(urlImage, {
            productId: newFileName,
            folder: folderName
        })
        return result
    } catch (error) {
        console.log(error);
    }
}

const uploadImageFromLocal = async ({
    path,
    folderName = 'product',
}) => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            public_id: 'thumb',
            folder: folderName
        })
        return {
            image_url: result.secure_url,
            thumb_url: await cloudinary.url(result.public_id, {
                height: 100,
                width: 100,
                format: 'jpg'
            })
        }
    } catch (error) {
        console.log(error);
    }
}

const uploadListImageFromLocal = async ({
    files = [],
    folderName = 'product',
}) => {
    try {
        if (!files.length) return

        const uploadedUrls = []

        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folderName
            })

            uploadedUrls.push({
                image_url: result.secure_url,
                thumb_url: await cloudinary.url(result.public_id, {
                    height: 100,
                    width: 100,
                    format: 'jpg'
                })
            })
        }


        return uploadedUrls
    } catch (error) {
        console.log(error);
    }
}
export {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadListImageFromLocal
}