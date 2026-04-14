export const successResponse = (data: any, meta = null) => ({
    success: true,
    data,
    meta,
})

export const errorResponse = (message: string) => ({
    success: false,
    message,
})