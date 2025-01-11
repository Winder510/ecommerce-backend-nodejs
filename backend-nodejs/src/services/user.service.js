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
                email: newUser.usr_email,
                phone: newUser.usr_phone,
                role: newUser.usr_role,
            },
            publicKey,
            privateKey,
        );

        // set cookies cho client
        res.cookie('refresh_token', tokens.refreshToken, {
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

    if (!match) throw new BadRequestError('Sai mật khẩu');

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

        user.usr_address.push({
            fullName,
            phone,
            city,
            district,
            ward,
            specificAddress,
            isDefault,
            fullAddress,
        });

        await user.save();
        return user.usr_address;
    } catch (error) {
        console.error("Error adding new address:", error);
        throw error;
    }
};

const updateAddress = async ({
    userId,
    addressId,
    updatedAddress
}) => {

    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const addressIndex = user.usr_address.findIndex(
        addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
        throw new Error('Address not found');
    }

    const {
        fullName,
        phone,
        city,
        district,
        ward,
        specificAddress,
        isDefault
    } = updatedAddress;
    console.log("🚀 ~ updatedAddress:", updatedAddress)

    if (!fullName || !phone || !city || !district || !ward || !specificAddress) {
        throw new Error('Missing required address fields');
    }

    const fullAddress = `${specificAddress}, ${ward}, ${district}, ${city}`;
    const newAddress = {
        fullName,
        phone,
        city,
        district,
        ward,
        specificAddress,
        isDefault,
        fullAddress,
        _id: addressId
    };

    if (isDefault) {
        user.usr_address.forEach(addr => {
            addr.isDefault = false;
        });
    }

    user.usr_address[addressIndex] = newAddress;

    await user.save();
    return user.usr_address;

};

const deleteAddress = async ({
    userId,
    addressId
}) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const addressIndex = user.usr_address.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        const isDefaultAddress = user.usr_address[addressIndex].isDefault;
        if (isDefaultAddress && user.usr_address.length > 1) {
            const newDefaultIndex = addressIndex === 0 ? 1 : 0;
            user.usr_address[newDefaultIndex].isDefault = true;
        }

        // Remove the address
        user.usr_address.splice(addressIndex, 1);

        await user.save();
        return user.usr_address;
    } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
};

const getDefaultAddress = async ({
    id
}) => {
    try {
        const user = await userModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        const defaultAddress = user.usr_address.find(address => address.isDefault === true);

        if (!defaultAddress) {
            throw new Error('No default address found');
        }

        return defaultAddress;
    } catch (error) {
        console.error("Error fetching default address:", error);
        throw error;
    }
};

const updateDefaultAddress = async ({
    userId,
    addressId
}) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const addressIndex = user.usr_address.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        user.usr_address.forEach(addr => {
            addr.isDefault = false;
        });

        user.usr_address[addressIndex].isDefault = true;

        await user.save();
        return user.usr_address;
    } catch (error) {
        console.error("Error updating default address:", error);
        throw error;
    }
};


