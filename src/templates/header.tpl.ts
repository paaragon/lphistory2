import ConsumerInfoI from '../interfaces/ConsumerInfoI';

export default function (consumerInfo: ConsumerInfoI, lineLength: number) {
    let ret = `==================================== CONSUMER INFO ====================================>\n`;

    if (consumerInfo.firstName && consumerInfo.firstName !== 'undefined') {
        ret += `${'    First Name:'.yellow} ${consumerInfo.firstName}\n`;
    }
    if (consumerInfo.lastName && consumerInfo.lastName !== 'undefined') {
        ret += `${'    Last name:'.yellow} ${consumerInfo.lastName}\n`;
    }
    if (consumerInfo.email && consumerInfo.email !== 'undefined') {
        ret += `${'    Email:'.yellow} ${consumerInfo.email}\n`;
    }
    if (consumerInfo.phone && consumerInfo.phone !== 'undefined') {
        ret += `${'    Phone:'.yellow} ${consumerInfo.phone}\n`;
    }

    return `${ret}\n`;
}