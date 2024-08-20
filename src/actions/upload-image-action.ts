'use server';

import { actionClient } from '@/lib/safe-action';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { z } from 'zod';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FormDataSchema = z.object({
  image: z.instanceof(FormData),
});

export const uploadImageAction = actionClient.schema(FormDataSchema).action(async ({ parsedInput: { image } }) => {
  const formImage = image.get('image');

  if (!formImage || !image) return { error: 'No image provided' };

  const file = formImage as File;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            upload_preset: 'ml_default',
          },
          function (error, result) {
            if (error) {
              reject({ error });
              return;
            }

            resolve({ result });
          }
        )
        .end(buffer);
    });
  } catch (error) {
    return { error };
  }
});
