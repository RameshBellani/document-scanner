import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'; // Ensure you have the lucide-react library installed

function DocumentScanner() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null); // State for captured image source
  const [previewUrl, setPreviewUrl] = useState(null); // State for uploaded file preview
  const [textOcr, setTextOcr] = useState(null); // State for OCR text
  const [load, setLoad] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [extractedData, setExtractedData] = useState(null); // State for extracted data

  const capture = useCallback(() => {
    setLoad(true);
    const imageSrc = webcamRef.current.getScreenshot(); // Capture screenshot from webcam
    const url = 'http://localhost:5000/capture'; // Replace with your API URL
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };
    const dataBody = { img: imageSrc };

    axios
      .post(url, dataBody, config)
      .then((res) => {
        setTextOcr(res.data.text); // Set OCR text from response
        setImgSrc(imageSrc); // Set captured image source
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
        setError('Error capturing image.');
        setLoad(false);
      });
  }, [webcamRef]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Set preview URL for uploaded file
      upload(file); // Call upload function
    }
  };

  const upload = (file) => {
    setLoad(true);
    const url = 'http://localhost:5000/upload'; // Replace with your API URL
    const formData = new FormData();
    formData.append('file', file); // Append file to FormData
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    axios
      .post(url, formData, config)
      .then((res) => {
        setTextOcr(res.data.text); // Set OCR text from response
        setExtractedData(res.data.extractedData); // Assuming your backend returns extracted data
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
        setError('Error uploading file.');
        setLoad(false);
      });
  };

  const extractInformation = () => {
    // Implement this function based on your backend API if needed
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Scanner</h1>
          <p className="text-gray-600">Upload a passport or driver's license to extract information</p>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="mx-auto mb-4"
            />
            <button
              onClick={capture}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Capture
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-4 mt-4"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <span className="text-gray-600">
                {previewUrl ? "Change image" : "Upload document image"}
              </span>
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>
              <button
                onClick={extractInformation}
                disabled={load}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {load ? <span>Processing...</span> : <><CheckCircle2 className="w-5 h-5" /><span>Extract Information</span></>}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {extractedData && (
            <div className="bg-green-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-2 text-green-600 mb-4">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Information Extracted</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span>Name:</span>
                  <span>{extractedData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Document Number:</span>
                  <span>{extractedData.documentNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Expiration Date:</span>
                  <span>{extractedData.expirationDate}</span>
                </div>
              </div>
            </div>
          )}

          {textOcr && imgSrc && (
            <div className="bg-yellow-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-2 text-yellow-600 mb-4">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Captured Image</span>
              </div>
              <img src={imgSrc} alt="Captured" className="w-full h-auto max-h-[400px] object-contain" />
              <div className="mt-4">
                <h2 className="font-medium">OCR Text:</h2>
                <p>{textOcr}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentScanner;


// import React, { useState, useEffect } from "react";
// import { Upload, Scan, AlertCircle, CheckCircle2 } from "lucide-react";

// const OCR_API_KEY = "K87752006488957"; 

// const DocumentScanner = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [extractedData, setExtractedData] = useState(null);
//   const [error, setError] = useState(null);

//   const handleFileSelect = (event) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const isValidImage = file.type.startsWith("image/");
//       if (!isValidImage) {
//         setError("Please upload a valid image file.");
//         return;
//       }
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setExtractedData(null);
//       setError(null);
//     }
//   };

//   const extractInformation = async () => {
//     if (!selectedFile) return;
  
//     setLoading(true);
//     setError(null);
  
//     const reader = new FileReader();
//     reader.onloadend = async () => {
//       const base64Image = reader.result.split(',')[1]; // Get base64 string without prefix
  
//       console.log("Selected file:", selectedFile);
//       console.log("File size in bytes:", selectedFile.size);
//       console.log("Selected file type:", selectedFile.type); // image/jpeg
  
//       try {
//         const fileType = selectedFile.type.split('/')[1]; // Extract the file extension (e.g., 'jpeg', 'png')
//         const requestBody = {
//           base64Image: `data:${selectedFile.type};base64,${base64Image}`, // Use the original file type
//           language: "eng",
//           filetype: fileType, // Use the extracted file type here
//         };
  
//         console.log("Request body:", requestBody); // Log the request body
  
//         const response = await fetch("https://api.ocr.space/parse/image", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "apikey": OCR_API_KEY,
//           },
//           body: JSON.stringify(requestBody),
//         });
  
//         const result = await response.json();
//         console.log("OCR API response:", result); // Log the full API response
  
//         if (result.OCRExitCode === 1) {
//           const text = result.ParsedResults[0].ParsedText;
//           console.log("Detected text:", text);
  
//           // Process detected text to extract information
//           const nameMatch = text.match(/name[:\s]+([A-Za-z\s]+)/i);
//           const documentMatch = text.match(/document\s*(?:no|number)[.:]\s*([A-Z0-9]+)/i);
//           const dateMatch = text.match(/expir\w+\s*date[:\s]+(\d{2}[/-]\d{2}[/-]\d{4})/i);
  
//           setExtractedData({
//             name: nameMatch ? nameMatch[1].trim() : null,
//             documentNumber: documentMatch ? documentMatch[1].trim() : null,
//             expirationDate: dateMatch ? dateMatch[1].trim() : null,
//           });
//         } else {
//           setError(`Failed to extract text from the image. Error code: ${result.OCRExitCode}. Reason: ${result.ErrorMessage || 'Unknown error.'}`);
//         }
//       } catch (err) {
//         console.error("Error during text recognition:", err);
//         setError("Failed to extract information. Please try again with a clearer image.");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     reader.onerror = (error) => {
//       console.error("Error reading file:", error);
//       setError("Failed to read the file.");
//       setLoading(false);
//     };
  
//     reader.readAsDataURL(selectedFile); // Convert to base64
//   };
  
  

//   useEffect(() => {
//     return () => {
//       if (previewUrl) URL.revokeObjectURL(previewUrl);
//     };
//   }, [previewUrl]);

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8">
//       <div className="bg-white rounded-xl shadow-lg p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             Document Scanner
//           </h1>
//           <p className="text-gray-600">
//             Upload a passport or driver's license to extract information
//           </p>
//         </div>

//         <div className="space-y-6">
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileSelect}
//               className="hidden"
//               id="file-upload"
//             />
//             <label
//               htmlFor="file-upload"
//               className="cursor-pointer flex flex-col items-center space-y-4"
//             >
//               <Upload className="w-12 h-12 text-gray-400" />
//               <span className="text-gray-600">
//                 {previewUrl ? "Change image" : "Upload document image"}
//               </span>
//             </label>
//           </div>

//           {previewUrl && (
//             <div className="space-y-6">
//               <div className="relative rounded-lg overflow-hidden">
//                 <img
//                   src={previewUrl}
//                   alt="Document preview"
//                   className="w-full h-auto max-h-[400px] object-contain"
//                 />
//               </div>

//               <button
//                 onClick={extractInformation}
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//                     <span>Processing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Scan className="w-5 h-5" />
//                     <span>Extract Information</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           )}

//           {error && (
//             <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
//               <AlertCircle className="w-5 h-5" />
//               <span>{error}</span>
//             </div>
//           )}

//           {extractedData && (
//             <div className="bg-green-50 rounded-lg p-6 space-y-4">
//               <div className="flex items-center space-x-2 text-green-600 mb-4">
//                 <CheckCircle2 className="w-6 h-6" />
//                 <span className="font-medium">Information Extracted</span>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center py-2 border-b border-green-100">
//                   <span className="text-gray-600">Name</span>
//                   <span className="font-medium">
//                     {extractedData.name || "Not found"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center py-2 border-b border-green-100">
//                   <span className="text-gray-600">Document Number</span>
//                   <span className="font-medium">
//                     {extractedData.documentNumber || "Not found"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center py-2">
//                   <span className="text-gray-600">Expiration Date</span>
//                   <span className="font-medium">
//                     {extractedData.expirationDate || "Not found"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentScanner;

