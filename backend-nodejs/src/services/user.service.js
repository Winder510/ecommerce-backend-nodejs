import userModel from '../models/user.model.js';
import {
    AuthFailureError,
    BadRequestError,
    ErrorResponse
} from '../core/error.response.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import {
    emailRemindChangePassWord,
    emailSendToken
} from './email.service.js';
import {
    checkEmailToken
} from './otp.service.js';
import {
    createUserRepo,
    findByEmail
} from '../models/repositories/user.repository.js';
import {
    getInfoData,
    getUsernameFromEmail
} from '../utils/index.js';
import {
    createTokenPair
} from '../auth/authUtils.js';
import KeyTokenService from './keyToken.service.js';
const newUserService = async ({
    email = null
}) => {
    const user = await userModel
        .findOne({
            usr_email: email,
            googleId: null
        })
        .lean();

    if (user) throw new ErrorResponse('Email is exists');

    // send token in email
    const res = await emailSendToken({
        email,
    });

    return {
        message: 'success',
        metadata: {
            token: res,
        },
    };
};

const checkLoginEmailTokenService = async ({
    token,
    res
}) => {
    const {
        otp_email: email,
        otp_token
    } = await checkEmailToken({
        token,
    });
    if (!email) throw new BadRequestError('Token not found ');

    const hasuser = await findByEmail({
        email,
    });
    if (hasuser) throw new BadRequestError('Email is exists');

    const passwordHash = await bcrypt.hash(getUsernameFromEmail(email), 10);

    const newUser = await createUserRepo({
        usr_name: getUsernameFromEmail(email),
        usr_email: email,
        usr_password: passwordHash,
        usr_role: '6704099fb8583f3dc7342d12', // user role
    });

    if (newUser) {
        const {
            publicKey,
            privateKey
        } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        });

        const tokens = await createTokenPair({
                userId: newUser._id,
                email,
            },
            publicKey,
            privateKey,
        );

        // set cookies cho client
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });

        await KeyTokenService.upsertKeyToken({
            userId: newUser._id,
            publicKey,
            refreshToken: tokens.refreshToken,
        });

        await emailRemindChangePassWord({
            receicedEmail: email,
            usr_name: newUser.usr_name,
        });

        // Thiết lập để xóa người dùng sau 2 tiếng
        setTimeout(
            () => {
                deleteUserIfNotChangedPassword(newUser._id).catch(console.error);
            },
            2 * 60 * 60 * 1000,
        ); // 2 tiếng

        // return {
        //     user: getInfoData({
        //         fields: ['_id', 'usr_name', 'usr_email'],
        //         object: newUser,
        //     }),
        //     accessToken: tokens.accessToken,
        // };
        return res.redirect(`http://localhost:5173/?user=${newUser._id}&token=${tokens.accessToken}`);
    }
};

const deleteUserIfNotChangedPassword = async (userId) => {
    const user = await userModel.findById(userId);

    if (user) {
        const twoHoursAgo = new Date(user.createdAt.getTime() + 2 * 60 * 60 * 1000);
        const now = new Date();

        if (now >= twoHoursAgo && !user.passwordChangedAt) {
            await userModel.findByIdAndDelete(userId);
            console.log(`User with ID ${userId} has been deleted for not changing password.`);
        }
    }
};

const changePassWordService = async ({
    email,
    currentPassword,
    newPassword,
    reNewPassword
}) => {
    const foundUser = await findByEmail({
        email,
    });
    if (!foundUser) throw new BadRequestError('User is not registered');

    const match = await bcrypt.compare(currentPassword, foundUser.usr_password);
    console.log("🚀 ~ currentPassword:", currentPassword)
    if (!match) throw new AuthFailureError('Authentication error');

    if (newPassword !== reNewPassword) throw new BadRequestError('Passwords are not the same');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return await userModel.updateOne({
        usr_email: email,
    }, {
        usr_password: passwordHash,
        usr_isDefaultPassword: false,
    }, );
};

const findOrCreateUser = async ({
    googleId,
    email,
    name,
    img
}) => {
    try {
        // Logic tìm kiếm người dùng hoặc tạo người dùng mới
        const user = await userModel.findOne({
            googleId
        });

        if (user) {
            return user;
        }

        const newUser = await userModel.create({
            googleId: googleId,
            usr_email: email,
            usr_name: name,
            usr_avatar: img,
            usr_password: 'none', // Không có password khi đăng nhập bằng Google
            usr_role: '6704099fb8583f3dc7342d12', // Có thể thay bằng quyền phù hợp
        });

        return newUser;
    } catch (err) {
        console.error('Error in findOrCreateUser:', err);
        throw err; // Ném lại lỗi để catch trong hàm gọi
    }
}

const getListAddress = async ({
    id
}) => {
    try {
        const user = await userModel.findById(id); // Assuming 'User' is the model for the 'userSchema'
        if (!user) {
            throw new Error('User not found');
        }
        return user.usr_address; // Return the addresses, including fullAddress
    } catch (error) {
        console.error("Error fetching addresses:", error);
        throw error;
    }
};

const addNewAddress = async ({
    id,
    address
}) => {
    try {
        const user = await userModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        const {
            fullName,
            phone,
            city,
            district,
            ward,
            specificAddress,
            isDefault
        } = address;
        if (!fullName || !phone || !city || !district || !ward || !specificAddress) {
            throw new Error('Missing required address fields');
        }

        const fullAddress = `${specificAddress}, ${ward}, ${district}, ${city}`;

        // Add the new address with the full address to the user object
        user.usr_address.push({
            fullName,
            phone,
            city,
            district,
            ward,
            specificAddress,
            isDefault,
            fullAddress, // Store the full address
        });

        await user.save();
        return user.usr_address;
    } catch (error) {
        console.error("Error adding new address:", error);
        throw error;
    }
};

const getDefaultAddress = async ({
    id
}) => {
    try {
        const user = await userModel.findById(id); // Assuming 'User' is the model for the 'userSchema'
        if (!user) {
            throw new Error('User not found');
        }

        // Find the default address from the user's addresses
        const defaultAddress = user.usr_address.find(address => address.isDefault === true);

        if (!defaultAddress) {
            throw new Error('No default address found');
        }

        return defaultAddress; // Return the default address
    } catch (error) {
        console.error("Error fetching default address:", error);
        throw error;
    }
};


export {
    newUserService,
    checkLoginEmailTokenService,
    changePassWordService,
    findOrCreateUser,
    addNewAddress,
    getListAddress,
    getDefaultAddress
};