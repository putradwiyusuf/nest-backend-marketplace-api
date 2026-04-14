import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => {
                // kalau sudah ada success, biarkan
                if (data?.success !== undefined) return data

                return {
                    success: true,
                    data,
                    meta: null,
                }
            }),
        )
    }
}