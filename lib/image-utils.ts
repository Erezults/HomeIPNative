import * as ImageManipulator from 'expo-image-manipulator'

const MAX_SIZE = 256
const COMPRESS_QUALITY = 0.8

export async function compressImage(uri: string): Promise<{ uri: string; type: string }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_SIZE, height: MAX_SIZE } }],
    { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.WEBP }
  )
  return { uri: result.uri, type: 'image/webp' }
}
