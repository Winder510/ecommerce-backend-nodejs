import mongoose from 'mongoose';

const _SECONDS = 5000;
// count Connect
const countConnect = () => {
    const numConnection = mongoose.connections.length;
};

// check overload

module.exports = {
    countConnect,
};
