import cloudinary from "./cloudinary.js";

async function test() {
  try {
    const result = await cloudinary.api.ping();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

test();