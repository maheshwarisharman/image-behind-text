
import React, { useState, useEffect, useRef } from "react";
import { removeBackground } from "@imgly/background-removal";

import { GoogleGenerativeAI } from "@google/generative-ai";



const BackgroundRemover = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [text, setText] = useState("Your Text");
  const [xaxis, setXAxis] = useState(0);
  const [yaxis, setYAxis] = useState(0);
  const [fontsize, setFontSize] = useState("36px");

  const [isLoading, setLoader] = useState(false);



  const canvasRef = useRef(null);

  const genAI = new GoogleGenerativeAI('AIzaSyAp4x89gg-5zsPDU7w3yoDkSy9Q1S-gaPY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" , generationConfig: {"response_mime_type": "application/json"}});

  const handleImageUpload = (event) => {

    setLoader(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      console.log("HHEJEJEJE");
      reader.onloadend = async () => {

        
        const prompt = `Given an image and a text string, determine the best large font size and optimal placement (x, y) for visually impactful text overlay. The text should be prominent and bold, occupying a significant portion of the image while ensuring readability and aesthetic balance. Consider the following:

Font Size:

The text should be very large, taking up 30-50% of the image width depending on the text length.
Prioritize bold and eye-catching text similar to modern posters and magazine covers.
Ensure scalability—adjust for different image resolutions.
Placement (x, y):

Center the text for maximum attention OR place it in a visually balanced area based on background elements.
The text should not be pushed to the corners unless necessary.
Styling Considerations:

Ensure strong contrast between the text and background for high readability.
Allow for slight overlap with subjects if it enhances the composition.
Use dynamic positioning (top, middle, or bottom) depending on the image structure.
Return the font size , x-coordinate, and y-coordinate in a strictly structured JSON object  format just like this:
IMPORTANT: The output should be a JSON array
{
  "font_size": 120,
  "x": 100,
  "y": 250
      }
  
`;

   const image = {
   inlineData: {
     data: reader.result.split(",")[1],
     mimeType: "image/jpg",
   },
 };
 
 const result = await model.generateContent([prompt, image]);
 let res = JSON.parse(((result.response.text())));
 console.log(res);
 setFontSize(res.font_size.toString() + "px" || "50px");
 setXAxis(Number(res.x));
 setYAxis(Number(res.y));

 console.log(yaxis, xaxis, fontsize)


        const imageData = reader.result;
        setImage(imageData);
        const bgRemoved = await removeBackground(imageData);
        const url = URL.createObjectURL(bgRemoved);
        setProcessedImage(url);
        console.log("hJJKE");

        setLoader(false);

        
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCanvasAsImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "processed-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    if (image && processedImage) {
      console.log(xaxis, yaxis, fontsize);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const originalImg = new Image();
      const removedBgImg = new Image();
      
      originalImg.src = image;
      removedBgImg.src = processedImage;
      
      originalImg.onload = () => {
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;
        ctx.drawImage(originalImg, 0, 0);
        
        ctx.font = `bold ${fontsize} Helvetica`;
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(text, xaxis, yaxis);
        
        removedBgImg.onload = () => {
          ctx.drawImage(removedBgImg, 0, 0);
        };
      };
    }
  }, [image, processedImage, text, xaxis, yaxis, fontsize]);

  return (
    <div>
    {isLoading ? <div>Loading </div> : ( <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-4 p-2 border rounded"
        placeholder="Enter text"
      />
      <canvas ref={canvasRef} className="border" width={100}/>

      <button onClick={downloadCanvasAsImage} className="mt-4 p-2 bg-blue-500 text-white rounded">Download Image</button>


      <div className="flex flex-col items-center gap-6 p-6">


      {/* X-Axis Slider */}
      <div className="w-full max-w-md">
        <label className="block font-bold">X Position: {xaxis}px</label>
        <input
          type="range"
          min="0"
          max="1000"
          value={Number(xaxis)}
          onChange={(e) => setXAxis(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Y-Axis Slider */}
      <div className="w-full max-w-md">
        <label className="block font-bold">Y Position: {yaxis}px</label>
        <input
          type="range"
          min="0"
          max="1500"
          value={Number(yaxis)}
          onChange={(e) => setYAxis(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>
    </div>


    </div>)}
   
    </div>
  );
};

export default BackgroundRemover;