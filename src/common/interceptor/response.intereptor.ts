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
                if (data?.success !== undefined) return data

                // 🔥 FIX: flatten kalau ada data + meta
                if (
                    data &&
                    typeof data === 'object' &&
                    'data' in data &&
                    'meta' in data
                ) {
                    return {
                        success: true,
                        data: data.data,
                        meta: data.meta,
                    }
                }

                return {
                    success: true,
                    data,
                    meta: null,
                }
            })
        )
    }
}