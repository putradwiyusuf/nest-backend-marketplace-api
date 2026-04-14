import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => {
                // kalau sudah dibungkus manual (hindari double wrap)
                if (this.isWrapped(data)) return data

                // pagination response
                if (this.isPaginated(data)) {
                    return {
                        success: true,
                        data: data.data,
                        meta: data.meta,
                    }
                }

                // default response
                return {
                    success: true,
                    data: data ?? null,
                    meta: null,
                }
            }),
        )
    }

    private isWrapped(data: any): boolean {
        return (
            data &&
            typeof data === 'object' &&
            'success' in data &&
            'data' in data
        )
    }

    private isPaginated(data: any): boolean {
        return (
            data &&
            typeof data === 'object' &&
            'data' in data &&
            'meta' in data &&
            Array.isArray(data.data)
        )
    }
}