const updateLoyaltyPoints = async (userId, points) => {
    try {

        const user = await userModel.findByIdAndUpdate(
            userId, {
                $inc: {
                    usr_loyalPoint: points
                }
            }, {
                new: true
            }
        );

        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        return {
            success: true,
            message: `Cộng ${points} điểm thành công.`,
            data: user,
        };
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật điểm: ${error.message}`);
    }
};

const resetLoyaltyPoints = async (userId) => {
    try {
        const user = await userModel.findByIdAndUpdate(
            userId, {
                usr_loyalPoint: 0
            }, {
                new: true
            }
        );

        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        return {
            success: true,
            message: 'Reset điểm loyalty thành công.',
            data: user,
        };
    } catch (error) {
        throw new Error(`Lỗi khi reset điểm: ${error.message}`);
    }
};

const updateProfileService = async ({
    id,
    usr_name,
    usr_phone,
    usr_email,
    usr_img,
    usr_sex,
    usr_date_of_birth
}) => {
    console.log("🚀 ~ id:", id)
    try {
        const user = await userModel.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        if (usr_name) user.usr_name = usr_name;
        if (usr_phone) user.usr_phone = usr_phone;
        if (usr_email) user.usr_email = usr_email;
        if (usr_img) user.usr_avatar = usr_img;
        if (usr_sex) user.usr_sex = usr_sex;
        if (usr_date_of_birth) user.usr_date_of_birth = usr_date_of_birth;
        await user.save();

        return {
            id: user._id,
            usr_name: user.usr_name,
            usr_phone: user.usr_phone,
            usr_email: user.usr_email,
            usr_avatar: user.usr_avatar,
            usr_sex: user.usr_sex,
            usr_date_of_birth: user.usr_date_of_birth,
        };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

const getListUser = async (filters) => {
    const {
        name,
        role,
        limit = 10,
        page = 1,
    } = filters;

    const query = {};
    if (name) {
        query.usr_name = {
            $regex: name,
            $options: 'i',
        };
    }
    if (role) {
        query.usr_role = role;
    }

    try {
        const skip = (page - 1) * limit;

        const users = await userModel
            .find(query)
            .populate('usr_role', 'rol_name')
            .skip(skip)
            .limit(limit);

        const totalResults = await userModel.countDocuments(query);

        return {
            users,
            pagination: {
                totalResults,
                totalPages: Math.ceil(totalResults / limit),
                currentPage: page,
            },
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users.');
    }
};

const changeUserStatus = async ({
    userId,
    status
}) => {
    if (!['active', 'block'].includes(status)) {
        throw new Error('Invalid status value');
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        userId, {
            usr_status: status
        }, {
            new: true
        }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
};

const changeUserRole = async ({
    userId,
    roleId
}) => {
    const updatedUser = await userModel.findByIdAndUpdate(
        userId, {
            usr_role: roleId
        }, {
            new: true
        }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
};

const getUserStats = async () => {
    try {
        const stats = await Promise.all([
            userModel.countDocuments(),
            // Active users count
            userModel.countDocuments({
                usr_status: 'active'
            }),
            // Blocked users count
            userModel.countDocuments({
                usr_status: 'block'
            }),
            // Users with Google login
            userModel.countDocuments({
                googleId: {
                    $exists: true,
                    $ne: null
                }
            }),
            // Users by gender
            userModel.aggregate([{
                $group: {
                    _id: '$usr_sex',
                    count: {
                        $sum: 1
                    }
                }
            }]),
            // Users registration by month (current year)
            userModel.aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(new Date().getFullYear(), 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $month: '$createdAt'
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ]),
            // Top users by loyal points
            userModel.find({
                usr_loyalPoint: {
                    $gt: 0
                }
            })
            .sort({
                usr_loyalPoint: -1
            })
            .limit(10)
            .select('usr_name usr_loyalPoint usr_email'),
            // Users by city
            userModel.aggregate([{
                    $unwind: '$usr_address'
                },
                {
                    $match: {
                        'usr_address.isDefault': true
                    }
                },
                {
                    $group: {
                        _id: '$usr_address.city',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 10
                }
            ])
        ]);

        const [
            totalUsers,
            activeUsers,
            blockedUsers,
            googleUsers,
            genderStats,
            monthlyRegistrations,
            topLoyalUsers,
            cityStats
        ] = stats;

        // Process monthly data to include all months
        const months = Array.from({
            length: 12
        }, (_, i) => i + 1);
        const monthlyData = months.map(month => {
            const found = monthlyRegistrations.find(item => item._id === month);
            return {
                month: new Date(0, month - 1).toLocaleString('default', {
                    month: 'long'
                }),
                count: found ? found.count : 0
            };
        });

        return {
            overview: {
                totalUsers,
                activeUsers,
                blockedUsers,
                googleUsers
            },
            genderDistribution: genderStats,
            monthlyRegistrations: monthlyData,
            topLoyalUsers,
            cityDistribution: cityStats
        };
    } catch (error) {
        throw new Error(`Error getting user statistics: ${error.message}`);
    }
}
export {
    newUserService,
    checkLoginEmailTokenService,
    changePassWordService,
    findOrCreateUser,
    addNewAddress,
    getListAddress,
    getDefaultAddress,
    updateLoyaltyPoints,
    resetLoyaltyPoints,
    updateProfileService,
    getListUser,
    changeUserStatus,
    changeUserRole,
    getUserStats,
    updateAddress,
    deleteAddress,
    updateDefaultAddress
};