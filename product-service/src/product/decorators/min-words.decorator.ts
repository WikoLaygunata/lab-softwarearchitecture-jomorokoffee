import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsMinWords(minWords: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMinWords',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minWords],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const words = value.trim().split(/\s+/); // Memisahkan kalimat berdasarkan spasi
          return words.length >= args.constraints[0]; // Cek jumlah kata
        },
      },
    });
  };
}