import Joi from "joi";

export default class createUserDto {
    constructor(data) {
        this.usr_slug = data.slug;
        this.usr_name = data.name;
        this.usr_password = data.password;
        this.usr_email = data.email;
        this.usr_phone = data.phone;
        this.usr_sex = data.sex;
        this.usr_avatar = data.avatar;
        this.usr_date_of_birth = data.date_of_birth;
        this.usr_role = data.role;
        this.usr_isDefaultPassword = data.isDefaultPassword;
        this.usr_status = data.status;
    }

    static validate(data) {
        const schema = Joi.object({
            slug: Joi.string().required(),
            name: Joi.string().min(3).max(30).required(),
            password: Joi.string().min(6).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
            sex: Joi.string().valid("male", "female", "other").required(),
            avatar: Joi.string().uri().optional(),
            date_of_birth: Joi.date().less('now').required(),
            role: Joi.string().valid("admin", "user", "guest").required(),
            isDefaultPassword: Joi.boolean().required(),
            status: Joi.string().valid("active", "inactive").required(),
        });

        return schema.validate(data);
    }
}