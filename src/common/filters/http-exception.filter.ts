import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let message = 'Internal server error'
        let errors = null

        // HANDLE NEST HTTP EXCEPTION
        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const res = exception.getResponse()

            if (typeof res === 'string') {
                message = res
            } else {
                const r = res as any
                message = r.message || message
                errors = r.errors || null
            }
        }

        // HANDLE PRISMA ERROR (basic safe mapping)
        if ((exception as any)?.code === 'P2002') {
            status = HttpStatus.CONFLICT
            message = 'Duplicate entry'
        }

        if ((exception as any)?.code === 'P2025') {
            status = HttpStatus.NOT_FOUND
            message = 'Record not found'
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }
}