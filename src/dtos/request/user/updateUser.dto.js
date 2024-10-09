import createUserDto from "./createUser.dto";

export class updateUserDto extends createUserDto {
    // Override the validate method
    static validate(data) {
        const schema = this.getSchema().fork( // fork help helps you reuse the schema but allows editing of fields without redefining the entire schema.
            ['slug', 'name', 'password', 'phone', 'sex', 'avatar', 'date_of_birth', 'usr_role', 'isDefaultPassword', 'status'],
            (field) => field.optional()
        );
        return schema.validate(data);
    }
}