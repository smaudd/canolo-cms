import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// TODO: Look for ffmpeg type definitions
let ffmpeg: null | any = null;

export const initializeFFMPEG = async () => {
  ffmpeg = createFFmpeg({
    log: true,
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  });
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
};

interface Resize {
  file: File;
  size: { width: number; height: number };
  hash: string
}

interface ResizedImage {
  images: Array<File>;
  name: string;
}

function toHash(hashBuffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); //
  return hashHex
}

export const resizeBatch = async (file: File): Promise<any> => {
  // Available sizes to resize
  const sizes = [300, 500, 1000, 1500, 2500];
  const resizedImages = [];
  // Hash file to get unique id
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hash = toHash(hashBuffer)
  try {
    for await (let size of sizes) {
      const resized = await resize({
        file,
        size: { width: size, height: -1 },
        hash,
      });
      resizedImages.push(resized);
    }
    return { images: resizedImages, name: `${hash}.png` };
  } catch (err) {
    alert(err);
   // return null
  }
};

const download = (file: File): void => {
  const link = document.createElement("a");
  link.setAttribute("download", file.name);
  link.setAttribute("href", URL.createObjectURL(file));
  link.setAttribute("target", "_blank");
  link.click();
};

const resize = async ({ file, size, hash }: Resize): Promise<any> => {
  try {
    const { name } = file;
    ffmpeg.FS("writeFile", name, await fetchFile(file));
    await ffmpeg.run(
      "-i",
      name,
      "-vf",
      `scale=${size.width}:${size.height || -1}`,
      "output.png"
    );
    const data = ffmpeg.FS("readFile", "output.png");
    const resizedFile = new File(
      [data.buffer],
      `${hash}.png`,
      {
        type: "image/png",
      }
    );
    ffmpeg.FS("unlink", "output.png");
    return resizedFile;
  } catch (err) {
    alert(err);
    return err;
  //  return null;
  }
};
