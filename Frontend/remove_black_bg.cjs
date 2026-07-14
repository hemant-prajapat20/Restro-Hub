const Jimp = require('jimp');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'logo.png');

Jimp.read(logoPath)
  .then(image => {
    // iterate through each pixel
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      // Calculate how close to black it is
      const dist = (red + green + blue) / 3;
      
      // If it is very dark (dist < 40), make it transparent
      if (dist < 40) {
        this.bitmap.data[idx + 3] = 0; // completely transparent
      } 
      // If it's near dark (anti-aliasing edges), make it partially transparent
      else if (dist < 80) {
        this.bitmap.data[idx + 3] = Math.floor(((dist - 40) / 40) * 255);
      }
    });
    
    // Save as logo.png
    return image.writeAsync(logoPath);
  })
  .then(() => {
    console.log("Successfully removed black background and saved logo.png");
  })
  .catch(err => {
    console.error("Error processing image:", err);
  });
