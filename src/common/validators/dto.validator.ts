import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 *
 * Validate the payload will be sending or receiving, make sure the data is suitable
 *
 * @param dto The DTO object to validate
 * @param obj The object received from request body
 *
 * @example
 * ```ts
 *  await dtoValidator(userDto, req.body);
 *
 * ```
 */

export const dtoValidator = async <T extends ClassConstructor<any>>(
  dto: T,
  obj: Object,
): Promise<any> => {
  // tranform the literal object to class object
  const objInstance = plainToInstance(dto, obj);
  // validating and check the errors, throw the errors if exist
  const errors = await validate(objInstance);
  // errors is an array of validation errors
  if (errors.length > 0) {
    console.log(errors[0]);
    throw new BadRequestException(
      `Validation failed. The error fields : ${errors.map(
        ({ property, constraints }) =>
          `${property}: [${Object.values(constraints)}]`,
      )}`,
    );
  }
  return objInstance;
};
