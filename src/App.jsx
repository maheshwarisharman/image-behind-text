
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


  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;


  const canvasRef = useRef(null);

  const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" , generationConfig: {"response_mime_type": "application/json"}});

  const handleImageUpload = (event) => {

    setLoader(true);
    const file = event.target.files[0];
    
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      let width = "0";
      let height = "0"

      img.onload = () => {
      width = img.width
      height = img.height
    }
 

      const reader = new FileReader();
      console.log("HHEJEJEJE");
      reader.onloadend = async () => {

        
        const prompt = `

Given an image and a text string, determine the best font size and placement (x, y) for optimal readability and aesthetic appeal. Consider the following:

the text is ${text}

The TEXT will go behind the main subject or the main object and in front of the background. So basically the Text will be in between background and subject.

Resolution of the Image: ${width} x ${height} px

Font Size:

The text should be very large, taking up 100-120% of the image width depending on the text length.

Placement (x, y):
DO NOT GIVE ANY NEGATIVE and 0 VALUES
Position the Text on Top of the subject so that it only goes slightly behind the subject
Align the text based Centred for the symmetry.
Center the text horizontally, and adjust vertically to fit the empty or less busy areas of the background.
IMPORTANT: make sure text is only 95% visible and rest is set behind the image

CENTER THE TEXT HORIZONTALLY.

Cordinates Parameter:
Remember x coordinate and y coordinate which you mention, the text will start from there.

IMPORTANT: The output should be a JSON object
{
  "font_size": 120,
  "x": 100,
  "y": 250,
  "color": #ffffff
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
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, xaxis, yaxis);
        
        removedBgImg.onload = () => {
          ctx.drawImage(removedBgImg, 0, 0);
        };
      };
    }
  }, [image, processedImage, text, xaxis, yaxis, fontsize]);

  const changeSize = () => {
    setFontSize("200px")
  }
 
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

      <button onClick={changeSize}>CCCC</button>

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