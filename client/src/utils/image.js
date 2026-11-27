// Resizes a photo to at most `maxSize` pixels on its longest side and returns it as a JPEG file (Blob).
// Keeps the demo's uploaded photos small; the backend may resize on its side instead.
export function compressImage(file, maxSize = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`${file.name} could not be read as an image.`))
    }
    image.src = objectUrl
  })
}
