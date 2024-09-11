const StatusCode = {
    OK: 200,
    CREATED: 201
}
const ReasonStatusCode = {
    CREATED: "Created",
    OK: "OK"
}

export class SuccessResponse {
    constructor({
        message,
        status = StatusCode.OK,
        metadata
    }) {
        this.message = message
        this.status = status;
        this.metadata = metadata
    }
    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}
export class Ok extends SuccessResponse {
    constructor({
        message,
        metadata
    }) {
        super({
            message,
            metadata
        })
    }

}
export class CREATED extends SuccessResponse {
    constructor({
        message,
        status = StatusCode.OK,
        metadata
    }) {
        super({
            message,
            status,
            metadata
        })
    }

}