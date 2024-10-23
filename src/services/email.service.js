import { transporter } from '../configs/nodemailer.config.js';
import { NotFoundError } from '../core/error.response.js';
import { replacePlaceHolder } from '../utils/index.js';
import { newOtp } from './otp.service.js';
import { getTemplate } from './template.service.js';

const sendEmailLinkVerify = async ({ html, toEmail, subject = 'Xác nhận đăng kí' }) => {
    try {
        await transporter.sendMail({
            from: '"Apple House" <hoangphonghp04@gmail.com>',
            to: toEmail,
            subject: subject,
            html: html,
        });
    } catch (error) {
        console.log(error);
    }
};

export const emailSendToken = async ({ email = null }) => {
    try {
        //get token
        const token = await newOtp({
            email,
        });

        // get email template
        const template = await getTemplate({
            name: 'HTML MAIL TOKEN',
        });

        if (!template) throw new NotFoundError('Error template');
        //send email

        const content = replacePlaceHolder({
            template: template.temp_html,
            params: {
                link_verify: `http://localhost:8000/api/v1/user/welcome?token=${token.otp_token}`,
            },
        });

        await sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui lòng xác định địa chỉ email đăng kí',
        });

        return 1;
    } catch (error) {
        console.log(error);
    }
};

export const emailRemindChangePassWord = async ({ receicedEmail, usr_name }) => {
    try {
        // get email template
        const template = await getTemplate({
            name: 'HTML MAIL REMIND',
        });

        console.log('template:: ', template);
        if (!template) throw new NotFoundError('Error template');

        const content = replacePlaceHolder({
            template: template.temp_html,
            params: {
                usr_name,
            },
        });

        await sendEmailLinkVerify({
            html: content,
            toEmail: receicedEmail,
            subject: 'Hi!',
        });

        return 1;
    } catch (error) {
        console.log(error);
    }
};
