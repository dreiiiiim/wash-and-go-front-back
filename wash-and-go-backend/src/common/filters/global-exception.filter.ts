import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      
      // Override standard 500 internal server error messages
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        return response.status(status).json({
          statusCode: status,
          message: "Sorry, we couldn't save your booking due to a database issue. Please try again in a few minutes.",
        });
      }
      
      // Return normal response for 4xx and other HttpExceptions
      return response.status(status).json(exception.getResponse());
    }

    // Unhandled exceptions (like generic Error) default to 500
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Sorry, we couldn't save your booking due to a database issue. Please try again in a few minutes.",
    });
  }
}
