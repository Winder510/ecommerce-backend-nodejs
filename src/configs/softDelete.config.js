import mongooseDelete from 'mongoose-delete'

export const globalSoftDeletePlugin = (schema, options) => {
    schema.plugin(mongooseDelete, {
        deletedAt: true,
        overrideMethods: true,
    });
};