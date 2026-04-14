export function success(data: any, meta?: any) {
    return {
        success: true,
        data,
        meta: meta ?? null,
    }
}

export function message(msg: string) {
    return {
        success: true,
        message: msg,
    }
}

export function error(msg: string) {
    return {
        success: false,
        message: msg,
    }
}